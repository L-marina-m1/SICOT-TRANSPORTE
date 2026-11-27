# SICOT: cambios realizados y tareas pendientes

Este documento explica qué se cambió en el proyecto, por qué, cómo levantarlo en tu PC y qué falta hacer.
Léelo completo antes de seguir programando: varias cosas cambiaron de forma incompatible con el código anterior.

---

## 1. Resumen

| Antes | Ahora |
|---|---|
| El backend no arrancaba (`index.js` vacío, imports a archivos inexistentes) | Arranca con `npm run dev` |
| Un solo endpoint (`GET /api/vehiculos`) | CRUD completo de las 7 tablas, con validación |
| Sin login real: el botón "Ingresar" dejaba pasar a cualquiera | Login con JWT y permisos por rol |
| Frontend con datos escritos a mano | Inicio, Vehículos y Configuración leen y escriben en la base |
| Base de datos en `armscii8` (no aceptaba tildes ni ñ) | Convertida a `utf8mb4` |
| El esquema de la base no estaba en el repo | `backend/database/migrations/000_esquema_inicial.sql` |

---

## 2. Cómo levantar el proyecto en tu PC

Requisitos: Node.js 20 o superior y MariaDB (o MySQL 8).

### 2.1 Base de datos

Ejecuta en HeidiSQL (o en la consola de MariaDB) estos scripts, en orden:

1. `backend/database/migrations/000_esquema_inicial.sql`: crea `sicot_db` y todas las tablas.
2. `backend/database/migrations/001_convertir_a_utf8mb4.sql`: **solo si ya tenías `sicot_db` creada de antes**. Tu copia casi seguro está en `armscii8`, igual que estaba la nuestra.

> **Ojo con el puerto 3306.** En la PC donde se hizo esto había **dos** servidores escuchando en el 3306: el
> servicio de Windows "MariaDB 12.2" y el MySQL de Laragon. Si te sale el error
> `auth_gssapi_client`, es eso: detén uno de los dos o crea un usuario con contraseña para la app
> (ver sección 6).

### 2.2 Backend

```bash
cd backend
npm install
cp .env.example .env
```

Completa el `.env`:

| Variable | Qué poner |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Los datos de **tu** base local |
| `JWT_SECRET` | Genera el tuyo con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Sin esta variable el backend no arranca a propósito. |
| `JWT_EXPIRA_EN` | Cuánto dura la sesión (por defecto `8h`) |
| `CORS_ORIGEN` | URL del frontend (por defecto `http://localhost:5173`) |

Crea tu primer usuario (no se puede desde la web porque todavía nadie puede iniciar sesión):

```bash
npm run crear-usuario -- --nombre "Tu Nombre" --correo tu@correo.pe --rol gerencia --password "UnaClaveSegura"
```

Datos de prueba (opcional, pero recomendado):

```bash
npm run demo               # 4 conductores, 4 vehículos, recorridos en curso, GPS, asistencias, contratos
npm run demo -- --borrar   # quita solo esos datos
```

`npm run demo` también crea una cuenta de conductor (`conductor.demo@sicot.pe`) y muestra su contraseña al terminar.

### 2.3 Frontend

```bash
cd frontend
npm install
```

No necesita `.env`: Vite reenvía `/api` a `http://localhost:3000`. Si tu backend corre en otro puerto, crea
`frontend/.env.local` con `VITE_BACKEND_URL=http://localhost:XXXX`.

### 2.4 Correr todo

Dos terminales:

```bash
cd backend  && npm run dev     # http://localhost:3000
cd frontend && npm run dev     # http://localhost:5173
```

---

## 3. Cambios que rompen lo anterior

Si tienes código o ramas en curso, revisa esto:

1. **El backend se movió a `backend/src/`.** Ya no existen `backend/index.js`, `backend/API/` ni `backend/routes/`.
2. **Todas las rutas `/api/*` exigen un token**, menos `/api/auth/login` y `/api/probar-bd`. Envía la cabecera
   `Authorization: Bearer <token>`. En el frontend lo hace `src/api/cliente.js` automáticamente.
3. **El login es con correo**, no con nombre de usuario.
4. **Las fechas llegan como texto sin zona horaria**: `"2026-11-27"` y `"2026-11-27 08:30:00"`, ya no en
   formato ISO (`...T...Z`). Antes podían salir corridas un día por la conversión a UTC.
5. **Los errores de la API tienen un formato fijo**:
   ```json
   { "mensaje": "Datos inválidos para el vehículo", "errores": { "anio": "debe ser mayor o igual a 1901" } }
   ```
6. **Se borraron archivos sin uso del frontend**: `Dashboard.jsx` (se importaba a sí mismo), `Rutas.jsx`,
   `App.css`, `data/datos.js`, `assets/*`, `Estadisticas.backup.jsx` y `codigo_sicot.txt`. Siguen en el historial de git.
7. **Las páginas `Vehiculos.jsx` y `Configuracion.jsx` se movieron** a `src/pages/vehiculos/` y `src/pages/configuracion/`.

---

## 4. Cómo está organizado

### 4.1 Backend

```
backend/
├── database/migrations/     Scripts SQL (esquema y cambios)
├── scripts/                 crearUsuario.js, datosDemo.js
└── src/
    ├── server.js            Arranque y apagado limpio
    ├── app.js               Express: CORS, JSON, rutas, errores
    ├── config/              env.js (valida el .env) y database.js (pool de MariaDB)
    ├── core/                Piezas genéricas reutilizables
    │   ├── crud/            crearCrudRouter + crearCrudService: CRUD completo a partir de un esquema
    │   ├── validation/      tipos.js (texto, entero, fecha…), reglas.js, crearValidador.js
    │   └── errors/          HttpError
    ├── middlewares/         auth.js (requiereAuth, permitirRoles), errorHandler, notFound
    ├── modules/             Un directorio por entidad
    │   ├── auth/            login, /me, firma de tokens
    │   ├── usuarios/        esquema + hash de contraseñas (scrypt)
    │   ├── conductores/  contratos/  vehiculos/  recorridos/  asistencias/  ubicaciones-gps/
    │   └── health/          /api/probar-bd
    └── routes/index.js      Registro de recursos y permisos por rol
```

**Idea central: cada tabla es un esquema, no un CRUD escrito a mano.** Por ejemplo,
`modules/vehiculos/vehiculos.schema.js` declara:

- `campos`: qué columnas se aceptan y cómo se valida cada una (`t.texto({ max: 15 })`, `t.opcion([...])`…).
  Cualquier campo que no esté en esta lista se rechaza.
- `obligatorios` / `noNulos`: qué campos son requeridos y cuáles no pueden quedar en `null`.
- `filtros`: los parámetros permitidos en `GET /?campo=valor`.
- `unicos`, `relaciones`, `mensajeDependientes`: cómo traducir los errores de MariaDB (duplicado, clave
  foránea, borrado bloqueado) a mensajes claros.
- `reglas`: validaciones entre campos, como `fecha_fin` no anterior a `fecha_inicio`.

Con eso, `crearCrudRouter` genera `GET`, `GET /:id`, `POST`, `PUT`, `PATCH` y `DELETE`.

**Para agregar una tabla nueva:**
1. Crea la tabla con un script nuevo en `database/migrations/` (por ejemplo `002_...sql`).
2. Crea `src/modules/<nombre>/<nombre>.schema.js` copiando uno existente.
3. Agrégalo al arreglo `recursos` de `src/routes/index.js` con sus permisos de lectura y escritura.

Si un módulo necesita lógica que no es CRUD (reportes, agregados, acciones como "iniciar recorrido"),
crea su propio `*.routes.js` dentro del módulo, como hace `auth/`.

**Seguridad que ya está resuelta:**
- **Consultas SQL:** siempre con parámetros `?`. Los nombres de columna salen del esquema, nunca del cliente.
- **Contraseñas:** se guardan con `scrypt` y sal aleatoria. `password_hash` nunca aparece en las respuestas.
- **Sesión por petición:** cada request vuelve a verificar al usuario en la base, así que dar de baja a alguien le
  corta el acceso al instante aunque su token siga vigente.
- **Login:** no revela si un correo existe (tarda lo mismo y da el mismo mensaje en ambos casos).
- **CORS:** solo acepta el origen de `CORS_ORIGEN`.

### 4.2 Frontend

```
frontend/src/
├── api/            cliente.js (fetch + token + errores) y recursos.js (vehiculosApi, conductoresApi…)
├── auth/           AuthProvider, useAuth, RutaProtegida, roles.js
├── hooks/          useCarga: carga datos con estado de carga/error y recargar()
├── services/       Lógica que combina varias llamadas (ej. registrar conductor + crear su cuenta)
├── components/ui/  Modal, Campo, EstadoPill, EstadoTabla
├── utils/          formato.js (fechas, números, clave temporal) y estados.js (textos y colores)
└── pages/          Una carpeta por página cuando tiene más de un archivo
```

**Reglas para las páginas nuevas:**
- No uses `fetch` directo: usa `src/api/recursos.js`.
- Para cargar datos usa `useCarga(() => algoApi.listar(), 'clave')` y llama a `recargar()` después de guardar.
- Muestra los errores de campo así: `<Campo error={errores.placa}>`, donde `errores` viene de `error.errores`.
- No ocultes un botón solo por seguridad. El backend es quien bloquea; ocultarlo es solo para que la interfaz se vea limpia.

---

## 5. Roles y permisos

| Recurso | Leer | Crear / editar / borrar |
|---|---|---|
| usuarios, contratos | gerencia, admin_ti | gerencia, admin_ti |
| conductores, vehículos, recorridos | todos | gerencia, admin_ti |
| asistencias, ubicaciones-gps | todos | todos (el conductor registra su asistencia y su GPS) |

En el frontend, la página Configuración solo la ven `gerencia` y `admin_ti`.

---

## 6. Problemas conocidos del entorno

- **`auth_gssapi_client` al conectar:** hay dos servidores de base de datos en el puerto 3306 (ver 2.1), o
  `root` no tiene contraseña en MariaDB. Solución recomendada, un usuario propio para la app:
  ```sql
  CREATE USER 'sicot_user'@'localhost' IDENTIFIED BY 'una_clave';
  GRANT ALL ON sicot_db.* TO 'sicot_user'@'localhost';
  ```
- **"No se pudo conectar con el servidor" en el frontend:** el backend no está corriendo o está en otro puerto.
- **`JWT_SECRET debe tener al menos 32 caracteres`:** genera uno con el comando de la sección 2.2.

---

## 7. Tareas pendientes

Ordenadas por prioridad. Las marcadas **[Bloquea]** impiden usar el sistema de verdad.

### Alta prioridad

1. **[Bloquea] Página de Recorridos.** Crear, iniciar, finalizar y cancelar recorridos (conductor + vehículo +
   origen/destino). Hoy solo se pueden crear por la API o con `npm run demo`. Es lo que alimenta Inicio y Estadísticas.
2. **[Bloquea] Sincronizar el estado del vehículo con el recorrido.** Al pasar un recorrido a `en_curso`, el
   vehículo debe pasar a `en_ruta`, y al terminarlo volver a `disponible`. Hoy son independientes y pueden
   contradecirse. Hazlo en el backend, en una ruta de acción como `POST /api/recorridos/:id/iniciar`, dentro de
   una transacción.
3. **[Bloquea] Cambiar la propia contraseña.** No existe pantalla ni endpoint. Las cuentas de conductor se
   crean con una clave temporal que nunca se cambia. Falta `PATCH /api/auth/password` (pidiendo la clave
   actual) y, de preferencia, obligar el cambio en el primer ingreso.
4. **Límite de intentos de login.** Agregar `express-rate-limit` en `/api/auth/login` para evitar ataques de fuerza bruta.

### Media prioridad

5. **Estadísticas con datos reales.** `pages/Estadisticas.jsx` usa datos fijos. Crea un endpoint de agregados
   (por ejemplo `GET /api/estadisticas?desde=&hasta=`) con conteos por día, por estado y por vehículo, y conéctalo.
6. **Reportes.** La página está vacía. Puede reutilizar el código de PDF que ya está en Estadísticas.
7. **Notificaciones.** No existe ninguna tabla. Primero hay que definir qué genera una alerta (por ejemplo, un
   recorrido sin GPS por más de 5 minutos, una licencia por vencer o una demora). Luego decidir si se guardan en una
   tabla o se calculan al vuelo. Hoy son de ejemplo, igual que el contador "3" del menú y el bloque en Inicio.
8. **Mapa real.** Inicio muestra un iframe de Google Maps fijo en Puno. Reemplázalo por Leaflet + OpenStreetMap
   dibujando la última ubicación de cada recorrido en curso (`/api/ubicaciones-gps?recorrido_id=`).
9. **Pantallas de contratos y asistencias.** El backend ya las tiene; falta la interfaz.
10. **Cómo envía el conductor su GPS.** Hay que definir si será una app móvil o una página web con la
    geolocalización del navegador. La API (`POST /api/ubicaciones-gps`) ya acepta al rol `conductor`, pero hoy no valida que el
    conductor solo envíe datos de **sus propios** recorridos. Esa validación es necesaria antes de usarlo.

### Baja prioridad / calidad

11. **Tests automáticos.** Hoy todo se probó a mano y con scripts temporales que no están en el repo. Sugerencia:
    `node:test` + `supertest` para el backend, contra una base de prueba aparte.
12. **Tamaño del bundle.** El JS del frontend pesa 1,17 MB porque `jspdf` y `recharts` se cargan siempre.
    Carga Estadísticas con `React.lazy()`.
13. **Cabeceras de seguridad.** Agregar `helmet` al backend.
14. **Pantalla de administración de usuarios** (para `admin_ti`): hoy solo se crean por consola o al
    registrar un conductor.

---

## 8. Cómo se verificó

- **Backend:** 39 casos de CRUD (validaciones, duplicados, claves foráneas, cascadas, borrados bloqueados) y 21
  de autenticación (tokens inválidos, roles, usuario desactivado, CORS). Todos pasaron.
- **Frontend:** se manejó la app con un navegador real (Edge en modo headless): login, crear, editar, filtrar y
  eliminar vehículos, registrar un conductor con cuenta, iniciar sesión como conductor y comprobar que no puede
  administrar, y la sesión al recargar. `npm run lint` y `npm run build` terminan sin errores.
