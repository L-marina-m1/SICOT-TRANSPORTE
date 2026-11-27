/**
 * Carga datos de demostración para probar el sistema en local.
 *
 *   npm run demo            -> crea los datos demo
 *   npm run demo -- --borrar -> elimina solo los datos demo
 *
 * Los datos demo se identifican por sus DNI, placas y correos fijos (abajo),
 * así que nunca toca registros reales.
 */
const { parseArgs } = require('node:util');
const pool = require('../src/config/database');
const crearCrudService = require('../src/core/crud/crearCrudService');
const { crearValidador } = require('../src/core/validation/crearValidador');

const modulo = (nombre) => {
    const esquema = require(`../src/modules/${nombre}`);
    const service = crearCrudService(esquema);
    const { validarDatos } = crearValidador(esquema);
    return { crear: (datos) => service.crear(validarDatos(datos)) };
};

const usuarios = modulo('usuarios/usuarios.schema');
const conductores = modulo('conductores/conductores.schema');
const contratos = modulo('contratos/contratos.schema');
const vehiculos = modulo('vehiculos/vehiculos.schema');
const recorridos = modulo('recorridos/recorridos.schema');
const asistencias = modulo('asistencias/asistencias.schema');
const ubicaciones = modulo('ubicaciones-gps/ubicacionesGps.schema');

const CORREO_CONDUCTOR = 'conductor.demo@sicot.pe';
const CLAVE_CONDUCTOR = 'Conductor-Demo-2026';

const CONDUCTORES = [
    { dni: '40000001', nombres: 'Carlos', apellidos: 'Quispe Mamani', licencia_conducir: 'Q40000001', categoria_licencia: 'A-IIIb', telefono: '951 111 001', fecha_vencimiento_licencia: '2028-03-15' },
    { dni: '40000002', nombres: 'Luis', apellidos: 'Mamani Ccori', licencia_conducir: 'Q40000002', categoria_licencia: 'A-IIb', telefono: '951 111 002', fecha_vencimiento_licencia: '2027-08-01' },
    { dni: '40000003', nombres: 'Ana', apellidos: 'Flores Huanca', licencia_conducir: 'Q40000003', categoria_licencia: 'A-IIb', telefono: '951 111 003', fecha_vencimiento_licencia: '2026-10-30' },
    { dni: '40000004', nombres: 'Pedro', apellidos: 'Condori Ñaupa', licencia_conducir: 'Q40000004', categoria_licencia: 'A-IIIa', telefono: '951 111 004', fecha_vencimiento_licencia: '2029-01-20' },
];

const VEHICULOS = [
    { placa: 'DEF-456', marca: 'Hyundai', modelo: 'County', anio: 2019, color: 'Blanco', tipo: 'Minibús', capacidad: 25, kilometraje: 182300, estado: 'en_ruta' },
    { placa: 'GHI-321', marca: 'Toyota', modelo: 'Coaster', anio: 2021, color: 'Rojo', tipo: 'Minibús', capacidad: 29, kilometraje: 96450, estado: 'en_ruta' },
    { placa: 'JKL-654', marca: 'Mercedes-Benz', modelo: 'Sprinter', anio: 2018, color: 'Plata', tipo: 'Van', capacidad: 19, kilometraje: 240100, estado: 'mantenimiento' },
    { placa: 'MNO-789', marca: 'Nissan', modelo: 'Urvan', anio: 2020, color: 'Blanco', tipo: 'Combi', capacidad: 15, kilometraje: 130870, estado: 'disponible' },
];

const DNIS = CONDUCTORES.map((c) => c.dni);
const PLACAS = VEHICULOS.map((v) => v.placa);

function fechaLocal(diasAtras = 0) {
    const d = new Date();
    d.setDate(d.getDate() - diasAtras);
    const dos = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

async function borrar() {
    const lista = (valores) => valores.map(() => '?').join(', ');
    // Orden inverso a las claves foráneas. Las ubicaciones GPS se borran en cascada con los recorridos.
    await pool.query(
        `DELETE FROM recorridos WHERE vehiculo_id IN (SELECT id FROM vehiculos WHERE placa IN (${lista(PLACAS)}))
            OR conductor_id IN (SELECT id FROM conductores WHERE dni IN (${lista(DNIS)}))`,
        [...PLACAS, ...DNIS]
    );
    for (const tabla of ['asistencias', 'contratos']) {
        await pool.query(
            `DELETE FROM ${tabla} WHERE conductor_id IN (SELECT id FROM conductores WHERE dni IN (${lista(DNIS)}))`,
            DNIS
        );
    }
    await pool.query(`DELETE FROM conductores WHERE dni IN (${lista(DNIS)})`, DNIS);
    await pool.query(`DELETE FROM vehiculos WHERE placa IN (${lista(PLACAS)})`, PLACAS);
    await pool.query('DELETE FROM usuarios WHERE correo = ?', [CORREO_CONDUCTOR]);
    console.log('Datos demo eliminados.');
}

async function crear() {
    const [existe] = await pool.query('SELECT id FROM conductores WHERE dni = ?', [DNIS[0]]);
    if (existe) {
        console.log('Los datos demo ya existen. Usa "npm run demo -- --borrar" para quitarlos primero.');
        return;
    }

    const usuarioConductor = await usuarios.crear({
        nombre: 'Carlos Quispe Mamani', correo: CORREO_CONDUCTOR, password: CLAVE_CONDUCTOR, rol: 'conductor',
    });

    const c = [];
    for (const [i, datos] of CONDUCTORES.entries()) {
        c.push(await conductores.crear(i === 0 ? { ...datos, usuario_id: usuarioConductor.id } : datos));
    }
    const v = [];
    for (const datos of VEHICULOS) v.push(await vehiculos.crear(datos));

    for (const [i, conductor] of c.entries()) {
        await contratos.crear({
            conductor_id: conductor.id,
            numero_contrato: `CTR-DEMO-00${i + 1}`,
            tipo_contrato: 'Plazo fijo',
            fecha_inicio: '2026-01-01',
            fecha_fin: '2026-12-31',
            salario: 1800 + i * 150,
        });
    }

    const hoy = fechaLocal();
    const ayer = fechaLocal(1);

    const enCurso1 = await recorridos.crear({
        conductor_id: c[0].id, vehiculo_id: v[0].id, fecha_inicio: `${hoy} 06:10`,
        origen: 'Terminal Terrestre Puno', destino: 'Juliaca', estado: 'en_curso',
    });
    const enCurso2 = await recorridos.crear({
        conductor_id: c[1].id, vehiculo_id: v[1].id, fecha_inicio: `${hoy} 06:25`,
        origen: 'Plaza de Armas de Puno', destino: 'Chucuito', estado: 'en_curso',
    });
    await recorridos.crear({
        conductor_id: c[2].id, vehiculo_id: v[3].id, fecha_inicio: `${ayer} 07:00`, fecha_fin: `${ayer} 09:40`,
        origen: 'Puno', destino: 'Ilave', kilometros: 54.3, estado: 'finalizado',
    });
    await recorridos.crear({
        conductor_id: c[3].id, vehiculo_id: v[3].id, fecha_inicio: `${hoy} 15:00`,
        origen: 'Puno', destino: 'Lampa', estado: 'pendiente',
    });

    // Trayectos aproximados reales (lat, lng)
    const trazos = [
        [enCurso1, [[-15.8402, -70.0219], [-15.7655, -70.0452], [-15.6614, -70.0886], [-15.5277, -70.1326]]],
        [enCurso2, [[-15.8402, -70.0280], [-15.8740, -69.9560], [-15.9268, -69.8740], [-16.0055, -69.8375]]],
    ];
    for (const [recorrido, puntos] of trazos) {
        for (const [i, [latitud, longitud]] of puntos.entries()) {
            await ubicaciones.crear({
                recorrido_id: recorrido.id, latitud, longitud, velocidad: 45 + i * 7,
                fecha_hora: `${hoy} ${String(6 + Math.floor((25 + i * 15) / 60)).padStart(2, '0')}:${String((25 + i * 15) % 60).padStart(2, '0')}`,
            });
        }
    }

    await asistencias.crear({ conductor_id: c[0].id, fecha: hoy, hora_entrada: '05:55', estado: 'presente' });
    await asistencias.crear({ conductor_id: c[1].id, fecha: hoy, hora_entrada: '06:12', estado: 'tardanza', observaciones: 'Tráfico en la Av. El Sol' });
    await asistencias.crear({ conductor_id: c[2].id, fecha: hoy, estado: 'justificado', observaciones: 'Cita médica' });

    console.log('Datos demo creados:');
    console.log(`  ${c.length} conductores, ${v.length} vehículos, ${c.length} contratos, 4 recorridos (2 en curso), 8 puntos GPS, 3 asistencias`);
    console.log(`  Cuenta de conductor: ${CORREO_CONDUCTOR} / ${CLAVE_CONDUCTOR}`);
}

const { values } = parseArgs({ options: { borrar: { type: 'boolean', default: false } } });

(values.borrar ? borrar() : crear())
    .catch((error) => {
        console.error('Error:', error.message);
        if (error.detalles) console.error(error.detalles);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
