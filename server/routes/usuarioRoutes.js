const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarioController');

// Ruta para el registro de usuarios (POST)
router.post('/', usuariosController.registroUsuario);

// Ruta para obtener todos los usuarios (GET)
router.get('/', usuariosController.obtenerUsuarios);

// Ruta para obtener un usuario por su ID (GET)
router.get('/:id', usuariosController.obtenerUsuarioPorId);

// Ruta para actualizar un usuario por su ID (PUT)
router.put('/:id', usuariosController.actualizarUsuario);

// Ruta para eliminar un usuario por su ID (DELETE)
router.delete('/:id', usuariosController.eliminarUsuario);

router.get('/nombre/:nombre', usuariosController.obtenerUsuarioPorNombre);

router.put('/cambiarPassword/:id', usuariosController.cambiarPassword);

module.exports = router;
