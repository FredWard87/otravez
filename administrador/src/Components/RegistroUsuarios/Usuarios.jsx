import React, { useState } from 'react';
import axios from 'axios';
import './css/usuarios.css';

const RegistroUsuario = () => {
  const [formData, setFormData] = useState({
    Nombre: '',
    Correo: '',
    Contraseña: '',
    ConfirmarContraseña: '',
    Puesto: '',
    FechaIngreso: '',
    Escolaridad: '',
    TipoUsuario: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.Contraseña !== formData.ConfirmarContraseña) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/usuarios`, formData);
      alert("Usuario registrado con éxito");
      console.log(response.data);

      // Limpiar los campos del formulario después de agregar un usuario exitosamente
      setFormData({
        Nombre: '',
        Correo: '',
        Contraseña: '',
        ConfirmarContraseña: '',
        Puesto: '',
        FechaIngreso: '',
        Escolaridad: '',
        TipoUsuario: ''
      });
    } catch (error) {
      console.error(error);
      alert("Error al registrar el usuario");
    }
  };

  const renderAdditionalFields = () => {
    if (formData.TipoUsuario === 'auditor') {
      return (
        <div>
          <div className="form-group">
            <label>Puesto:</label>
            <input type="text" name="Puesto" value={formData.Puesto} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha de ingreso:</label>
            <input type="date" name="FechaIngreso" value={formData.FechaIngreso} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Escolaridad:</label>
            <input type="text" name="Escolaridad" value={formData.Escolaridad} onChange={handleChange} required />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="registro-folder">
      <div className="registro-tab"></div>
      <div className="registro-container">
        <form onSubmit={handleSubmit} className="registro-form">
          <h2>Registro de usuario:</h2>
          <div className="form-group">
            <label>Tipo de usuario:</label>
            <select name="TipoUsuario" value={formData.TipoUsuario} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              <option value="auditor">Auditor</option>
              <option value="auditado">Auditado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nombre completo:</label>
            <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Correo:</label>
            <input type="email" name="Correo" value={formData.Correo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input type="password" name="Contraseña" value={formData.Contraseña} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirmar contraseña:</label>
            <input type="password" name="ConfirmarContraseña" value={formData.ConfirmarContraseña} onChange={handleChange} required />
          </div>
          {renderAdditionalFields()}
          <button type="submit" className="btn-registrar-us">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistroUsuario;
