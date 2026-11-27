const mariadb = require('mariadb');
const { db } = require('./env');

const pool = mariadb.createPool({
    ...db,
    connectionLimit: 10,
    // Evita BigInt en los resultados: res.json() no sabe serializarlos.
    bigIntAsNumber: true,
    insertIdAsNumber: true,
    decimalAsNumber: true,
    // DATE/DATETIME como texto ('2026-11-27', '2026-11-27 08:30:00'):
    // evita que se conviertan a UTC y la fecha salga un día corrida.
    dateStrings: true,
});

// Sin este listener, un fallo al conectar emite 'error' sin manejar y tumba el proceso.
pool.on('error', (error) => {
    console.error('Error en el pool de MariaDB:', error.message);
});

module.exports = pool;
