# Instrucciones personalizadas para GitHub Copilot

## Proposito del proyecto

Este repositorio corresponde al proyecto academico **Simulador de Carga de Bases de Datos**. El sistema permite practicar y evaluar escenarios relacionados con bases de datos mediante una aplicacion web/desktop construida con React, TypeScript, Vite y Electron.

El objetivo principal es simular carga, concurrencia y comportamiento de motores de bases de datos, analizando metricas como tiempo de respuesta, volumen de operaciones, errores, estabilidad, uso de recursos y rendimiento general. El proyecto tambien funciona como entorno educativo para ejecutar consultas SQL y NoSQL sin conectarse a bases de datos reales.

## Contexto tecnico

- Frontend: React 18, TypeScript, Vite, Tailwind CSS y Monaco Editor.
- Estado global: Zustand.
- Motores simulados: SQL Server, MySQL, PostgreSQL, Oracle, SQLite, MongoDB y Redis.
- Ejecucion en memoria: AlaSQL y estructuras JavaScript para simulaciones NoSQL.
- Persistencia local: IndexedDB y localStorage.
- Servicios externos: Firebase para autenticacion, presencia, roles y sesiones.
- Desktop: Electron.
- Documentacion academica y tecnica: carpeta `documentos/`.

## Reglas generales de desarrollo

- Revisar primero la estructura actual del proyecto antes de proponer o aplicar cambios.
- Mantener la arquitectura existente y respetar la separacion de responsabilidades.
- No eliminar archivos, funciones, clases, rutas, configuraciones ni dependencias sin indicacion explicita.
- No cambiar nombres importantes si no es necesario para resolver el problema.
- Evitar refactors grandes cuando la tarea pida un cambio puntual.
- No agregar librerias nuevas si la funcionalidad puede resolverse con dependencias actuales o APIs nativas.
- Usar codigo claro, tipado, mantenible y coherente con el estilo existente.
- Mantener comillas simples en TypeScript/TSX y el estilo actual sin punto y coma obligatorio.
- Usar comentarios solo cuando aporten contexto real.
- Validar entradas del usuario antes de procesarlas.
- Manejar errores con mensajes comprensibles para el usuario final.
- No exponer credenciales, tokens, llaves privadas ni informacion sensible.
- Usar variables de entorno cuando corresponda.

## Estructura del proyecto

- `src/components/`: componentes visuales, pantallas y paneles reutilizables.
- `src/components/modals/`: modales especializados.
- `src/engines/`: logica de ejecucion de consultas, importacion, exportacion, logs y motores simulados.
- `src/db/`: persistencia local en IndexedDB.
- `src/lib/`: servicios externos e integraciones como Firebase, auth, presencia y sesiones.
- `src/store/`: estado global con Zustand.
- `src/data/`: datos semilla o de ejemplo.
- `src/types.ts`: tipos compartidos del sistema.
- `electron/`: configuracion para la version desktop.
- `documentos/`: documentacion academica, tecnica y manuales.

## Buenas practicas para frontend

- Usar componentes funcionales y hooks de React.
- Mantener estado local dentro del componente cuando no sea compartido.
- Usar Zustand solo para estado compartido entre pantallas o componentes.
- Separar componentes grandes en subcomponentes o modales cuando mejore la mantenibilidad.
- Mantener consistencia visual con Tailwind CSS y los patrones ya existentes.
- Evitar estilos inline salvo casos dinamicos o componentes que ya sigan ese patron.
- Asegurar estados de carga, error, vacio, hover y disabled cuando correspondan.
- No romper flujos principales: login, editor, ejecucion de consultas, resultados, historial, exportacion e importacion.

## Buenas practicas para logica y motores

- Mantener la logica de SQL, MongoDB y Redis dentro de `src/engines/`.
- No manipular AlaSQL directamente desde componentes de UI.
- Centralizar transformaciones, parseos, importaciones, exportaciones y logs en modulos especializados.
- Mantener errores tecnicos traducidos a mensajes utiles para el usuario.
- Al modificar DDL/DML o persistencia de tablas, confirmar que IndexedDB y el explorador de esquema sigan sincronizados.
- No tratar el sistema como cliente de bases de datos reales; es un simulador academico.

## Buenas practicas para base de datos y persistencia

- Usar IndexedDB para datos persistentes de tablas y esquemas.
- Usar localStorage solo para preferencias, historiales ligeros, registros y metadatos.
- Mantener Firebase en `src/lib/` y verificar configuracion antes de depender de sus servicios.
- No guardar datos sensibles reales en ejemplos, semillas, historiales o documentacion.
- Mantener compatibilidad con datos locales existentes cuando se cambien estructuras persistidas.

## Seguridad

- No incluir `.env` con credenciales reales.
- No imprimir secretos en consola, logs o documentacion.
- Validar datos importados desde CSV, JSON o SQL antes de procesarlos.
- Limitar acciones administrativas por rol o usuario autorizado.
- Evitar ejecucion dinamica de codigo salvo en modulos controlados y documentados.
- Si se usan variables de entorno, documentar su nombre y proposito sin incluir valores reales.

## Documentacion

- Evitar texto generico; explicar comportamientos reales del sistema.
- Mantener documentacion alineada con el codigo actual.
- Documentar comandos indicando que hace cada uno y cuando usarlo.
- Si se modifica comportamiento visible, actualizar README, manuales o informes relacionados cuando aplique.
- Si se describe una captura o imagen, explicar solo lo que realmente aparece.
- Revisar textos con codificacion rota cuando se edite la misma zona.

## Comandos utiles

- `npm install`: instala dependencias del proyecto.
- `npm run dev`: inicia el servidor de desarrollo Vite.
- `npm run build`: ejecuta TypeScript y genera el build web con Vite.
- `npm run preview`: sirve localmente el build generado.
- `npm run electron:dev`: inicia Vite y Electron en modo desarrollo.
- `npm run electron:build`: genera la aplicacion desktop distribuible.
- `npm run electron:build:win`: genera build de Electron para Windows.
- `npm run electron:build:mac`: genera build de Electron para macOS.
- `npm run electron:build:linux`: genera build de Electron para Linux.

## Criterios de calidad

Un cambio debe considerarse aceptable si:

- Compila correctamente con `npm run build`.
- Mantiene la arquitectura y convenciones existentes.
- No rompe el flujo principal de login, editor, ejecucion, resultados, historial, importacion o exportacion.
- Maneja errores y estados vacios de forma clara.
- Mantiene tipado TypeScript coherente.
- No introduce credenciales ni datos sensibles.
- Incluye o actualiza documentacion cuando cambia comportamiento visible.
- Indica pruebas manuales necesarias si no existen pruebas automatizadas para el area modificada.
