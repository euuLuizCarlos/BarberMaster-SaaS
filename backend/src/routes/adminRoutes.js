const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');

// Rota para criar o primeiro admin
router.post('/setup-master', adminController.createMaster);
router.post('/login', adminController.login);
router.post('/generate-key', auth, adminController.generateKey);

module.exports = router;