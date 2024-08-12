// ishikawa.js
const mongoose = require('mongoose');

const diagramaSchema = new mongoose.Schema({
    problema: String,
    text1: String,
    text2: String,
    text3: String,
    text4: String,
    text5: String,
    text6: String,
    text7: String,
    text8: String,
    text9: String,
    text10: String,
    text11: String,
    text12: String,
    text13: String,
    text14: String,
    text15: String
});

const actividadSchema = new mongoose.Schema({
    actividad: String,
    responsable: String,
    fechaCompromiso: [String],
});

const correccionSchema = new mongoose.Schema({
    actividad: String,
    responsable: String,
    fechaCompromiso: [String],
    cerrada: String
});

const ishikawaSchema = new mongoose.Schema({
    idRep: String,
    idReq: String,
    proName: String,
    problema: String,
    afectacion: String,
    fecha: String,
    auditado: String,
    requisito: String,
    hallazgo: String,
    correccion: String,
    causa: String,
    diagrama:[diagramaSchema],
    participantes: String,
    actividades: [actividadSchema],
    correcciones: [correccionSchema],
    estado: String,
    notaRechazo: String,
    fechaElaboracion: String
});

const Ishikawa = mongoose.model('Ishikawa', ishikawaSchema);

module.exports = Ishikawa;
