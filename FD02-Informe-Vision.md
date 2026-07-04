![Logo](../media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERIA**

**Escuela Profesional de Ingenieria de Sistemas**

**Proyecto Simulador de Bases de Datos**

Curso: **Calidad y Pruebas de Software**

Docente: **MAG. Patrick Cuadros Quiroga**

Integrantes:

- **Jhony Vargas Luque (2022075754)**
- **Abel Fernando Pacompia Ortiz (2023076797)**

**Tacna - Peru**

**2026**

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

# Documento de Vision

Version: **2.1**

| Version | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
|:--:|:--:|:--:|:--:|:--:|:--|
| 1.0 | APO, JVL | APO, JVL | P. Cuadros Q. | 2026-04-14 | Version inicial |
| 2.0 | APO, JVL | APO, JVL | P. Cuadros Q. | 2026-06-21 | Actualizacion segun implementacion final del simulador |
| 2.1 | APO, JVL | APO, JVL | P. Cuadros Q. | 2026-07-04 | Actualizacion con version 1.8.0, CI/CD y rutas actuales |

## 1. Introduccion

### 1.1 Proposito

Este documento describe la vision del sistema **Simulador de Bases de Datos**, una herramienta academica para practicar consultas SQL y NoSQL, comparar sintaxis entre motores y comprender conceptos basicos de rendimiento sin instalar servidores de base de datos.

El documento sirve como referencia para comprender el problema, los usuarios, el alcance, las capacidades actuales y las restricciones del producto.

### 1.2 Alcance

El simulador esta orientado a estudiantes, docentes y laboratorios academicos. Permite ejecutar consultas en un entorno web/desktop, importar y exportar datos, explorar esquemas, guardar sesiones y realizar simulaciones de carga.

La version actual incluye:

- Aplicacion principal tipo IDE.
- Editor Monaco con multiples tabs.
- Siete motores simulados: SQL Server, MySQL, PostgreSQL, Oracle, SQLite, MongoDB y Redis.
- Importacion de `.sql`, `.csv` y `.json`.
- Exportacion de resultados, esquemas y bases completas.
- Persistencia local mediante IndexedDB.
- Modulo de simulacion de carga.
- Panel administrativo con monitoreo de sesiones y gestion de usuarios.
- Empaquetado web y desktop.
- Entradas separadas para aplicacion principal, simulador y administracion: `app.html`, `simulator.html` y `admin.html`.
- Validacion automatizada con GitHub Actions para rendimiento y despliegue de landing.

No incluye conexion a bases de datos reales ni ejecucion exacta de todos los dialectos de cada motor.

### 1.3 Definiciones

| Termino | Definicion |
|---|---|
| Motor simulado | Representacion didactica de un motor de base de datos dentro de la aplicacion. |
| AlaSQL | Libreria usada para ejecutar consultas SQL en memoria. |
| IndexedDB | Base de datos local del navegador usada para persistir tablas y esquemas. |
| Monaco Editor | Editor de codigo usado por Visual Studio Code, integrado en la aplicacion. |
| Firebase | Plataforma usada para autenticacion, presencia, roles y sesiones del simulador. |
| TPS | Transacciones o consultas por segundo estimadas en el simulador de carga. |
| Simulador de carga | Modulo que estima usuarios, latencia, CPU, conexiones y errores. |
| Electron | Plataforma que permite empaquetar la aplicacion web como app de escritorio. |
| GitHub Actions | Servicio de automatizacion usado para build, pruebas de rendimiento y despliegue. |

## 2. Posicionamiento

### 2.1 Oportunidad

Aprender bases de datos suele requerir instalar motores, configurar puertos, credenciales y servicios. Esto puede dificultar el inicio para estudiantes o grupos academicos que solo necesitan practicar sintaxis, operaciones comunes y analisis de resultados.

El **Simulador de Bases de Datos** ofrece una alternativa accesible, portable y visual para practicar sin instalar SQL Server, MySQL, PostgreSQL, Oracle, SQLite, MongoDB o Redis por separado.

### 2.2 Problema

Los estudiantes pueden enfrentar dificultades para:

- Instalar varios motores de base de datos en un mismo equipo.
- Comprender diferencias de sintaxis entre motores.
- Probar consultas sin riesgo de afectar una base real.
- Exportar evidencias de resultados.
- Simular carga o saturacion sin infraestructura.
- Mantener sesiones de trabajo reutilizables.

El proyecto aborda este problema mediante un entorno integrado, local y academico.

## 3. Interesados y usuarios

| Actor | Descripcion | Necesidad |
|---|---|---|
| Estudiante | Usuario principal del sistema. | Practicar consultas, importar datos y revisar resultados. |
| Docente | Evalua el aprendizaje y el producto. | Ver evidencias, documentacion y comportamiento funcional. |
| Desarrollador | Mantiene y mejora el proyecto. | Modificar componentes, motores simulados y reglas de exportacion. |
| Administrador | Gestiona usuarios y observa sesiones del simulador. | Monitorear actividad y asignar roles. |
| Usuario de laboratorio | Usa el simulador en ejercicios guiados. | Ejecutar pruebas sin instalar motores reales. |

## 4. Vista general del producto

### 4.1 Perspectiva

El producto funciona como una aplicacion web con posibilidad de empaquetado desktop. La interfaz principal ejecuta consultas en el navegador, guarda datos locales en IndexedDB y usa Firebase para funciones de autenticacion y monitoreo cuando existe configuracion.

Las entradas principales son scripts SQL, comandos MongoDB, comandos Redis y archivos importados. Las salidas principales son tablas de resultados, mensajes, exportaciones y metricas simuladas.

### 4.2 Capacidades

| Capacidad | Descripcion |
|---|---|
| Editor de consultas | Permite escribir, seleccionar y ejecutar codigo. |
| Multi-motor | Ofrece tabs para SQL Server, MySQL, PostgreSQL, Oracle, SQLite, MongoDB y Redis. |
| Importacion | Carga scripts SQL, CSV y JSON para crear tablas. |
| Exportacion | Descarga resultados en CSV, JSON, Excel, DDL y formatos por motor. |
| Explorador de esquema | Muestra bases registradas, tablas, columnas y previsualizacion. |
| Historial | Guarda consultas y bitacoras de ejecucion. |
| Simulacion de entorno | Configura latencia, errores, aislamiento y limite de conexiones. |
| Simulacion de carga | Mide TPS, latencia, errores, CPU estimada y saturacion. |
| Administracion | Permite monitorear usuarios y sesiones activas. |
| Desktop | Puede ejecutarse como aplicacion Electron. |
| CI/CD | Ejecuta validaciones de rendimiento y despliega la landing desde GitHub Actions. |

### 4.3 Entradas y despliegue

La version actual define tres entradas principales en `vite.config.ts`:

| Entrada | Uso |
|---|---|
| `app.html` | IDE principal del simulador. |
| `simulator.html` | Simulador de carga independiente. |
| `admin.html` | Panel administrativo. |

Para despliegue, el proyecto usa `netlify.toml` con rutas limpias `/app`, `/simulador` y `/admin`, y el workflow `Deploy Landing Page` para publicar la landing estatica alojada en `landing/`.

## 5. Caracteristicas del producto

### 5.1 Motores soportados

La version actual incluye:

- `sqlserver`
- `mysql`
- `postgresql`
- `oracle`
- `sqlite`
- `mongodb`
- `redis`

Cada motor cuenta con configuracion visual, conexion ficticia, factor de rendimiento para simulacion y tratamiento especifico de comandos o sintaxis.

### 5.2 Aplicacion principal

La aplicacion principal incluye:

- Login y registro.
- Pantalla de bienvenida.
- Barra superior con acciones de ejecutar, importar, exportar, ayuda, estadisticas, historial y simulador.
- Sidebar con herramientas.
- Editor SQL/NoSQL.
- Panel de resultados.
- Explorador de esquema.
- Selector de entorno y estado de conexion simulado.

### 5.3 Simulador de carga

El simulador de carga permite:

- Seleccionar motor.
- Definir duracion, usuarios maximos y rampa.
- Elegir tipos de consulta: SELECT, INSERT, UPDATE y DELETE.
- Simular latencia, CPU, conexiones, TPS y errores.
- Comparar dos motores.
- Ejecutar modo progresivo hasta detectar saturacion.
- Guardar historial de pruebas.
- Exportar logs en JSON y CSV.

### 5.4 Panel administrativo

El panel administrativo incluye:

- Login de administrador.
- Monitoreo de sesiones activas.
- KPIs de usuarios conectados, sesiones corriendo, TPS promedio y motores activos.
- Tabla de actividad por usuario.
- Gestion de roles de usuarios.

## 6. Restricciones

- La aplicacion no se conecta a motores reales.
- La compatibilidad SQL depende de AlaSQL y de los preprocesadores implementados.
- MongoDB y Redis son simulaciones en memoria.
- La persistencia principal de datos de usuario es local al navegador.
- Las funciones colaborativas requieren variables de entorno de Firebase.
- Los resultados de rendimiento son simulados y no deben usarse como benchmark real.
- El build desktop depende de Electron y del sistema operativo objetivo.

## 7. Calidad esperada

| Atributo | Descripcion |
|---|---|
| Usabilidad | Interfaz tipo IDE con acciones visibles, modales y plantillas. |
| Mantenibilidad | Separacion entre componentes, store, motores, librerias y datos. |
| Portabilidad | Ejecucion web y empaquetado desktop. |
| Auditabilidad | Historial, logs de consulta y exportaciones. |
| Configurabilidad | Ajustes de editor, simulacion y entorno. |
| Disponibilidad local | La aplicacion puede ejecutarse en desarrollo con Vite. |
| Seguridad basica | Autenticacion y roles mediante Firebase cuando esta configurado. |

## 8. Conclusion

El **Simulador de Bases de Datos** cumple la vision de una herramienta academica para practicar consultas, explorar diferencias entre motores y simular condiciones de carga. La version actual es mas completa que un editor simple porque integra importacion, exportacion, persistencia local, simulacion de rendimiento, administracion, despliegue web/desktop y validacion automatizada con GitHub Actions.
