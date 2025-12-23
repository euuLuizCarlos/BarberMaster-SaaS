const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const barberRoutes = require('./routes/barberRoutes');



const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Muitas requisições vindas deste IP, tente novamente em 15 minutos."
});

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/admin', adminRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use(limiter);

//testes aqui.
app.get('/', (req, res) => {
  res.json({ message: "Sistema BarberMaster - API V1 Online 🚀" });
});

module.exports = app;