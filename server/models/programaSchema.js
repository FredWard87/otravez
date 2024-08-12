const mongoose = require('mongoose');


const RequisitosSchema = new mongoose.Schema({
  ID: { type: String, required: true },
  Requisito: { type: String, required: true }
});

const programasSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Descripcion: [RequisitosSchema]
});

const Programas = mongoose.model('Programas', programasSchema);

module.exports = Programas;