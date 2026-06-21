![Logo](../media/logo-upt.png)

# UNIVERSIDAD PRIVADA DE TACNA

## FACULTAD DE INGENIERIA

### Escuela Profesional de Ingenieria de Sistemas

---

# Diccionario de Datos

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

Este documento describe las principales estructuras de datos utilizadas por el **Simulador de Bases de Datos**, incluyendo tipos TypeScript, almacenamiento local, IndexedDB y nodos Firebase.

## 2. Fuentes de datos del sistema

| Fuente | Tecnologia | Descripcion |
|---|---|---|
| Estado global | Zustand | Tabs, consultas, resultados, historial, simulacion y preferencias. |
| Motor en memoria | AlaSQL / Maps | Tablas SQL simuladas, colecciones MongoDB y estructuras Redis. |
| IndexedDB | Navegador | Persistencia local de tablas y esquemas. |
| LocalStorage | Navegador | Preferencias, registros ligeros y logs de consultas. |
| Firebase Auth | Firebase | Identidad de usuarios. |
| Firebase RTDB | Firebase | Usuarios, presencia, sesiones y roles. |

## 3. Enumeraciones principales

### EngineType

| Valor | Descripcion |
|---|---|
| `sqlserver` | Motor SQL Server simulado. |
| `mysql` | Motor MySQL simulado. |
| `postgresql` | Motor PostgreSQL simulado. |
| `mongodb` | Motor MongoDB simulado. |
| `oracle` | Motor Oracle simulado. |
| `sqlite` | Motor SQLite simulado. |
| `redis` | Motor Redis simulado. |

### IsolationLevel

| Valor | Descripcion |
|---|---|
| `READ UNCOMMITTED` | Nivel de aislamiento bajo. |
| `READ COMMITTED` | Nivel por defecto. |
| `REPEATABLE READ` | Lecturas repetibles. |
| `SERIALIZABLE` | Nivel mas estricto. |

## 4. Estructuras de consultas

### QueryResultSet

| Campo | Tipo | Descripcion |
|---|---|---|
| `label` | `string` | Nombre del conjunto de resultado. |
| `columns` | `string[]` | Columnas devueltas. |
| `rows` | `Record<string, unknown>[]` | Filas del resultado. |

### QueryResult

| Campo | Tipo | Descripcion |
|---|---|---|
| `columns` | `string[]` | Columnas principales. |
| `rows` | `Record<string, unknown>[]` | Filas principales. |
| `rowCount` | `number` | Cantidad total de filas. |
| `executionTime` | `number` | Tiempo de ejecucion en milisegundos. |
| `memoryUsage` | `number` | Uso estimado de memoria. |
| `warnings` | `number` | Cantidad de advertencias. |
| `sets` | `QueryResultSet[]` | Resultados multiples opcionales. |

### QueryHistoryItem

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Identificador del historial. |
| `query` | `string` | Consulta ejecutada. |
| `timestamp` | `Date` | Fecha y hora de ejecucion. |
| `engine` | `EngineType` | Motor usado. |
| `rowCount` | `number` | Filas retornadas o afectadas. |
| `executionTime` | `number` | Tiempo de ejecucion. |

### QueryLogEntry

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Identificador unico. |
| `timestamp` | `string` | Fecha ISO del evento. |
| `query` | `string` | Consulta original. |
| `processed` | `string` | Consulta procesada si aplica. |
| `durationMs` | `number` | Duracion en milisegundos. |
| `rowCount` | `number` | Cantidad de filas. |
| `affectedRows` | `number` | Filas afectadas por DML. |
| `success` | `boolean` | Resultado exitoso o fallido. |
| `errorMessage` | `string | null` | Mensaje de error. |
| `dbName` | `string | null` | Base activa. |
| `setsCount` | `number` | Cantidad de sets devueltos. |

LocalStorage:

| Clave | Contenido |
|---|---|
| `simulador_bds_query_logs_v1` | Arreglo de `QueryLogEntry`, maximo 1000 registros. |

## 5. Estructuras de pestanas y editor

### QueryPane

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Identificador del panel. |
| `query` | `string` | Consulta escrita. |
| `results` | `QueryResult | null` | Resultado asociado. |
| `messages` | `string[]` | Mensajes de ejecucion. |

### EngineTab

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Identificador de pestana. |
| `engine` | `EngineType` | Motor asociado. |
| `database` | `string` | Nombre de base visible. |
| `connection` | `string` | Conexion simulada. |
| `query` | `string` | Consulta activa. |
| `selectedText` | `string` | Texto seleccionado. |
| `results` | `QueryResult | null` | Resultado activo. |
| `messages` | `string[]` | Mensajes activos. |
| `queryPanes` | `QueryPane[]` | Paneles internos. |
| `activeQueryPaneId` | `string` | Panel activo. |

### EngineConfig

| Campo | Tipo | Descripcion |
|---|---|---|
| `type` | `EngineType` | Identificador del motor. |
| `name` | `string` | Nombre visible. |
| `color` | `string` | Color asociado en UI. |
| `emoji` | `string` | Icono textual del motor. |
| `defaultDatabase` | `string` | Base por defecto. |
| `defaultConnection` | `string` | Conexion simulada por defecto. |
| `defaultQuery` | `string` | Consulta inicial. |
| `perfFactor` | `number` | Factor usado por el simulador de carga. |

## 6. Estructuras de simulacion

### SimulationSettings

| Campo | Tipo | Descripcion |
|---|---|---|
| `networkLatency` | `number` | Latencia simulada en ms. |
| `connectionLimit` | `number` | Limite de conexiones simultaneas. |
| `simulateErrors` | `boolean` | Activa errores aleatorios. |
| `errorProbability` | `number` | Probabilidad de error. |
| `isolationLevel` | `IsolationLevel` | Nivel de aislamiento simulado. |

### Metrics

| Campo | Tipo | Descripcion |
|---|---|---|
| `executionTime` | `string` | Tiempo formateado. |
| `rowsAffected` | `number` | Filas afectadas. |
| `warnings` | `number` | Advertencias. |
| `memoryUsage` | `string` | Memoria formateada. |

### SimulatorSession

Ruta Firebase:

```text
simulator_web/{sessionId}
```

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Identificador de sesion. |
| `name` | `string` | Nombre del usuario. |
| `engine` | `string` | Motor seleccionado. |
| `queryTypes` | `object` | SELECT, INSERT, UPDATE y DELETE activos. |
| `status` | `idle | running | completed` | Estado de la prueba. |
| `tps` | `number` | TPS actual. |
| `currentUsers` | `number` | Usuarios actuales. |
| `maxUsers` | `number` | Usuarios maximos. |
| `cpuUsage` | `number` | CPU estimada. |
| `latency` | `number` | Latencia estimada. |
| `connectedAt` | `number | null` | Fecha de conexion. |
| `updatedAt` | `number | null` | Ultima actualizacion. |

## 7. Estructuras de sesion guardada

### SessionData

| Campo | Tipo | Descripcion |
|---|---|---|
| `version` | `string` | Version del formato. |
| `savedAt` | `string` | Fecha de guardado. |
| `tabs` | `Array` | Tabs con motor, base y consulta. |
| `databases` | `Array` | Bases registradas y tablas. |
| `activeDbName` | `string` | Base activa al guardar. |
| `simulation` | `SimulationSettings` | Configuracion de simulacion. |

## 8. IndexedDB

Base:

```text
SimuladorBDS
```

Version:

```text
2
```

### Store: tables

Clave:

```text
name
```

| Campo | Tipo | Descripcion |
|---|---|---|
| `name` | `string` | Nombre de tabla. |
| `data` | `object[]` | Filas persistidas. |

### Store: schemas

Clave:

```text
dbName
```

| Campo | Tipo | Descripcion |
|---|---|---|
| `dbName` | `string` | Nombre de base importada. |
| `tableOrder` | `string[]` | Orden original de tablas. |
| `createStatements` | `Record<string,string>` | DDL original por tabla. |
| `identityCols` | `Record<string,string | null>` | Columna identity por tabla. |
| `insertCols` | `Record<string,string[]>` | Columnas usadas en INSERT. |

## 9. LocalStorage

| Clave | Contenido | Descripcion |
|---|---|---|
| `theme` | `dark | light` | Tema visual. |
| `simulador_bds_databases` | `DBEntry[]` | Bases registradas localmente. |
| `simulador_bds_query_logs_v1` | `QueryLogEntry[]` | Logs de consultas. |
| `simulador_bds_tables` | Formato antiguo | Clave legacy migrada a IndexedDB. |

## 10. Firebase Realtime Database

### users/{uid}

| Campo | Tipo | Descripcion |
|---|---|---|
| `username` | `string` | Nombre de usuario. |
| `email` | `string` | Correo. |
| `role` | `string` | Usuario o Administrador. |
| `color` | `string` | Color de avatar. |
| `pin` | `string` | PIN local del perfil. |
| `provider` | `email | google` | Proveedor de autenticacion. |
| `createdAt` | `number` | Fecha de creacion. |
| `activeSession` | `object` | Sesion activa. |

### usernames/{username}

| Campo | Tipo | Descripcion |
|---|---|---|
| valor | `string` | UID asociado al username. |

### presence/{sessionId}

| Campo | Tipo | Descripcion |
|---|---|---|
| `name` | `string` | Usuario conectado. |
| `role` | `string` | Rol del usuario. |
| `color` | `string` | Color de identificacion. |
| `engine` | `string` | Motor activo. |
| `connectedAt` | `number` | Fecha de conexion. |

### activeSessions/admin

| Campo | Tipo | Descripcion |
|---|---|---|
| `token` | `string` | Token aleatorio de sesion. |
| `loginAt` | `number` | Fecha de inicio. |

## 11. Datos Redis simulados

| Estructura interna | Tipo | Descripcion |
|---|---|---|
| `_rkv` | `Map<string,string>` | Strings Redis. |
| `_rhash` | `Map<string, Map<string,string>>` | Hashes. |
| `_rlist` | `Map<string,string[]>` | Listas. |
| `_rset` | `Map<string, Set<string>>` | Sets. |
| `_rexp` | `Map<string,number>` | Expiracion de claves. |

## 12. Consideraciones

- El diccionario representa la version actual del codigo.
- Las tablas creadas por usuarios son dinamicas y dependen de los archivos importados o consultas ejecutadas.
- Firebase es opcional, pero necesario para login real, presencia y admin.
- La persistencia principal de datos de prueba se realiza en IndexedDB.
