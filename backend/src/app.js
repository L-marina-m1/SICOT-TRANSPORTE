const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: 'API REST de SICOT funcionando correctamente' });
});
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
