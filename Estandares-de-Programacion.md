![Logo](../media/logo-upt.png)

# UNIVERSIDAD PRIVADA DE TACNA

## FACULTAD DE INGENIERIA

### Escuela Profesional de Ingenieria de Sistemas

---

# Estandares de Programacion

## Proyecto: Simulador de Bases de Datos

**Curso:** Calidad y Pruebas de Software

**Docente:** MAG. Patrick Cuadros Quiroga

**Integrantes:**

- Jhony Vargas Luque (2022075754)
- Abel Fernando Pacompia Ortiz (2023076797)

**Tacna - Peru**

**2026**

---

## 1. Objetivo

Definir reglas de codificacion, organizacion, estilo y buenas practicas para mantener el **Simulador de Bases de Datos** legible, consistente, mantenible y facil de extender.

## 2. Stack del proyecto

| Tecnologia | Uso |
|---|---|
| React 18 | Interfaz de usuario. |
| TypeScript | Tipado estatico. |
| Vite | Build y servidor de desarrollo. |
| Tailwind CSS | Estilos utilitarios. |
| Zustand | Estado global. |
| AlaSQL | Ejecucion SQL en memoria. |
| IndexedDB | Persistencia local. |
| Firebase | Auth, presencia, roles y sesiones. |
| Electron | Empaquetado desktop. |
| GitHub Actions | CI/CD para build, rendimiento y despliegue. |

## 3. Estructura de carpetas

| Carpeta | Regla |
|---|---|
| `src/components/` | Componentes visuales reutilizables o pantallas. |
| `src/components/modals/` | Modales especializados. |
| `src/engines/` | Logica de ejecucion, importacion, exportacion y logs. |
| `src/db/` | Persistencia local. |
| `src/lib/` | Integraciones externas y servicios. |
| `src/store/` | Estado global. |
| `src/data/` | Datos semilla o de ejemplo. |
| `electron/` | Configuracion desktop. |
| `.github/workflows/` | Workflows de CI/CD. |
| `scripts/` | Scripts de pruebas de rendimiento y resumen consolidado. |
| `landing/` | Landing page publicada por GitHub Pages. |
| `documentos/` | Documentacion academica y tecnica. |

## 4. Convenciones de nombres

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `ResultsPanel.tsx` |
| Hooks | camelCase con prefijo `use` | `useResize` |
| Funciones | camelCase | `executeSQL` |
| Variables | camelCase | `activeTabId` |
| Tipos e interfaces | PascalCase | `QueryResult` |
| Constantes globales | UPPER_SNAKE_CASE | `DB_REGISTRY_KEY` |
| Archivos de utilidad | camelCase | `queryLogger.ts` |
| Modales | PascalCase + `Modal` | `ExportModal.tsx` |

## 5. Reglas TypeScript

1. Definir interfaces para estructuras compartidas.
2. Evitar `any`; usar `unknown`, genericos o interfaces cuando sea posible.
3. Mantener tipos globales en `src/types.ts` si son usados por varios modulos.
4. Mantener tipos locales dentro del componente si solo se usan ahi.
5. Evitar duplicar estructuras equivalentes.
6. Tipar parametros y retornos de funciones exportadas.

Ejemplo recomendado:

```ts
export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTime: number
  memoryUsage: number
  warnings: number
}
```

## 6. Reglas para React

1. Usar componentes funcionales.
2. Usar hooks de React para estado local y efectos.
3. Mantener la logica compartida fuera de la UI cuando sea posible.
4. Evitar componentes demasiado grandes; separar modales o paneles complejos.
5. No modificar estado directamente; usar setters o acciones del store.
6. Evitar efectos sin dependencias claras.
7. Limpiar suscripciones en `useEffect`.

Ejemplo:

```tsx
useEffect(() => {
  const unsub = subscribeToPresence(setUsers)
  return () => {
    if (typeof unsub === 'function') unsub()
  }
}, [])
```

## 7. Reglas para Zustand

1. Guardar en el store solo estado compartido entre componentes.
2. Mantener estado local en componentes cuando no se reutilice.
3. Crear acciones descriptivas: `addTab`, `setTabResults`, `registerDatabase`.
4. No guardar objetos innecesariamente grandes si pueden recalcularse.
5. Mantener persistencia externa en modulos especializados.

## 8. Reglas para motores y servicios

### Motores

1. La logica SQL, MongoDB y Redis debe permanecer en `src/engines/`.
2. Los componentes no deben manipular AlaSQL directamente.
3. Toda importacion o exportacion debe tener una funcion dedicada.
4. Los errores deben transformarse en mensajes comprensibles.
5. Los cambios DDL/DML deben llamar a persistencia cuando corresponda.

### Servicios Firebase

1. Centralizar inicializacion en `src/lib/firebase.ts`.
2. Verificar `isConfigured` antes de usar Firebase.
3. Limpiar presencia o sesiones al cerrar sesion.
4. No exponer credenciales reales dentro del repositorio.

## 9. Estilo de codigo

| Regla | Criterio |
|---|---|
| Comillas | Usar comillas simples en TypeScript/TSX. |
| Punto y coma | Mantener el estilo actual del proyecto, sin punto y coma obligatorio. |
| Indentacion | 2 espacios. |
| Lineas largas | Evitar lineas dificiles de leer. |
| Comentarios | Usar comentarios solo cuando aporten contexto. |
| Imports | Ordenar primero librerias externas, luego modulos locales. |

## 10. Estilos CSS y Tailwind

1. Usar Tailwind para estilos de componentes.
2. Reutilizar clases y patrones existentes.
3. Mantener consistencia visual con colores `surface`, `slate`, `blue`, `emerald`, etc.
4. Evitar estilos inline salvo casos dinamicos o componentes existentes que ya usan ese patron.
5. Los botones deben tener estados hover/disabled cuando corresponda.
6. Las tablas deben mantener encabezados claros y alineacion legible.

## 11. Manejo de errores

1. Capturar errores de ejecucion y mostrarlos al usuario.
2. No ocultar errores criticos sin registro.
3. Usar mensajes comprensibles para el usuario final.
4. Registrar consultas fallidas en `queryLogger` cuando aplique.
5. Evitar que un error de Firebase bloquee funciones locales si no son dependientes.

## 12. Persistencia

| Tipo | Regla |
|---|---|
| IndexedDB | Usar para tablas y esquemas. |
| LocalStorage | Usar solo para preferencias, registros ligeros y metadatos. |
| Firebase | Usar para usuarios, roles, presencia y sesiones remotas. |
| Archivos exportados | Usar para respaldos y evidencias. |

## 13. Seguridad

1. No subir `.env` con credenciales reales.
2. Validar entradas de usuario antes de procesarlas.
3. Limitar el acceso admin por rol o email autorizado.
4. No importar datos sensibles reales en practicas academicas.
5. Evitar `new Function` salvo en modulos controlados y documentados; actualmente se usa para evaluar argumentos MongoDB simulados.
6. No tratar el sistema como cliente de bases reales.

## 14. Pruebas recomendadas

| Area | Pruebas sugeridas |
|---|---|
| SQL Engine | CREATE, INSERT, SELECT, UPDATE, DELETE, errores de sintaxis. |
| Importacion | CSV valido, CSV vacio, JSON objeto, JSON arreglo, SQL con multiples tablas. |
| Exportacion | CSV, JSON, Excel, DDL y base completa. |
| Store | Crear tab, eliminar tab, cambiar panel activo. |
| Simulador | Inicio, pausa, comparacion, modo progresivo, exportacion de logs. |
| Firebase | Login, roles, presencia, sesiones admin. |

## 15. Control de versiones

1. Commits con mensajes claros.
2. No mezclar cambios de documentacion con refactors grandes si no es necesario.
3. Revisar `git diff` antes de confirmar cambios.
4. No versionar `node_modules`, `dist`, `release` ni credenciales.
5. Documentar cambios relevantes en los informes o README.

## 15.1 Reglas de CI/CD

1. Mantener `.github/workflows/performance.yml` como validacion principal de rendimiento.
2. El workflow de rendimiento debe compilar el proyecto antes de ejecutar la matriz de pruebas.
3. Los escenarios soportados son `light`, `medium` y `heavy`.
4. Los motores soportados por CI son `sqlserver`, `mysql`, `postgresql`, `oracle`, `sqlite`, `mongodb` y `redis`.
5. Los artifacts de rendimiento deben conservar reportes individuales y resumen consolidado en Markdown, JSON y CSV.
6. El workflow `.github/workflows/pages.yml` debe publicar solo la carpeta `landing/`.
7. Los cambios en `scripts/performance-test.mjs`, `scripts/performance-summary.mjs` o `src/types.ts` deben revisarse juntos porque los perfiles de rendimiento toman datos desde `ENGINE_CONFIGS`.

## 16. Criterios para aceptar un cambio

Un cambio debe considerarse aceptable si:

- Compila correctamente.
- Pasa `npm run build`.
- Pasa `npm run test:performance` o justifica claramente si no se ejecuto localmente.
- No rompe el flujo principal de login, editor y resultados.
- Mantiene consistencia visual.
- Actualiza tipos si cambia una estructura compartida.
- Incluye documentacion si modifica comportamiento visible.
- No introduce credenciales ni datos sensibles.

## 17. Recomendaciones finales

- Mantener `src/types.ts` como referencia central.
- Evitar duplicar logica entre `TopBar`, `SQLEditor` y modales.
- Separar funciones puras de componentes visuales cuando crezcan demasiado.
- Agregar pruebas automatizadas a los motores antes de ampliar dialectos.
- Revisar codificacion de textos para evitar caracteres corruptos.
