const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middlewares/authMiddleware');

// Rota pública: O cliente final agenda sem precisar de login
router.post('/book', appointmentController.createAppointment);

// Rota privada: Só o barbeiro vê a sua própria agenda
router.get('/my-agenda', auth, appointmentController.getMyAppointments);
router.get('/dashboard', auth, appointmentController.getDashboard);
router.patch('/:id/status', auth, appointmentController.updateStatus);

module.exports = router;