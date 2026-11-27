# SICOT — Sistema de Control y Seguimiento de Transporte

- `backend/`: API REST (Node.js + Express 5 + MariaDB)
- `frontend/`: panel web (React + Vite)

## Primera vez

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # completa DB_* y genera JWT_SECRET (el comando está en el archivo)

# 2. Primer usuario (no se puede crear desde la web porque nadie ha iniciado sesión aún)
npm run crear-usuario -- --nombre "Tu Nombre" --correo tu@correo.pe --rol gerencia --password "UnaClaveSegura"

# 3. Frontend
cd ../frontend
npm install
```

Para crear la base desde cero ejecuta `backend/database/migrations/000_esquema_inicial.sql`.
Si ya tenías `sicot_db` creada con otro charset, ejecuta también `001_convertir_a_utf8mb4.sql`.

Detalle de todos los cambios y tareas pendientes: [docs/TRASPASO.md](docs/TRASPASO.md).

## Día a día

Abre dos terminales:

```bash
cd backend  && npm run dev     # http://localhost:3000
cd frontend && npm run dev     # http://localhost:5173
```

En desarrollo, Vite reenvía `/api` al backend, así que no hace falta configurar CORS ni URLs.

## Roles

| Rol | Puede |
|---|---|
| `gerencia`, `admin_ti` | Todo: usuarios, conductores, contratos, vehículos y recorridos |
| `conductor` | Ver vehículos, conductores y recorridos; registrar asistencias y ubicaciones GPS |

## API

Todas las rutas (salvo `/api/auth/login` y `/api/probar-bd`) exigen `Authorization: Bearer <token>`.

| Recurso | Filtros (`?campo=valor`) |
|---|---|
| `/api/usuarios` | rol, estado, correo |
| `/api/conductores` | estado, dni, usuario_id |
| `/api/contratos` | conductor_id, estado |
| `/api/vehiculos` | estado, tipo, placa |
| `/api/recorridos` | conductor_id, vehiculo_id, estado |
| `/api/asistencias` | conductor_id, fecha, estado |
| `/api/ubicaciones-gps` | recorrido_id |

Cada recurso tiene `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id` y `DELETE /:id`,
y admite paginación opcional con `?limite=50&pagina=2`.

Para agregar un recurso nuevo: crea su esquema en `backend/src/modules/<nombre>/` y regístralo en
`backend/src/routes/index.js`.
