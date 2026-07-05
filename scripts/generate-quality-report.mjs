import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const reportsDir = path.join(root, 'reports')
const unitResultsPath = path.join(reportsDir, 'unit', 'results.json')
const coverageSummaryPath = path.join(reportsDir, 'coverage', 'coverage-summary.json')

const readJson = async (filePath, fallback) => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

const pct = (value) => `${Number(value ?? 0).toFixed(2)}%`

const unitResults = await readJson(unitResultsPath, {})
const coverage = await readJson(coverageSummaryPath, {})
const total = coverage.total ?? {}

const stats = {
  total: unitResults.numTotalTests ?? 0,
  passed: unitResults.numPassedTests ?? 0,
  failed: unitResults.numFailedTests ?? 0,
  suites: unitResults.numTotalTestSuites ?? 0,
}

const generatedAt = new Date().toLocaleString('es-PE')

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reportes de Calidad</title>
  <style>
    body {
      color: #111827;
      font-family: Georgia, "Times New Roman", serif;
      margin: 24px;
      max-width: 920px;
    }

    h1 {
      font-size: 32px;
      margin: 0 0 18px;
    }

    h2 {
      border-bottom: 1px solid #d1d5db;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 18px;
      margin-top: 28px;
      padding-bottom: 6px;
    }

    ul {
      font-size: 16px;
      line-height: 1.5;
    }

    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      margin: 18px 0;
    }

    .metric {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: Arial, Helvetica, sans-serif;
      padding: 12px;
    }

    .metric strong {
      display: block;
      font-size: 24px;
    }

    .ok {
      color: #166534;
    }

    .bad {
      color: #991b1b;
    }
  </style>
</head>
<body>
  <h1>Reportes de Calidad</h1>
  <ul>
    <li><a href="./coverage/index.html">Reporte de Cobertura (Vitest)</a></li>
    <li><a href="./unit/results.json">Reporte JSON de Pruebas Unitarias</a></li>
    <li><a href="./unit/junit.xml">Reporte JUnit de Pruebas Unitarias</a></li>
  </ul>

  <h2>Resumen</h2>
  <div class="grid">
    <div class="metric"><strong>${stats.total}</strong> pruebas</div>
    <div class="metric"><strong class="ok">${stats.passed}</strong> aprobadas</div>
    <div class="metric"><strong class="${stats.failed > 0 ? 'bad' : 'ok'}">${stats.failed}</strong> fallidas</div>
    <div class="metric"><strong>${stats.suites}</strong> suites</div>
  </div>

  <h2>Cobertura</h2>
  <div class="grid">
    <div class="metric"><strong>${pct(total.lines?.pct)}</strong> lineas</div>
    <div class="metric"><strong>${pct(total.statements?.pct)}</strong> sentencias</div>
    <div class="metric"><strong>${pct(total.functions?.pct)}</strong> funciones</div>
    <div class="metric"><strong>${pct(total.branches?.pct)}</strong> ramas</div>
  </div>

  <p>Generado: ${generatedAt}</p>
</body>
</html>
`

await fs.mkdir(reportsDir, { recursive: true })
await fs.writeFile(path.join(reportsDir, 'index.html'), html, 'utf8')
console.log('Reporte generado: reports/index.html')
