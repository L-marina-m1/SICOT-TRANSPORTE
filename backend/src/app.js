const express = require('express');
const cors = require('cors');

const { corsOrigen } = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Solo el frontend configurado puede llamar a la API desde el navegador.
app.use(cors({ origin: corsOrigen.split(',').map((o) => o.trim()) }));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: 'API REST de SICOT funcionando correctamente' });
});
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
