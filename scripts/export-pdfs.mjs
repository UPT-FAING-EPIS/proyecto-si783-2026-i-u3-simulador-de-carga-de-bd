import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import MarkdownIt from "markdown-it";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const outputDir = path.join(root, "output", "pdf");
const htmlDir = path.join(root, "tmp", "pdf-html");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const mermaidEntry = path.join(root, "node_modules", "mermaid", "dist", "mermaid.esm.min.mjs");

const inputFiles = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "FD01-Informe-Factibilidad.md",
      "FD02-Informe-Vision.md",
      "FD03-Informe-Especificacion-Requerimientos.md",
      "FD04-Informe-Arquitectura-Software.md",
      "FD05-Informe-Proyecto-Final.md",
    ];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
});

const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const language = token.info.trim().split(/\s+/)[0].toLowerCase();

  if (language === "mermaid") {
    return `<div class="diagram"><div class="mermaid">${escapeHtml(token.content)}</div></div>`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex("src");

  if (srcIndex >= 0) {
    const src = token.attrs[srcIndex][1];
    const isExternal = /^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith("data:");

    if (!isExternal) {
      const imagePath = path.resolve(env.sourceDir, src);
      token.attrs[srcIndex][1] = pathToFileURL(imagePath).href;
    }
  }

  return defaultImage(tokens, idx, options, env, self);
};

const normalizeMarkdown = (source) =>
  source
    .replaceAll("../media/", "media/")
    .replace(/<div style="page-break-after:\s*always;[^>]*>\\pagebreak<\/div>/gi, '<div class="page-break"></div>');

const pageTemplate = ({ title, body }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      color: #172033;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      margin: 0;
    }

    h1, h2, h3, h4 {
      color: #111827;
      line-height: 1.2;
      margin: 18pt 0 8pt;
      page-break-after: avoid;
    }

    h1 {
      border-bottom: 1px solid #cbd5e1;
      font-size: 21pt;
      padding-bottom: 8pt;
    }

    h2 {
      border-bottom: 1px solid #d8dee8;
      font-size: 16pt;
      padding-bottom: 5pt;
    }

    h3 {
      font-size: 13pt;
    }

    h4 {
      font-size: 11.5pt;
    }

    p, ul, ol, table, pre, blockquote {
      margin: 0 0 9pt;
    }

    ul, ol {
      padding-left: 20pt;
    }

    li {
      margin: 2pt 0;
    }

    a {
      color: #1d4ed8;
      text-decoration: none;
    }

    img {
      display: block;
      max-height: 58mm;
      max-width: 100%;
      object-fit: contain;
    }

    table {
      border-collapse: collapse;
      font-size: 9.3pt;
      page-break-inside: auto;
      width: 100%;
    }

    tr {
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 5pt 6pt;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #eef2f7;
      color: #111827;
      font-weight: 700;
    }

    code {
      background: #f4f6f9;
      border-radius: 3px;
      color: #111827;
      font-family: Consolas, "Courier New", monospace;
      font-size: 9pt;
      padding: 1pt 3pt;
    }

    pre {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow-wrap: anywhere;
      padding: 8pt;
      white-space: pre-wrap;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    blockquote {
      border-left: 3px solid #94a3b8;
      color: #475569;
      margin-left: 0;
      padding-left: 10pt;
    }

    .page-break {
      break-after: page;
      page-break-after: always;
    }

    .diagram {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      margin: 10pt 0 14pt;
      overflow: hidden;
      padding: 8pt;
      page-break-inside: avoid;
      text-align: center;
    }

    .diagram svg {
      display: block;
      height: auto !important;
      margin: 0 auto;
      max-height: 220mm;
      max-width: 100% !important;
      width: auto !important;
    }

    .diagram .error-icon,
    .diagram .error-text {
      display: none;
    }
  </style>
</head>
<body>
  <main>
    ${body}
  </main>
  <script type="module">
    import mermaid from "${pathToFileURL(mermaidEntry).href}";

    window.__MERMAID_READY__ = false;
    window.__MERMAID_ERRORS__ = [];

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      htmlLabels: true,
      theme: "base",
      themeVariables: {
        primaryColor: "#e8f1ff",
        primaryBorderColor: "#2563eb",
        primaryTextColor: "#111827",
        lineColor: "#475569",
        secondaryColor: "#ecfdf5",
        tertiaryColor: "#fff7ed",
        fontFamily: "Arial, Helvetica, sans-serif"
      }
    });

    try {
      await mermaid.run({ querySelector: ".mermaid" });
      window.__MERMAID_READY__ = true;
    } catch (error) {
      window.__MERMAID_ERRORS__.push(error && error.message ? error.message : String(error));
      window.__MERMAID_READY__ = true;
    }
  </script>
</body>
</html>
`;

const ensureFileExists = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`No se encontro el archivo requerido: ${filePath}`);
  }
};

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  args: [
    "--allow-file-access-from-files",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-sandbox",
  ],
});

try {
  await ensureFileExists(chromePath);
  await ensureFileExists(mermaidEntry);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(htmlDir, { recursive: true });

  for (const input of inputFiles) {
    const markdownPath = path.resolve(root, input);
    await ensureFileExists(markdownPath);

    const basename = path.basename(input, path.extname(input));
    const htmlPath = path.join(htmlDir, `${basename}.html`);
    const pdfPath = path.join(outputDir, `${basename}.pdf`);
    const markdown = normalizeMarkdown(await fs.readFile(markdownPath, "utf8"));
    const body = md.render(markdown, { sourceDir: path.dirname(markdownPath) });

    await fs.writeFile(htmlPath, pageTemplate({ title: basename, body }), "utf8");

    const page = await browser.newPage();
    page.setDefaultTimeout(120000);
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.waitForFunction("window.__MERMAID_READY__ === true");

    const errors = await page.evaluate("window.__MERMAID_ERRORS__");
    if (errors.length > 0) {
      throw new Error(`${input} contiene errores Mermaid: ${errors.join("; ")}`);
    }

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        '<div style="font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #64748b; width: 100%; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: {
        top: "18mm",
        right: "16mm",
        bottom: "18mm",
        left: "16mm",
      },
    });
    await page.close();

    console.log(`PDF generado: ${path.relative(root, pdfPath)}`);
  }
} finally {
  await browser.close();
}
