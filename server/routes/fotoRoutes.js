const express = require('express');
const router = express.Router();
const fotoController = require('../controllers/fotoController');

router.post('/', fotoController.guardarFoto);

module.exports = router;