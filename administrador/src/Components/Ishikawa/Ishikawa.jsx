import React, { useState } from 'react';
import axios from 'axios';
import './css/Ishikawa.css'
import Logo from "../../assets/img/logoAguida.png";
import Navigation from "../Navigation/Navbar";
import Ishikawa from '../../assets/img/Ishikawa-transformed.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const CreacionIshikawa = () => {
  const [isEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    problema: '',
    afectacion: '',
    requisito: '',
    hallazgo: '',
    fecha: '',
    participantes: '',
    correccion: '',
    causa: ''
  });

  const [diagrama, setDiagrama] = useState([{
    problema: '',
    text1: '',
    text2: '',
    text3: '',
    text4: '',
    text5: '',
    text6: '',
    text7: '',
    text8: '',
    text9: '',
    text10: '',
    text11: '',
    text12: '',
    text13: '',
    text14: '',
    text15: ''
  }]);

  const [correcciones, setCorrecciones] = useState([{ actividad: '', responsable: '', fechaCompromiso: '', cerrada: '' }]);
  const [actividades, setActividades] = useState([{ actividad: '', responsable: '', fechaCompromiso: '' }]);
  const [nuevaCorreccion, setNuevaCorreccion] = useState({ actividad: '', responsable: '', fechaCompromiso: '', cerrada: '' });

  const fechaElaboracion = new Date().toISOString();

  const handleDiagrama = (e) => {
    const { name, value } = e.target;
    setDiagrama((prevState) => [{
      ...prevState[0],
      [name]: value
    }]);
  };

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const data = {
        fecha: formData.fecha,
        problema: formData.problema,
        requisito: formData.requisito,
        hallazgo: formData.hallazgo,
        correccion: formData.correccion,
        causa: formData.causa,
        diagrama,
        participantes: formData.participantes,
        afectacion: formData.afectacion,
        actividades,
        correcciones,
        estado: 'Hecho',
        fechaElaboracion
      };
      console.log('Datos enviados:', data);
      const result = await Swal.fire({
        title: '¿Estás seguro de querer guardar?',
        text: 'El diagrama será enviado a revisión.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3ccc37',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      });
      if (result.isConfirmed) {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`, data);
        console.log('Datos guardados:', response.data);
        navigate('/diagrama');
      } else {
        Swal.fire('Cancelado', 'El diagrama no ha sido guardado.', 'info');
      }
    } catch (error) {
      console.error('Error al guardar los datos:', error.response ? error.response.data : error.message);
    }
  };

  const Guardar = async () => {
    if (
      !formData.hallazgo ||
      !formData.requisito||
      !formData.afectacion ||
      !formData.problema ||
      !formData.correccion ||
      !formData.fecha ||
      !formData.causa ||
      diagrama.some(dia => !dia.problema || !dia.text1 || !dia.text2 || !dia.text3 || !dia.text10 || !dia.text11) ||
      actividades.some(act => !act.actividad || !act.responsable || !act.fechaCompromiso)
    ) {
      console.log('Por favor, complete todos los campos requeridos antes de guardar.');
      return;
    }
    await handleSave();
  };

  const agregarFilaActividad = () => {
    setActividades([...actividades, { actividad: '', responsable: '', fechaCompromiso: '' }]);
  };

  const eliminarFilaActividad = (index) => {
    const nuevasActividades = actividades.filter((_, i) => i !== index);
    setActividades(nuevasActividades);
  };

  const handleEliminarFila = (index) => {
    const nuevasCorrecciones = [...correcciones];
    nuevasCorrecciones.splice(index, 1);
    setCorrecciones(nuevasCorrecciones);
  };

  const handleAgregarFila = () => {
    setCorrecciones([...correcciones, nuevaCorreccion]);
    setNuevaCorreccion({ actividad: '', responsable: '', fechaCompromiso: '', cerrada: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Define el tamaño de fuente según el rango de caracteres
    let fontSize;
    if (value.length > 125) {
      fontSize = '10.3px'; // Menos de 78 caracteres
    } else if (value.length > 100) {
      fontSize = '11px'; // Menos de 62 caracteres
    } else if (value.length > 88) {
      fontSize = '12px'; // Menos de 62 caracteres
    } else if (value.length > 78) {
      fontSize = '13px'; // Menos de 62 caracteres
    } else if (value.length > 65) {
      fontSize = '14px'; // Menos de 62 caracteres
    } else {
      fontSize = '15px'; // Por defecto
    }
  
    // Actualiza el estado del diagrama
    setDiagrama(prevState => [{
      ...prevState[0],
      [name]: value
    }]);
  
    // Aplica el nuevo tamaño de fuente al textarea
    e.target.style.fontSize = fontSize;
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <Navigation />
      </div>

      <form onSubmit={(e) => {
          e.preventDefault(); // Prevenir el envío automático del formulario
          if (isEditing) {
            Guardar();
          }
        }}>
      <div>
        <div className="image-container">
        <img src={Logo} alt="Logo Aguida" className='logo-empresa-ish' />
        <h1 style={{position:'absolute', fontSize:'40px'}}>Ishikawa</h1>
          <div className='posicion-en'>
            <h2>Problema:
              <input type="text" className="problema-input" name='problema'
                style={{ marginTop: '0.4rem', color: '#000000' }} placeholder="Agregar problema. . ." required 
                value={formData.problema} onChange={handleFormDataChange} />
            </h2>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2>Afectación:
                <input type="text" className="problema-input" name='afectacion'
                  style={{ marginTop: '0.4rem', color: '#000000' }} placeholder="Agregar afectación. . ." required 
                  value={formData.afectacion} onChange={handleFormDataChange} />
              </h2>
            </div>
          </div>
          <div className='posicion-en-3'>
          GCF015
          </div>
          <div className='posicion-en-2'>
            <h3>Fecha: 
            <input type="date" name='fecha'
                  style={{ marginTop: '0.4rem', color: '#000000' }} placeholder="Agregar afectación. . ." required 
                   onChange={handleFormDataChange} />
            </h3>
          </div>
          <div>
            <img src={Ishikawa} alt="Diagrama de Ishikawa" className="responsive-image" />
            {diagrama.map((dia, index) => (
              <div key={index}>
                <textarea maxLength={145} className="text-area" name='text1' value={dia.text1} onChange={handleInputChange}
                  style={{ top: '19.1rem', left: '8.7rem' }} placeholder="Texto..." required />
                <textarea maxLength={145} className="text-area" name='text2' value={dia.text2} onChange={handleInputChange}
                  style={{ top: '19.1rem', left: '25.4rem' }} placeholder="Texto..." required />
                <textarea maxLength={145} className="text-area" name='text3' value={dia.text3} onChange={handleInputChange}
                  style={{ top: '19.1rem', left: '41.2rem' }} placeholder="Texto..." required />
                <textarea maxLength={145} className="text-area" name='text4' value={dia.text4} onChange={handleInputChange}
                  style={{ top: '23.2rem', left: '12.2rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text5' value={dia.text5} onChange={handleInputChange}
                  style={{ top: '23.2rem', left: '28.8rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text6' value={dia.text6} onChange={handleInputChange}
                  style={{ top: '23.2rem', left: '45rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text7' value={dia.text7} onChange={handleInputChange}
                  style={{ top: '27.2rem', left: '15.5rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text8' value={dia.text8} onChange={handleInputChange}
                  style={{ top: '27.2rem', left: '32.3rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text9' value={dia.text9} onChange={handleInputChange}
                  style={{ top: '27.2rem', left: '48.1rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text10' value={dia.text10} onChange={handleInputChange}
                  style={{ top: '31rem', left: '23rem' }} placeholder="Texto..." required />
                <textarea maxLength={145} className="text-area" name='text11' value={dia.text11} onChange={handleInputChange}
                  style={{ top: '31rem', left: '39.4rem' }} placeholder="Texto..." required />
                <textarea maxLength={145} className="text-area" name='text12' value={dia.text12} onChange={handleInputChange}
                  style={{ top: '35rem', left: '19.7rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text13' value={dia.text13} onChange={handleInputChange}
                  style={{ top: '35rem', left: '36rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text14' value={dia.text14} onChange={handleInputChange}
                  style={{ top: '39rem', left: '16.6rem' }} placeholder="Texto..." />
                <textarea maxLength={145} className="text-area" name='text15' value={dia.text15} onChange={handleInputChange}
                  style={{ top: '39rem', left: '32.8rem' }} placeholder="Texto..." />
                <textarea maxLength="105" className="text-area" name='problema' value={dia.problema} onChange={handleDiagrama}
                  style={{ top: '27rem', left: '67.5rem', width: '8.5rem', height: '8rem' }} placeholder="Problema..." required />
              </div>
            ))}
          </div>

          <div>
            <div className='posicion-bo' style={{ marginRight: '5rem' }}>
              <h3>No conformidad:</h3>
              <textarea type="text" className="textarea-acc" name='requisito'
                style={{ width: '64rem', color: '#000000' }} placeholder="Agregar Acción. . ." value={formData.requisito} onChange={handleFormDataChange} />
              <h3>Hallazgo:</h3>
              <textarea type="text" className="textarea-acc" name='hallazgo'
                style={{ width: '64rem', color: '#000000' }} placeholder="Agregar Hallazgo. . ." value={formData.hallazgo} onChange={handleFormDataChange} />
              <h3>Acción inmediata o corrección:</h3>
              <textarea type="text" className="textarea-acc" name='correccion'
                style={{ width: '64rem', color: '#000000' }} placeholder="Agregar Acción. . ." value={formData.correccion} onChange={handleFormDataChange} />
              <h3>Causa del problema (Ishikawa, TGN, W-W, DCR):</h3>
              <textarea type="text" className="textarea-acc" name='causa'
                style={{ width: '64rem', marginBottom: '20px', color: '#000000' }} placeholder="Agregar Causa. . ." value={formData.causa} onChange={handleFormDataChange} />
            </div>
          </div>

          <div className='table-ish'>
            <table style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th className="conformity-header">Actividad</th>
                  <th className="conformity-header">Responsable</th>
                  <th className="conformity-header">Fecha Compromiso</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((actividad, index) => (
                  <tr key={index}>
                    <td>
                      <textarea
                        className='table-input'
                        type="text"
                        placeholder='Agregar actividad. . .'
                        value={actividad.actividad}
                        onChange={(e) => {
                          const newActividades = [...actividades];
                          newActividades[index].actividad = e.target.value;
                          setActividades(newActividades);
                        }}
                        required
                      />
                    </td>
                    <td>
                      <textarea
                        className='table-input'
                        type="text"
                        placeholder='Agregar responsable. . .'
                        value={actividad.responsable}
                        onChange={(e) => {
                          const newActividades = [...actividades];
                          newActividades[index].responsable = e.target.value;
                          setActividades(newActividades);
                        }}
                        required
                      />
                    </td>
                    <td>
                      <div>
                        <input
                          type="date"
                          value={actividad.fechaCompromiso}
                          onChange={(e) => {
                            const newActividades = [...actividades];
                            newActividades[index].fechaCompromiso = e.target.value;
                            setActividades(newActividades);
                          }}
                          required
                        />
                      </div>
                    </td>
                    <td className='cancel-acc'>
                      <button type='button' onClick={() => eliminarFilaActividad(index)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type='button' onClick={(e) => {
              e.preventDefault();
              agregarFilaActividad();
            }} className='button-agregar'>Agregar Fila</button>

            <table style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th className="conformity-header">Actividad</th>
                  <th className="conformity-header">Responsable</th>
                  <th className="conformity-header">Fecha Compromiso</th>
                  <th colSpan="2" className="conformity-header">
                    Acción Correctiva Cerrada
                    <div style={{ display: 'flex' }}>
                      <div className="left">Sí</div>
                      <div className="right">No</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {correcciones.map((correccion, index) => (
                  <tr key={index}>
                    <td>
                      <textarea
                        type="text"
                        style={{border:'none'}}
                        placeholder='Agregar actividad. . .'
                        value={correccion.actividad}
                        onChange={(e) => {
                          const newCorrecciones = [...correcciones];
                          newCorrecciones[index].actividad = e.target.value;
                          setCorrecciones(newCorrecciones);
                        }}
                        className="no-border"
                      />
                    </td>
                    <td>
                      <textarea
                        type="text"
                        style={{border:'none'}}
                        placeholder='Agregar responsable. . .'
                        value={correccion.responsable}
                        onChange={(e) => {
                          const newCorrecciones = [...correcciones];
                          newCorrecciones[index].responsable = e.target.value;
                          setCorrecciones(newCorrecciones);
                        }}
                        className="no-border"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={correccion.fechaCompromiso}
                        onChange={(e) => {
                          const newCorrecciones = [...correcciones];
                          newCorrecciones[index].fechaCompromiso = e.target.value;
                          setCorrecciones(newCorrecciones);
                        }}
                        className="no-border"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={correccion.cerrada === 'Sí'}
                        onChange={(e) => {
                          const newCorrecciones = [...correcciones];
                          newCorrecciones[index].cerrada = e.target.checked ? 'Sí' : 'No';
                          setCorrecciones(newCorrecciones);
                        }}
                        className="no-border"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={correccion.cerrada === 'No'}
                        onChange={(e) => {
                          const newCorrecciones = [...correcciones];
                          newCorrecciones[index].cerrada = e.target.checked ? 'No' : 'Sí';
                          setCorrecciones(newCorrecciones);
                        }}
                        className="no-border"
                      />
                    </td>
                    <td className='cancel-acc'>
                      <button type='button' onClick={() => handleEliminarFila(index)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <button type='button' onClick={handleAgregarFila} className='button-agregar'>Agregar Fila</button>
            </div>
          </div>
          <button type='submit'className='button-generar-ish'  onClick={Guardar}>Guardar</button>
        </div>
      </div>
    </form>
    </div>
  );
};

export default CreacionIshikawa;
