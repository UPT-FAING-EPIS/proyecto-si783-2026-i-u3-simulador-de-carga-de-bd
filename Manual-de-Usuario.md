![Logo](../media/logo-upt.png)

# UNIVERSIDAD PRIVADA DE TACNA

## FACULTAD DE INGENIERIA

### Escuela Profesional de Ingenieria de Sistemas

---

# Manual de Usuario

## Proyecto: Simulador de Bases de Datos

**Curso:** Calidad y Pruebas de Software

**Docente:** MAG. Patrick Cuadros Quiroga

**Integrantes:**

- Jhony Vargas Luque (2022075754)
- Abel Fernando Pacompia Ortiz (2023076797)

**Tacna - Peru**

**2026**

---

## 0. Control documental

| Version | Fecha | Descripcion |
|---|---|---|
| 2.2 | 2026-07-04 | Actualizacion con evidencias, rutas finales, limitaciones y validacion GitHub. |

## 1. Objetivo del manual

Este manual explica el uso del **Simulador de Bases de Datos**, una aplicacion academica para practicar consultas SQL y NoSQL, importar datos, revisar resultados, exportar evidencias y simular carga sin instalar motores reales.

## 2. Requisitos para el usuario

| Requisito | Descripcion |
|---|---|
| Navegador moderno | Chrome, Edge, Firefox u otro navegador compatible con IndexedDB. |
| Conexion a internet | Necesaria si se usa autenticacion, presencia o panel admin con Firebase. |
| Cuenta de usuario | Requerida para ingresar al IDE principal. |
| Conocimientos basicos | SQL, tablas, consultas y conceptos generales de bases de datos. |

## 3. Acceso al sistema

1. Abrir la URL local o publicada de la aplicacion.
2. Ingresar a la pantalla de login.
3. Elegir una opcion:
   - Iniciar sesion con usuario y contrasena.
   - Registrarse con correo, usuario y PIN.
   - Ingresar con Google si Firebase esta configurado.
4. Al iniciar sesion, se muestra la pantalla de bienvenida.
5. Presionar el boton de ingreso para abrir el entorno principal.

Entradas disponibles en desarrollo:

| Entrada | Uso |
|---|---|
| `/app.html` o `/app` | Aplicacion principal tipo IDE. |
| `/simulator.html` o `/simulador` | Simulador de carga independiente. |
| `/admin.html` o `/admin` | Panel administrativo. |

## 4. Pantalla principal

La pantalla principal se organiza en:

| Zona | Funcion |
|---|---|
| Barra superior | Ejecutar consultas, importar, exportar, abrir ayuda, configuracion, historial y simulador. |
| Pestanas de motor | Permiten trabajar con SQL Server, MySQL, PostgreSQL, Oracle, SQLite, MongoDB y Redis. |
| Editor | Area donde se escriben consultas o comandos. |
| Panel de resultados | Muestra tablas, mensajes, tiempos de ejecucion y filas afectadas. |
| Explorador de esquema | Lista bases, tablas, columnas y vista previa de datos. |
| Sidebar | Accesos rapidos a herramientas y secciones del sistema. |

## 5. Seleccionar motor de base de datos

1. Ubicar la barra de pestanas.
2. Seleccionar un motor existente o crear una nueva pestana.
3. El sistema asigna la conexion simulada correspondiente.

Motores disponibles:

- SQL Server
- MySQL
- PostgreSQL
- Oracle
- SQLite
- MongoDB
- Redis

## 6. Ejecutar consultas SQL

1. Seleccionar una pestana de motor relacional.
2. Escribir una consulta en el editor.
3. Presionar el boton **Ejecutar** o usar el atajo configurado.
4. Revisar el resultado en el panel inferior.

Ejemplo:

```sql
CREATE TABLE clientes (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  ciudad VARCHAR(80)
);

INSERT INTO clientes VALUES (1, 'Ana Torres', 'Tacna');
INSERT INTO clientes VALUES (2, 'Luis Ramos', 'Lima');

SELECT * FROM clientes;
```

## 7. Ejecutar seleccion parcial

Si el usuario selecciona una parte del script, el sistema ejecuta solo el texto seleccionado.

Flujo:

1. Escribir varias sentencias.
2. Seleccionar una sentencia o bloque.
3. Presionar ejecutar.
4. Verificar que solo se procese la seleccion.

## 8. Usar MongoDB simulado

1. Abrir una pestana MongoDB.
2. Asegurar que exista una coleccion como tabla en memoria.
3. Ejecutar comandos compatibles.

Ejemplo:

```javascript
db.clientes.find({})
db.clientes.insertOne({ nombre: "Maria", ciudad: "Arequipa" })
db.clientes.updateOne({ nombre: "Maria" }, { $set: { ciudad: "Tacna" } })
db.clientes.deleteOne({ nombre: "Maria" })
```

## 9. Usar Redis simulado

1. Abrir una pestana Redis.
2. Escribir comandos clave-valor, hash, lista o set.
3. Ejecutar el bloque.

Ejemplo:

```text
SET sesion:user1 "token_abc"
GET sesion:user1
HSET usuario:1 nombre "Juan" email "juan@demo.com"
HGETALL usuario:1
LPUSH cola:tareas "tarea1" "tarea2"
LRANGE cola:tareas 0 -1
```

## 10. Importar datos

El sistema permite importar:

| Formato | Uso |
|---|---|
| SQL | Crear tablas e insertar datos desde scripts. |
| CSV | Crear una tabla desde columnas y filas separadas por coma. |
| JSON | Crear una tabla desde un objeto o arreglo de objetos. |

Pasos:

1. Presionar **Importar** en la barra superior.
2. Seleccionar el tipo de archivo.
3. Elegir el archivo desde el equipo.
4. Confirmar el nombre de tabla o base si aplica.
5. Revisar el explorador de esquema.

## 11. Exportar resultados

Desde el panel de resultados o modal de exportacion se pueden generar:

- CSV
- JSON
- Excel
- SQL
- TXT
- DDL
- Base completa segun motor

Pasos:

1. Ejecutar una consulta.
2. Abrir **Exportar**.
3. Elegir formato.
4. Descargar el archivo generado.

## 12. Explorar esquema

El explorador permite:

- Ver bases registradas.
- Ver tablas creadas o importadas.
- Ver columnas detectadas.
- Previsualizar filas.
- Actualizar el esquema despues de cambios.

## 13. Historial y logs

El sistema guarda:

- Consultas ejecutadas.
- Motor usado.
- Tiempo de ejecucion.
- Filas retornadas.
- Errores y mensajes.

El usuario puede abrir el historial desde la barra superior y reutilizar consultas anteriores.

## 14. Simulador de carga

El simulador permite representar carga academica sobre un motor.

Parametros configurables:

| Parametro | Descripcion |
|---|---|
| Motor | Motor que se simula. |
| Duracion | Tiempo de la prueba. |
| Usuarios maximos | Cantidad maxima de usuarios simulados. |
| Rampa | Tiempo de crecimiento de usuarios. |
| Tipos de consulta | SELECT, INSERT, UPDATE y DELETE. |
| Comparacion | Permite comparar dos motores. |
| Modo progresivo | Aumenta usuarios hasta saturacion simulada. |

Metricas mostradas:

- TPS
- Pico TPS
- Latencia
- CPU estimada
- Conexiones
- Errores
- Logs de scripts simulados

## 15. Panel administrativo

El panel admin se abre desde `admin.html`.

Funciones:

- Iniciar sesion como administrador.
- Ver sesiones activas del simulador.
- Ver usuarios registrados.
- Cambiar rol entre Usuario y Administrador.

Nota: requiere Firebase configurado.

## 16. Cierre de sesion

1. Abrir menu de usuario.
2. Presionar cerrar sesion.
3. El sistema elimina la presencia activa y vuelve al login.

## 17. Limitaciones

- No se conecta a bases de datos reales.
- Los motores son simulados.
- El rendimiento mostrado en el simulador no es benchmark real.
- MongoDB y Redis son representaciones en memoria.
- La persistencia depende del navegador e IndexedDB.
- Las funciones de login real, presencia, roles y panel administrativo dependen de Firebase configurado.
- Si el navegador borra datos locales, se pueden perder tablas y esquemas guardados.

## 18. Recomendaciones de uso

- Exportar resultados importantes antes de limpiar el navegador.
- Usar datos de prueba, no informacion sensible real.
- Verificar el motor activo antes de ejecutar consultas.
- Guardar sesiones cuando se trabaje con varios tabs.
- Usar el simulador de carga solo con fines academicos.

## 19. Validacion del proyecto en GitHub

El repositorio incluye la accion **Database Load Performance**. Esta accion puede ejecutarse desde la pestana **Actions** de GitHub y valida automaticamente el rendimiento simulado de los siete motores en escenarios `light`, `medium` y `heavy`.

Cuando el workflow termina correctamente, GitHub muestra la ejecucion con estado exitoso. Esto sirve como evidencia de que el proyecto compila y que las pruebas de carga automatizadas cumplen los umbrales definidos.

## 20. Evidencias recomendadas para entrega

Para una entrega academica completa se recomienda generar o mostrar:

| Evidencia | Donde obtenerla |
|---|---|
| Consulta SQL ejecutada | Editor y panel de resultados. |
| Resultado exportado | Boton de exportacion en CSV, JSON, Excel o SQL. |
| Esquema de tablas | Explorador de esquema. |
| Historial o logs | Opcion de historial en la barra superior. |
| Simulacion de carga | Modal o vista `simulator.html`. |
| Reporte de rendimiento | Artifact o carpeta `reports/` generada por CI/CD. |
| Panel administrativo | Ruta `admin.html` o `/admin` con Firebase configurado. |

## 21. Buenas practicas de uso

1. Usar datos de prueba y evitar informacion sensible real.
2. Exportar resultados importantes antes de cerrar o limpiar el navegador.
3. Confirmar el motor activo antes de ejecutar consultas.
4. Separar practicas SQL, MongoDB y Redis en pestanas distintas.
5. Revisar mensajes de error antes de repetir una consulta.
6. Usar el simulador de carga como herramienta didactica, no como benchmark real.
7. Solicitar al administrador la configuracion de roles si se requiere acceso al panel admin.
