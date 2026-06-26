---
name: database-load-simulator-review
description: Usar para revisar, corregir, mejorar o implementar funcionalidades relacionadas con el Simulador de Carga de Bases de Datos, incluyendo backend, frontend, base de datos, pruebas de carga, metricas de rendimiento y documentacion tecnica.
version: 1.0.0
---

# Database Load Simulator Review

## Purpose

Guiar a Copilot para trabajar como revisor y desarrollador senior dentro del proyecto academico **Simulador de Carga de Bases de Datos**. La prioridad es mantener, corregir y mejorar el sistema sin romper la arquitectura existente.

## When to Use

Usar esta skill cuando la tarea mencione cualquiera de estos temas:

- Simulador de carga de bases de datos.
- Pruebas de concurrencia, rendimiento, latencia, errores o estabilidad.
- Motores SQL o NoSQL simulados.
- Editor de consultas, historial, resultados, metricas, logs, importacion o exportacion.
- Frontend React, TypeScript, Tailwind, Zustand o Monaco Editor.
- Persistencia local con IndexedDB o localStorage.
- Firebase, autenticacion, presencia, roles o sesiones.
- Electron, build desktop o distribucion.
- Documentacion tecnica, manuales, informes academicos o estandares.

## Project Context

El repositorio contiene una aplicacion web/desktop para simular y practicar escenarios de bases de datos. El sistema permite ejecutar consultas contra motores simulados, importar y exportar datos, medir resultados y trabajar con funcionalidades educativas relacionadas con SQL y NoSQL.

Stack principal:

- React 18, TypeScript y Vite.
- Tailwind CSS para estilos.
- Zustand para estado global.
- AlaSQL para ejecucion SQL en memoria.
- Simulaciones propias para MongoDB y Redis.
- IndexedDB y localStorage para persistencia local.
- Firebase para autenticacion, presencia, roles y sesiones.
- Electron para empaquetado desktop.

Rutas importantes:

- `src/components/`: interfaz y componentes visuales.
- `src/components/modals/`: modales.
- `src/engines/`: motores simulados, importacion, exportacion y logs.
- `src/db/`: IndexedDB.
- `src/lib/`: integraciones externas y servicios.
- `src/store/`: Zustand.
- `src/types.ts`: tipos compartidos.
- `electron/`: configuracion desktop.
- `documentos/`: documentacion academica y tecnica.

## General Rules

- Revisar archivos reales antes de proponer cambios tecnicos.
- Mantener la estructura actual del proyecto.
- No eliminar archivos, funciones, clases, rutas ni configuraciones sin indicacion explicita.
- No cambiar nombres importantes si no es necesario.
- Evitar cambios amplios cuando la solicitud sea puntual.
- Evitar librerias innecesarias.
- Mantener codigo claro, mantenible, tipado y consistente.
- Validar entradas del usuario.
- Manejar errores de forma comprensible.
- No exponer credenciales ni informacion sensible.
- Usar variables de entorno cuando corresponda.
- Respetar los estandares definidos en `documentos/Estandares-de-Programacion.md`.

## Backend Rules

Este proyecto no tiene un backend tradicional separado; la logica de dominio vive principalmente en modulos TypeScript del frontend y servicios externos.

- Mantener logica de motores en `src/engines/`.
- Mantener persistencia local en `src/db/`.
- Mantener integraciones externas en `src/lib/`.
- No mover logica de ejecucion de consultas hacia componentes visuales.
- Centralizar transformaciones, parseos, importaciones y exportaciones.
- Asegurar que los errores de ejecucion se registren o se muestren cuando corresponda.
- Verificar `isConfigured` antes de depender de Firebase.

## Frontend Rules

- Usar componentes funcionales de React.
- Usar hooks para estado local y efectos.
- Usar Zustand solo para estado compartido.
- Mantener componentes grandes divididos cuando sea necesario.
- Usar Tailwind CSS y patrones visuales existentes.
- Mantener botones, modales, tablas y paneles con estados claros.
- No duplicar logica entre `TopBar`, `SQLEditor`, `Sidebar` y modales si puede centralizarse.
- Probar flujos visibles afectados: login, editor, ejecucion, resultados, historial, configuracion, exportacion e importacion.

## Database Rules

- Recordar que el sistema simula bases de datos; no conectarlo a motores reales salvo indicacion explicita.
- Usar AlaSQL para SQL en memoria.
- Mantener MongoDB y Redis como simulaciones controladas.
- Persistir tablas y esquemas mediante IndexedDB cuando aplique.
- Usar localStorage solo para preferencias, historiales ligeros y metadatos.
- Validar datos importados desde SQL, CSV o JSON.
- No usar datos sensibles reales en ejemplos, semillas o pruebas academicas.
- Al cambiar estructuras persistidas, considerar compatibilidad con datos locales existentes.

## Documentation Rules

- Escribir en espanol claro y profesional.
- Evitar texto generico o de relleno.
- Explicar comandos indicando que hacen y cuando se usan.
- Mantener manuales e informes alineados con el comportamiento real del sistema.
- Si se describe una captura o imagen, describir solo lo que realmente aparece.
- Corregir problemas de codificacion si se edita una seccion afectada.
- No documentar funcionalidades que no existan en el codigo.

## Expected Output

Cuando se responda usando esta skill:

- Explicar primero el alcance de la tarea.
- Indicar archivos relevantes revisados o que deben revisarse.
- Proponer cambios concretos y acotados.
- Separar claramente frontend, logica, persistencia, seguridad y documentacion cuando aplique.
- Incluir comandos de validacion recomendados.
- Si se implementa codigo, resumir los archivos modificados y el motivo.
- Si no se implementa codigo, entregar un plan verificable.

## Quality Criteria

Una respuesta o cambio es aceptable si:

- Respeta la arquitectura del proyecto.
- No elimina comportamiento existente sin autorizacion.
- Compila con `npm run build` cuando se modifique codigo TypeScript, UI, motores o servicios.
- Mantiene tipado correcto y evita `any` nuevo salvo justificacion.
- Maneja errores y entradas invalidas.
- No introduce secretos ni datos sensibles.
- Mantiene la experiencia de usuario coherente.
- Incluye pruebas manuales o validaciones recomendadas para el area afectada.
