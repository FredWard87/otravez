const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuarios = require('../models/usuarioSchema');
const dotenv = require('dotenv');

dotenv.config();

// Ruta para verificar el token JWT
router.post('/verifyToken', async (req, res) => {
  const token = req.body.token;

  try {
    // Verifica el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca al usuario en la base de datos usando el ID del token decodificado
    const usuario = await Usuarios.findById(decoded.userId);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Retorna la información del usuario
    return res.status(200).json({
      Correo: usuario.Correo,
      Nombre: usuario.Nombre,
      TipoUsuario: usuario.TipoUsuario,
      Puesto: usuario.Puesto,
      Departamento: usuario.Departamento,
      ID:usuario.id
    });
  } catch (err) {
    // El token no es válido o hubo otro error
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;