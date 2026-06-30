import { cpSync, rmSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')
const mediaDir = join(root, 'vscode-extension', 'media')

if (!existsSync(distDir)) {
  console.error('Error: dist/ no encontrado. Ejecuta "npm run build" primero.')
  process.exit(1)
}

rmSync(mediaDir, { recursive: true, force: true })
mkdirSync(mediaDir, { recursive: true })
cpSync(distDir, mediaDir, { recursive: true })

console.log('✓ dist/ copiado a vscode-extension/media/')
console.log('')
console.log('Próximos pasos para empaquetar:')
console.log('  cd vscode-extension')
console.log('  npm install')
console.log('  npm run compile')
console.log('  npx vsce package')
