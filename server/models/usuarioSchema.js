const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UsuariosSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Correo: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un correo válido"],
  },
  AñosExperiencia: { type: Number, default: 0 },
  Contraseña: { type: String, required: true },
  Puesto: {
    type: String,
    required: function() {
      return this.TipoUsuario === 'auditor';
    }
  },
  FechaIngreso: {
    type: Date,
    required: function() {
      return this.TipoUsuario === 'auditor';
    }
  },
  Escolaridad: {
    type: String,
    required: function() {
      return this.TipoUsuario === 'auditor';
    }
  },
  Carrera: {
    type: String,
    required: function() {
      return this.TipoUsuario === 'auditor';
    }
  },
  TipoUsuario: { type: String, required: true },
  PromedioEvaluacion: { type: Number, default: 0 },
  PuntuacionEspecialidad: { type: Number, default: 0 },
  FormaParteEquipoInocuidad: { type: Boolean, default: false },
  Aprobado: { type: Boolean, default: false },
  calificaciones: [
    {
      nombreCurso: { type: String, required: true },
      calificacion: { type: Number, required: true }
    }
  ],
  Departamento: { type: String, required: true } // Añadido
});

// Hash de la contraseña antes de guardar
UsuariosSchema.pre('save', async function(next) {
  if (this.isModified('Contraseña')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.Contraseña = await bcrypt.hash(this.Contraseña, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Métodos para verificar la contraseña
UsuariosSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Contraseña);
};

module.exports = mongoose.model("Usuarios", UsuariosSchema);