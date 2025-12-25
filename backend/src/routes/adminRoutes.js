const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');

// Rota para criar o primeiro admin
router.post('/setup-master', adminController.createMaster);
router.post('/login', adminController.login);
router.post('/generate-key', auth, adminController.generateKey);
router.get('/keys', auth, adminController.getKeys);
router.delete('/keys/:id', auth, adminController.deleteKey);
router.get('/pendentes', auth, adminController.getAguardandoLicenca);
router.post('/enviar-chave', auth, adminController.gerarEEnviarChave);

module.exports = router;