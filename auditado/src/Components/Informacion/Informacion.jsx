import React, { useContext, useState } from 'react';
import axios from 'axios';
import './css/Info.css'
import { UserContext } from '../../App';
import Navigation from '../Navigation/navbar';

const Informacion = () => {
  const { userData } = useContext(UserContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  if (!userData) {
    return <div>No hay información disponible.</div>;
  }

  let tipo = userData.TipoUsuario;

  if (userData.TipoUsuario === 'auditado') {
    tipo = 'Auditado';
  }

  const validatePassword = (password) => {
    const exactLength = 8; // Cambiado de minLength a exactLength para claridad
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length === exactLength && hasUpperCase && hasNumber;
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage('La contraseña debe tener 8 caracteres, incluir al menos una mayúscula y un número');
      return;
    }

    let _id = userData.ID ? userData.ID : userData._id;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/usuarios/cambiarPassword/${_id}`, 
        { password: newPassword },
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      );
      setMessage('Contraseña actualizada exitosamente');
      
      // Limpiar el formulario
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage('Error al actualizar la contraseña');
    }
  };

  return (
    <div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
            </div>
    <div className='content-inf'>
      <h1 className='inf-usuario'>Información del Usuario</h1>
      <p>Nombre: {userData.Nombre}</p>
      <p>Email: {userData.Correo}</p>
      <p>Tipo de Usuario: {tipo}</p>
      <p>Puesto: {userData.Puesto}</p>
      <p>Departamento: {userData.Departamento}</p>
      
      <h2 className='inf-usuario'>Cambiar Contraseña</h2>
      <div className='inf-contra'>
      <input 
      className='input-inf'
        type="password" 
        placeholder="Nueva Contraseña" 
        value={newPassword} 
        onChange={(e) => setNewPassword(e.target.value)} 
      />
      <input 
      className='input-inf'
        type="password" 
        placeholder="Confirmar Nueva Contraseña" 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
      />
    </div>
    <div  className='inf-contra'>
    <button onClick={handlePasswordChange}>Cambiar Contraseña</button>
      {message && <p>{message}</p>}
      </div>
    </div>
    </div>
  );
};

export default Informacion;
