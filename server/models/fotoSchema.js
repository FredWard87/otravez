const mongoose = require('mongoose');

const fotoSchema = new mongoose.Schema({
  image: String,
});

const Foto = mongoose.model('Foto', fotoSchema);

module.exports = Foto;