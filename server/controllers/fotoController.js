const Foto = require('../models/fotoSchema');

const guardarFoto = async (req, res) => {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No se ha proporcionado una imagen' });
    }
  
    try {
      const nuevaFoto = new Foto({ image });
      await nuevaFoto.save();
      return res.status(201).json({ message: 'Imagen guardada exitosamente' });
    } catch (err) {
      console.error('Error al guardar la imagen:', err); // Aquí imprime el error
      return res.status(500).json({ error: 'Error interno del servidor al guardar la imagen' });
    }
  };
  

module.exports = {
  guardarFoto,
};
