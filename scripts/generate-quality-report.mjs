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
const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const unitResults = await readJson(unitResultsPath, {})
const coverage = await readJson(coverageSummaryPath, {})
const total = coverage.total ?? {}
const testSuites = unitResults.testResults ?? []

const stats = {
  total: unitResults.numTotalTests ?? 0,
  passed: unitResults.numPassedTests ?? 0,
  failed: unitResults.numFailedTests ?? 0,
  suites: unitResults.numTotalTestSuites ?? 0,
}

const generatedAt = new Date().toLocaleString('es-PE')
const testRows = testSuites
  .flatMap((suite) =>
    (suite.assertionResults ?? []).map((test) => ({
      file: path.relative(root, suite.name ?? '').replaceAll('\\', '/'),
      suite: (test.ancestorTitles ?? []).join(' > '),
      title: test.title ?? test.fullName ?? '',
      status: test.status ?? suite.status ?? 'unknown',
      duration: Number(test.duration ?? 0),
    })),
  )

const sharedStyles = `
  body {
    color: #111827;
    font-family: Georgia, "Times New Roman", serif;
    margin: 24px;
    max-width: 980px;
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

  table {
    border-collapse: collapse;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    width: 100%;
  }

  th, td {
    border: 1px solid #d1d5db;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: #f3f4f6;
  }

  code {
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 12px;
    padding: 2px 4px;
  }

  .ok {
    color: #166534;
    font-weight: 700;
  }

  .bad {
    color: #991b1b;
    font-weight: 700;
  }
`

const unitHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reporte de Pruebas Unitarias</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <h1>Reporte de Pruebas Unitarias</h1>
  <p><a href="../index.html">Volver a reportes de calidad</a></p>

  <h2>Resumen</h2>
  <div class="grid">
    <div class="metric"><strong>${stats.total}</strong> pruebas</div>
    <div class="metric"><strong class="ok">${stats.passed}</strong> aprobadas</div>
    <div class="metric"><strong class="${stats.failed > 0 ? 'bad' : 'ok'}">${stats.failed}</strong> fallidas</div>
    <div class="metric"><strong>${stats.suites}</strong> suites</div>
  </div>

  <h2>Detalle</h2>
  <table>
    <thead>
      <tr>
        <th>Estado</th>
        <th>Suite</th>
        <th>Prueba</th>
        <th>Archivo</th>
        <th>Duracion</th>
      </tr>
    </thead>
    <tbody>
      ${testRows.map((test) => `
      <tr>
        <td class="${test.status === 'passed' ? 'ok' : 'bad'}">${escapeHtml(test.status)}</td>
        <td>${escapeHtml(test.suite)}</td>
        <td>${escapeHtml(test.title)}</td>
        <td><code>${escapeHtml(test.file)}</code></td>
        <td>${test.duration.toFixed(2)} ms</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h2>Artefactos tecnicos</h2>
  <ul>
    <li><a href="./results.json">JSON para integraciones</a></li>
    <li><a href="./junit.xml">JUnit XML para CI/CD</a></li>
  </ul>

  <p>Generado: ${generatedAt}</p>
</body>
</html>
`

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reportes de Calidad</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <h1>Reportes de Calidad</h1>
  <ul>
    <li><a href="./coverage/index.html">Reporte de Cobertura (Vitest)</a></li>
    <li><a href="./unit/index.html">Reporte de Pruebas Unitarias</a></li>
    <li><a href="./unit/results.json">JSON tecnico de pruebas</a></li>
    <li><a href="./unit/junit.xml">JUnit XML tecnico</a></li>
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
await fs.mkdir(path.join(reportsDir, 'unit'), { recursive: true })
await fs.writeFile(path.join(reportsDir, 'index.html'), html, 'utf8')
await fs.writeFile(path.join(reportsDir, 'unit', 'index.html'), unitHtml, 'utf8')
console.log('Reporte generado: reports/index.html')
