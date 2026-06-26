import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const inputDir = process.argv[2] ?? 'reports/engines'
const outputDir = 'reports'
const outputJson = join(outputDir, 'performance-summary.json')
const outputMd = join(outputDir, 'performance-summary.md')

const reports = findReportFiles(inputDir)
  .map(file => JSON.parse(readFileSync(file, 'utf8')))
  .sort((a, b) => a.engine.name.localeCompare(b.engine.name))

if (reports.length === 0) {
  throw new Error(`No se encontraron reportes de rendimiento en ${inputDir}`)
}

const summary = buildSummary(reports)

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputJson, `${JSON.stringify(summary, null, 2)}\n`)
writeFileSync(outputMd, renderMarkdown(summary))

console.log(renderConsoleSummary(summary))

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, renderMarkdown(summary))
}

if (!summary.passed) {
  throw new Error(`Resumen de rendimiento fallido: ${summary.failures.join('; ')}`)
}

function findReportFiles(dir) {
  if (!existsSync(dir)) return []

  const files = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findReportFiles(fullPath))
      continue
    }

    if (entry.isFile() && entry.name === 'performance-report.json') {
      files.push(fullPath)
    }
  }

  return files
}

function buildSummary(reports) {
  const passed = reports.every(report => report.passed)
  const failures = reports.flatMap(report =>
    report.failures.map(failure => `${report.engine.name}: ${failure}`)
  )
  const engines = reports.map(report => ({
    key: report.engine.key,
    name: report.engine.name,
    status: report.passed ? 'PASS' : 'FAIL',
    totalQueries: report.metrics.totalQueries,
    concurrency: report.settings.concurrency,
    avgLatencyMs: report.metrics.avgLatencyMs,
    p95LatencyMs: report.metrics.p95LatencyMs,
    maxLatencyMs: report.metrics.maxLatencyMs,
    tps: report.metrics.tps,
    errorRate: report.metrics.errorRate,
  }))

  return {
    generatedAt: new Date().toISOString(),
    passed,
    engines,
    totals: {
      engines: engines.length,
      totalQueries: sum(engines, 'totalQueries'),
      avgLatencyMs: average(engines.map(engine => engine.avgLatencyMs)),
      avgTps: average(engines.map(engine => engine.tps)),
      maxP95LatencyMs: Math.max(...engines.map(engine => engine.p95LatencyMs)),
      maxErrorRate: Math.max(...engines.map(engine => engine.errorRate)),
    },
    best: {
      tps: maxBy(engines, 'tps'),
      latency: minBy(engines, 'avgLatencyMs'),
    },
    worst: {
      tps: minBy(engines, 'tps'),
      latency: maxBy(engines, 'avgLatencyMs'),
    },
    failures,
  }
}

function renderMarkdown(summary) {
  const status = summary.passed ? 'PASS' : 'FAIL'
  const rows = summary.engines.map(engine => [
    engine.name,
    engine.status,
    `${format(engine.avgLatencyMs)} ms`,
    `${format(engine.p95LatencyMs)} ms`,
    `${format(engine.maxLatencyMs)} ms`,
    format(engine.tps),
    formatPercent(engine.errorRate),
    String(engine.totalQueries),
  ])

  return `# Consolidated Performance Report

**Status:** ${status}

| Engine | Status | Avg latency | P95 latency | Max latency | TPS | Error rate | Queries |
|---|---:|---:|---:|---:|---:|---:|---:|
${rows.map(row => `| ${row.join(' | ')} |`).join('\n')}

## Highlights

- Engines tested: ${summary.totals.engines}
- Total queries: ${summary.totals.totalQueries}
- Average latency across engines: ${format(summary.totals.avgLatencyMs)} ms
- Average TPS across engines: ${format(summary.totals.avgTps)}
- Best TPS: ${summary.best.tps.name} (${format(summary.best.tps.tps)})
- Lowest average latency: ${summary.best.latency.name} (${format(summary.best.latency.avgLatencyMs)} ms)
- Highest average latency: ${summary.worst.latency.name} (${format(summary.worst.latency.avgLatencyMs)} ms)

${summary.failures.length > 0 ? `## Failures\n\n${summary.failures.map(item => `- ${item}`).join('\n')}\n` : 'No threshold violations detected.\n'}
`
}

function renderConsoleSummary(summary) {
  return [
    `Consolidated performance status: ${summary.passed ? 'PASS' : 'FAIL'}`,
    `Engines tested: ${summary.totals.engines}`,
    `Total queries: ${summary.totals.totalQueries}`,
    `Average latency: ${format(summary.totals.avgLatencyMs)}ms`,
    `Average TPS: ${format(summary.totals.avgTps)}`,
    `Report: ${outputMd}`,
  ].join('\n')
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] ?? 0), 0)
}

function average(values) {
  return values.length === 0 ? 0 : sum(values.map(value => ({ value })), 'value') / values.length
}

function maxBy(items, key) {
  return [...items].sort((a, b) => Number(b[key]) - Number(a[key]))[0]
}

function minBy(items, key) {
  return [...items].sort((a, b) => Number(a[key]) - Number(b[key]))[0]
}

function format(value) {
  return Number(value).toFixed(2)
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(2)}%`
}
