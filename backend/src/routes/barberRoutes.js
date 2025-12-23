const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/login', barberController.login);
router.post('/register', upload.single('foto_perfil'), barberController.registerBarber);
router.post('/send-code', barberController.sendVerificationCode);
router.get('/logs', auth, barberController.getLogs);

module.exports = router;