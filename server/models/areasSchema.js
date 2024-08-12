const mongoose = require('mongoose');

const areasSchema = new mongoose.Schema({
  departamento: { type: String, required: true },
  areas: { type: [String], required: true }
});

const Areas = mongoose.model('Areas', areasSchema);

module.exports = Areas;