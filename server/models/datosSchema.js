const mongoose = require("mongoose");

const DescripcionSchema = new mongoose.Schema({
  ID: { type: String, required: true },
  Criterio: { type: String },
  Requisito: { type: String, required: true },
  Observacion: { type: String },
  Hallazgo: String,
});

const ProgramaSchema = new mongoose.Schema({
  Porcentaje: { type: String, required: true },
  Nombre: { type: String, required: true },
  Descripcion: [DescripcionSchema]
});

const EquipoSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Correo: { type: String, required: true }
});

const AuditadosSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Correo: { type: String, required: true }
});

const DatosSchema = new mongoose.Schema({
  TipoAuditoria: { type: String, required: true },
  FechaInicio: { type: String, required: true },
  FechaFin: { type: String, required: true },
  Duracion: { type: String, required: true },
  Departamento: { type: String, required: true },
  AreasAudi: { type: [String], required: true },
  Auditados: [AuditadosSchema],
  AuditorLider: { type: String, required: true },
  Objetivo: {type: String},
  AuditorLiderEmail: { type: String, required: true },
  EquipoAuditor: [EquipoSchema],
  Observador: { type: Boolean, required: true },
  NombresObservadores: { type: String, required: false },
  Programa: [ProgramaSchema],
  Estado: { type: String, required: false },
  PorcentajeTotal: { type: String, required: false },
  FechaElaboracion: { type: String, required: false },
  Comentario:{ type: String, required: false },
  Estatus:{ type: String, required: false },
  PorcentajeCump: { type: String, required: false },
  PuntuacionMaxima: { type: Number, required: false },  
  PuntuacionObten: { type: Number, required: false },
  PuntuacionConf: { type: Number, required: false }
});

const Datos = mongoose.model("Datos", DatosSchema);

module.exports = Datos;