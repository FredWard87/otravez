import React, { useEffect, useState, useContext } from 'react';
import './css/Ishikawa.css';
import ishikawa from '../../assets/img/Ishikawa-transformed.png';
import Navigation from "../Navigation/navbar";
import Logo from "../../assets/img/logoAguida.png";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../App';
import Swal from 'sweetalert2'; 
import withReactContent from 'sweetalert2-react-content';

const Ishikawa = () => {
  const { userData } = useContext(UserContext);
  const [datos, setDatos] = useState(null);
  const [programa, setPrograma] = useState(null);
  const [descripcion, setDescripcion] = useState(null);
  const [requisito, setRequisito] = useState('');
  const { _id, id, nombre} = useParams();
  const [hallazgo, setHallazgo] = useState('');
  const [auditado, setAuditados] = useState('');
  const [proceso,  setEnProceso] = useState([]);
  const [asignado,  setAsignado] = useState([]);
  const [revisado,  setRevisado] = useState([]);
  const [aprobado,  setAprobado] = useState([]);
  const [estRech,  setEstRech] = useState([]);
  const [showPart, setShowPart] = useState(true);
  const [rechazo,  setRechazo] = useState([]);
  const [problema, setProblema] = useState(''); // Almacena el valor del problema
  const [nota,  setNota] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fechaElaboracion, setFechaElaboracion] = useState('');
  const [tempFechaCompromiso, setTempFechaCompromiso] = useState('');
  const [, setSelectedTextareas] = useState(new Set());
  const MySwal = withReactContent(Swal);
 
  const [formData,setData] = useState({
    problema: '',
    afectacion: '',
    fecha: '',
    participantes: '',
    correccion: '',
    causa: ''
  });
  
  const [diagrama,setDiagrama] = useState([{
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
   
   const [actividades, setActividades] = useState({ actividad: '', responsable: '', fechaCompromiso: [] });

  const idRep = _id;

  console.log('ID recibido 1:', _id);
  console.log('ID recibido:', id);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
        if (userData && userData.Correo) {
          const datosFiltrados = response.data.find(dato => dato._id === _id);
          if (datosFiltrados) {
            const programaEncontrado = datosFiltrados.Programa.find(prog => 
              prog.Descripcion.some(desc => desc.ID === id && prog.Nombre === nombre)
            );
            if (programaEncontrado) {
              const descripcionEncontrada = programaEncontrado.Descripcion.find(desc => desc.ID === id);
              setDatos(datosFiltrados);
              setPrograma(programaEncontrado);
              setDescripcion(descripcionEncontrada);
              setRequisito(descripcionEncontrada.Requisito);
              setHallazgo(descripcionEncontrada.Hallazgo);
              setProblema(descripcionEncontrada.Observacion);
              setAuditados(descripcionEncontrada.Auditados);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
  
    obtenerDatos();
  }, [userData, _id, id, nombre]);  

  useEffect(() => {
    verificarRegistro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id, id]);

  useEffect(() => {
    if (datos) {
      const formattedDate = new Date(datos.FechaElaboracion).toLocaleDateString();
      setFechaElaboracion(formattedDate);
      
    }
  }, [datos]);

  useEffect(() => {
    const simulateInputChange = () => {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((textarea) => {
        const event = {
          target: textarea,
          name: textarea.name,
          value: textarea.value
        };
        handleInputChange(event);
      });
    };

    simulateInputChange(); // Ejecutar la función al cargar el componente

  }, [proceso]);

  const verificarRegistro = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`, {
        params: {
            idRep: _id,
            idReq: id,
            proName: nombre
        }
       }); 
      const registros = response.data;
      const registroRechazado = registros.find(item => item.idRep === _id && item.idReq === id && item.proName === nombre);
      const registroExistente = response.data.some(item => item.idRep === _id && item.idReq === id && item.proName === nombre &&  item.estado === 'En revisión');
      const registroAprobado = response.data.some(item => item.idRep === _id && item.idReq === id && item.proName === nombre &&  (item.estado === 'Aprobado'));
      const registroRevisado = response.data.some(item => item.idRep === _id && item.idReq === id && item.proName === nombre &&  item.estado === 'Revisado' );
      const registroEstadoRe = response.data.some(item => item.idRep === _id && item.idReq === id && item.proName === nombre &&  item.estado === 'Rechazado' );
      const registroAsignado = response.data.some(item => item.idRep === _id && item.idReq === id && item.proName === nombre &&  item.estado === 'Asignado' );
      setAsignado(registroAsignado);
      setEstRech(registroEstadoRe);
      setAprobado(registroAprobado);
      setRevisado(registroRevisado);
      setEnProceso(registroExistente);
      setRechazo(Array.isArray(registros) ? registros : [registros]);

      if (registroRechazado) {
        setData({
          problema: registroRechazado.problema,
          afectacion: registroRechazado.afectacion,
          correccion: registroRechazado.correccion,
          causa: registroRechazado.causa,
          participantes: registroRechazado.participantes,
          notaRechazo: registroRechazado.notaRechazo
        });
        setDiagrama(registroRechazado.diagrama);
        setActividades(registroRechazado.actividades);
        setIsEditing(true);
      }
      setNota(registroRechazado.notaRechazo);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}

const handleTempFechaChange = (value) => {
    setTempFechaCompromiso(value);
};

const handleDoubleClick = (e) => {
  const textarea = e.target;

  setSelectedTextareas((prevSelected) => {
    const newSelected = new Set(prevSelected);

    if (newSelected.has(textarea)) {
      // Si el textarea ya está seleccionado, deseleccionarlo
      newSelected.delete(textarea);
      textarea.style.backgroundColor = '';
    } else {
      // Si el textarea no está seleccionado, seleccionarlo
      newSelected.add(textarea);
      textarea.style.backgroundColor = '#f1fc5e9f';
      textarea.style.borderRadius = '10px';
    }

    // Actualizar los textos seleccionados en el campo 'causa'
    setData((prevState) => ({
      ...prevState,
      causa: Array.from(newSelected).map(t => t.value).join('; ')
    }));

    return newSelected;
  });

  textarea.select(); // Selecciona el texto dentro del textarea
};

  const handleUpdate = async () => {
    try {
      // Verificar que `rechazo` no esté vacío
      if (rechazo.length === 0) {
        alert('No hay datos para actualizar');
        return;
      }
      // Obtener el `_id` del primer elemento de `rechazo`
      const { _id } = rechazo[0];
  
      const data = {
        idRep: idRep.idRepo,
        idReq: id,
        fecha: fechaElaboracion,
        auditado,
        problema: problema,
        requisito,
        hallazgo,
        correccion: formData.correccion,
        causa: formData.causa,
        diagrama,
        participantes: formData.participantes,
        afectacion: formData.afectacion,
        actividades,
        estado: 'En revisión'
      };
  
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/completo/${_id}`, data);
      console.log('Datos actualizados:', response.data);
      Swal.fire({
        title: 'Actualizado',
        text: 'El diagrama se ha actualizado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      verificarRegistro();
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
    }
  };  

  const Actualizar = async () => {
    Swal.fire({
      title: '¿Está seguro de querer reenviar el diagrama?',
      text: '¡El diagrama sera mandado ha revisión!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3ccc37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reenviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdate();
      }
    });
  };

  const handleUpdateAdvance = async () => {
    try {
      // Verificar que `rechazo` no esté vacío
      if (rechazo.length === 0) { 
        alert('No hay datos para actualizar');
        return;
      }
  
      // Obtener el `_id` del primer elemento de `rechazo`
      const { _id } = rechazo[0];
  
      const data = {
        idRep: idRep.idRepo,
        idReq: id,
        fecha: fechaElaboracion,
        auditado,
        problema: descripcion.Problema,
        requisito,
        hallazgo,
        correccion: formData.correccion,
        causa: formData.causa,
        diagrama,
        participantes: formData.participantes,
        afectacion: formData.afectacion,
        actividades,
        estado: 'Asignado'
      };
  
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/${_id}`, data);
      console.log('Datos actualizados:', response.data);
      Swal.fire({
        title: 'Actualizado',
        text: 'El diagrama se ha actualizado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      verificarRegistro();
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
    }
  };

  // En el método handleDiagrama agrega el siguiente código para manejar el click
  const handleDiagrama = (e) => {
    const { name, value } = e.target;
    setDiagrama((prevState) => [{
      ...prevState[0],
      [name]: value
    }]);
  };

  const handleDatos = (e) => {
    const { name, value } = e.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveAdvance = async () => {
    try {
      const data = {
        idRep:_id,
        idReq: id,
        fecha: fechaElaboracion,
        auditado,
        problema: formData.problema,
        requisito,
        hallazgo,
        correccion: formData.correccion,
        causa: formData.causa,
        diagrama,
        participantes: formData.participantes,
        afectacion: formData.afectacion,
        actividades,
        estado: 'Pendiente'
      };
      // Realizar la llamada a la API para guardar los datos
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`, data);
      console.log('Datos guardados:', response.data);
      // Llamar a verificarRegistro después de confirmar
      verificarRegistro();

      Swal.fire({
        title: 'Cambios guardados',
        text: 'Los cambios se guardaron exitosamente.',
        icon: 'success',
      });
    
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        idRep:_id,
        idReq: id,
        fecha: fechaElaboracion,
        auditado,
        problema: formData.problema,
        requisito,
        hallazgo,
        correccion: formData.correccion,
        causa: formData.causa,
        diagrama,
        participantes: formData.participantes,
        afectacion: formData.afectacion,
        actividades,
        estado: 'En revisión'
      };
    // Mostrar SweetAlert con opción de confirmar o cancelar
    const result = await Swal.fire({
      title: '¿Está seguro de querer guardar?',
      text: 'El diagrama será enviado ha revisión.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3ccc37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    // Si el usuario confirma (presiona el botón de confirmación)
    if (result.isConfirmed) {
      // Realizar la llamada a la API para guardar los datos
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`, data);
      console.log('Datos guardados:', response.data);
      // Llamar a verificarRegistro después de confirmar
      verificarRegistro();
    } else {
      // Mostrar un mensaje de cancelación si el usuario cancela
      Swal.fire('Cancelado', 'El diagrama no ha sido guardado.', 'info');
    }
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  };

  const Guardar = async () => {
    // Verificar si todos los campos requeridos están rellenados
    if (
      !formData.problema ||
      !formData.correccion ||
      !formData.causa ||
      !formData.participantes ||
      diagrama.some(dia => !dia.problema || !dia.text1 || !dia.text2 || !dia.text3 || !dia.text10 || !dia.text11) ||
      actividades.some(act => !act.actividad || !act.responsable || !act.fechaCompromiso)
    ) {
      console.log('Por favor, complete todos los campos requeridos antes de guardar.');
      return;
    }
    await handleSave();
  };


const handleSaveOrUpdate = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`, {
      params: {
          idRep: _id,
          idReq: id,
          proName: nombre
      }
    }); 

    if (response.data) {
      handleUpdateAdvance();
    } else {
      handleSaveAdvance();
    }
  } catch (error) {
    console.error('Error al verificar el registro:', error);
  }
};

  const handleActividadChange = (index, field, value) => {
    const nuevasActividades = [...actividades];
  
    if (field === 'fechaCompromiso') {
      // Reemplazar la fecha en lugar de agregarla de nuevo
      nuevasActividades[index][field] = [value];
    } else {
      nuevasActividades[index][field] = value;
    }
  
    setActividades(nuevasActividades);
  };
  
  const eliminarFilaActividad = (index) => {
    const nuevasActividades = actividades.filter((_, i) => i !== index);
    setActividades(nuevasActividades);
  };

  const agregarFilaActividad = () => {
    setActividades([...actividades, { actividad: '', responsable: '', fechaCompromiso: [] }]);
  };

  const ajustarFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString('es-ES');
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  // Definicion del tamaño de fuente según el rango de caracteres
  let fontSize;
  if (value.length > 125) {
    fontSize = '10.5px'; 
  } else if (value.length > 120) {
    fontSize = '11px';
  } else if (value.length > 110) {
    fontSize = '12px';
  } else if (value.length > 88) {
    fontSize = '13px';
  } else if (value.length > 65) {
    fontSize = '14px';
  } else {
    fontSize = '15px'; // Por defecto
  }

  // Actualiza el estado del diagrama
  setDiagrama(prevState => [{
    ...prevState[0],
    [name]: value
  }]);

  // Aplica el nuevo tamaño de fuente al textarea específico
  if (['text1', 'text2', 'text3', 'text4', 'text5', 'text6', 'text7', 'text8', 'text9', 
    'text10', 'text11', 'text12', 'text13', 'text14', 'text15'].includes(name)) {
    e.target.style.fontSize = fontSize;
  }
};


  const handleUpdateFechaCompromiso = async (index) => {
    try {
      const nuevaFecha = tempFechaCompromiso;
      const actividadActualizada = {
        ...actividades[index],
        fechaCompromiso: [nuevaFecha]
      };
  
      const updatedActividades = [...actividades];
      updatedActividades[index] = actividadActualizada;
  
      const updatedData = {
        actividades: updatedActividades
      };
  
      const { _id } = rechazo[0];
  
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/fecha/${_id}`, updatedData);
      console.log('Datos actualizados:', response.data);
      verificarRegistro();
      Swal.fire('Fecha actualizada', `La nueva fecha de compromiso es: ${nuevaFecha}`, 'success');
    } catch (error) {
      console.error('Error al actualizar la fecha de compromiso:', error);
      Swal.fire('Error', 'No se pudo actualizar la fecha de compromiso', 'error');
    }
  };

  const colores = ['black', 'blue', 'green', 'yellow','orange', 'red'];

  const handleSelectChange = (event, index) => {
    event.target.style.color = colores[index % colores.length];
};

// Función para verificar coincidencias
function verificarCoincidencia(textAreaValue, causa) {
  // Verificar que los valores no sean undefined o null
  if (typeof textAreaValue !== 'string' || typeof causa !== 'string') {
      return false;
  }

  const trimmedTextAreaValue = textAreaValue.trim();
  const trimmedCausaParts = causa.trim().split(';').map(part => part.trim());

  if (trimmedTextAreaValue === '') {
      return false;
  }

  return trimmedCausaParts.some(part => part === trimmedTextAreaValue);
}

// Función para obtener el estilo del textarea
const obtenerEstiloTextarea = (texto, causa) => {
  return verificarCoincidencia(texto, causa) 
      ? { backgroundColor: '#f1fc5e9f', borderRadius: '10px' } 
      : {};
};

const mostrarCargando = () => {
  MySwal.fire({
    title: 'Cargando...',
    text: 'Por favor, espere',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};



const ocultarCargando = () => {
  Swal.close();
};

useEffect(() => {
  const fetchData = async () => {
    try {
      mostrarCargando(); // Mostrar el pop-up de carga
      await verificarRegistro();
      ocultarCargando(); // Ocultar el pop-up de carga después de recibir los datos
    } catch (error) {
      console.error('Error fetching data:', error);
      ocultarCargando(); // Ocultar el pop-up de carga en caso de error
    }
  };

  fetchData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

 
  if (proceso) {
    return (
      <div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <Navigation />
        </div>
        <div className='mss-proceso'>
          <div style={{display:'flex', justifyContent:'center'}}>En proceso de revisión.</div>
          <div style={{display:'flex',fontSize:'70px', justifyContent:'center'}}>📝</div>
        </div>
      </div>
    );
  } else if (rechazo || aprobado) {
    return (  
      <div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <Navigation />
        </div>

        {aprobado && (
          <>
            <div className='cont-aprob'>
            <div className='rep-aprob' style={{display:'flex', justifyContent:'center'}}>¡El diagrama fue aprobado.!</div>
            <div style={{display:'flex',fontSize:'70px', justifyContent:'center'}}>🎉</div>
            </div>
          </>
        )}
        
        {(formData.notaRechazo && (!aprobado && !revisado)) &&(
          <div className='th-comentario'>
             <div style={{padding:'15px'}}>{nota}</div>
          </div>
         )}
        <form onSubmit={(e) => {
          e.preventDefault(); // Prevenir el envío automático del formulario
          if (isEditing || asignado) {
            Actualizar();
          } else {
            Guardar();
          }
        }}>
        <div className="image-container">
          <div className='button-cam'>
          {
          (aprobado || estRech || revisado) ? null : (         
          <button onClick={(e) => {
            e.preventDefault();
              handleSaveOrUpdate();
               }}>
              Guardar Cambios
            </button>
            )}  
          </div>

          <img src={Logo} alt="Logo Aguida" className='logo-empresa' />
          <h1 style={{position:'absolute', fontSize:'40px'}}>Ishikawa</h1>
          <div className='posicion-en'>
          {programa?.Descripcion && programa.Descripcion
            .filter(desc => desc.ID === id && programa.Nombre === nombre)
            .map((desc, index) => {
              return(
            <h2 key={index}>Problema:
              <textarea type="text" className="problema-input" name='problema' 
              value={(descripcion?.Observacion && datos?.PuntuacionMaxima) ? `${descripcion.Observacion}` : `${descripcion.Hallazgo}`}
              style={{fontSize:'20px'}} placeholder="Agregar problema. . ." required disabled={revisado}>
              </textarea>
            </h2>
            )})}
            <div style={{ display: 'flex', position:'absolute' }}>
              <h2>Afectación: </h2> 
              <h3 style={{marginTop:'1.65rem', marginLeft:'0.5rem'}}>{id} {programa?.Nombre}</h3>
            </div>
          </div>
          <div className='posicion-en-3'>
          GCF015
          </div>
          <div className='posicion-en-2'>
            <h3>Fecha: {fechaElaboracion}</h3>
          </div>
          <div >
            <img src={ishikawa} alt="Diagrama de Ishikawa" className="responsive-image" />
            {diagrama.map((dia, index) => (
            <div key={index}>
           <textarea maxLength={145} className="text-area" name="text1" value={dia.text1} onChange={handleInputChange} 
           style={{ top: '19.1rem', left: '8.7rem', ...obtenerEstiloTextarea(dia.text1, formData.causa)}} placeholder="Texto..." required disabled={revisado} onDoubleClick={handleDoubleClick}
            />
            <textarea maxLength={145} className="text-area" name='text2' value={dia.text2} onChange={handleInputChange}
            style={{ top: '19.1rem', left: '25.4rem', ...obtenerEstiloTextarea(dia.text2, formData.causa)}} placeholder="Texto..." required disabled={revisado} onDoubleClick={handleDoubleClick}
            />
            <textarea className="text-area" name='text3' value={dia.text3} onChange={handleInputChange}
             style={{ top: '19.1rem', left: '41.2rem', ...obtenerEstiloTextarea(dia.text3, formData.causa) }}placeholder="Texto..." required disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>

            <textarea className="text-area" name='text4' value={dia.text4} onChange={handleInputChange}
             style={{ top: '23.2rem', left: '12.2rem', ...obtenerEstiloTextarea(dia.text4, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text5' value={dia.text5} onChange={handleInputChange}
             style={{ top: '23.2rem', left: '28.8rem', ...obtenerEstiloTextarea(dia.text5, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text6' value={dia.text6} onChange={handleInputChange}
             style={{ top: '23.2rem', left: '45rem', ...obtenerEstiloTextarea(dia.text6, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
    
            <textarea className="text-area" name='text7' value={dia.text7} onChange={handleInputChange}
             style={{ top: '27.2rem', left: '15.5rem', ...obtenerEstiloTextarea(dia.text7, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text8' value={dia.text8} onChange={handleInputChange}
             style={{ top: '27.2rem', left: '32.3rem', ...obtenerEstiloTextarea(dia.text8, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text9' value={dia.text9} onChange={handleInputChange}
             style={{ top: '27.2rem', left: '48.1rem', ...obtenerEstiloTextarea(dia.text9, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
  
            <textarea className="text-area" name='text10' value={dia.text10} onChange={handleInputChange}
             style={{ top: '31rem', left: '23rem', ...obtenerEstiloTextarea(dia.text10, formData.causa) }}placeholder="Texto..." required disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text11' value={dia.text11} onChange={handleInputChange}
             style={{ top: '31rem', left: '39.4rem', ...obtenerEstiloTextarea(dia.text11, formData.causa) }}placeholder="Texto..." required disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
  
            <textarea className="text-area" name='text12' value={dia.text12} onChange={handleInputChange}
             style={{ top: '35rem', left: '19.7rem', ...obtenerEstiloTextarea(dia.text12, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text13' value={dia.text13} onChange={handleInputChange}
             style={{ top: '35rem', left: '36rem', ...obtenerEstiloTextarea(dia.text13, formData.causa)}}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
  
            <textarea className="text-area" name='text14' value={dia.text14} onChange={handleInputChange}
             style={{ top: '39rem', left: '16.6rem', ...obtenerEstiloTextarea(dia.text14, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            <textarea className="text-area" name='text15' value={dia.text15} onChange={handleInputChange}
             style={{ top: '39rem', left: '32.8rem', ...obtenerEstiloTextarea(dia.text15, formData.causa) }}placeholder="Texto..." disabled={revisado} onClick={handleDiagrama}
             onDoubleClick={handleDoubleClick} maxLength={145}></textarea>
            </div>
          ))}

          {programa?.Descripcion && programa.Descripcion
            .filter(desc => desc.ID === id && programa.Nombre === nombre)
            .map((desc, index) => {
              return(
          <textarea key={index} maxlength="105" className="text-area" name='problema' value={(descripcion?.Observacion && datos?.PuntuacionMaxima) ? `${descripcion.Observacion}` : desc.Problema} onChange={handleInputChange} onClick={handleDiagrama}
             style={{ top: '27rem', left: '67.5rem',width:'8.5rem', height:'8rem' }}placeholder="Problema..." required disabled={revisado}></textarea>
            )})}
          </div>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
  
          {programa?.Descripcion && programa.Descripcion
            .filter(desc => desc.ID === id && programa.Nombre === nombre)
            .map((desc, index) => {
  
              return (
                <div key={index}>
                  <div className='cont-part'>
                  <button className='button-part' onClick={(e) => {
                      e.preventDefault();
                      setShowPart(!showPart)
                    }}>
                    <span class="material-symbols-outlined" style={{color:'#ffffff', fontSize:'33px'}}>
                      attribution
                      </span>
                  </button>
                  {showPart && (
                  <textarea type="text" name='participantes' value={formData.participantes} onChange={handleDatos}
                      style={{ width:'64rem', color:'#000000', border:'none', backgroundColor:'#ffffff'}} placeholder="Agregar Participantes. . ." required disabled={revisado}></textarea>
                    )}
                  </div>
                  <div className='posicion-bo'>
                    <h3>No conformidad:</h3>
                       <div style={{width:'70em', textAlign:'justify'}}>{desc.Requisito}</div>
                    <h3>Hallazgo:</h3>
                    <div className='hallazgo-container'> {/*aqui va la observacion*/}
                      <div style={{width:'70em', textAlign:'justify'}}>{datos.PuntuacionMaxima ? desc.Hallazgo : desc.Observacion}</div>
                    </div>
                    <h3>Acción inmediata o corrección: </h3>
                    <textarea type="text" className="textarea-acc" name='correccion' value={formData.correccion} onChange={handleDatos}
                      style={{ width:'64rem', color:'#000000'}} placeholder="Agregar Acción. . ." required disabled={revisado} ></textarea>
                    <h3>Causa del problema (Ishikawa, TGN, W-W, DCR):</h3>
                    <textarea type="text" className="textarea-acc" name='causa' value={formData.causa} onChange={handleDatos}
                      style={{ width:'64rem', marginBottom:'20px', color:'#000000'}} placeholder="Agregar Causa. . ." required disabled={revisado}></textarea>
                  </div>
    
                </div>
              );
            })}
          <div className='table-ish'>
            <h3>SOLUCIÓN</h3>
            <table style={{border:'none'}}>
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
                          value={actividad.actividad}
                          onChange={(e) => handleActividadChange(index, 'actividad', e.target.value)}
                          placeholder='Agregar Actividad. . .'
                          required
                          disabled={revisado}
                        />
                      </td>
                      <td>
                        <textarea
                          className='table-input'
                          type="text"
                          value={actividad.responsable}
                          onChange={(e) => handleActividadChange(index, 'responsable', e.target.value)}
                          placeholder='Agregar Responsable. . .'
                          required
                          disabled={revisado}
                        />
                      </td>
                      <td>
                      {
                      (revisado) ? null : (
                      <div>
                       <select
                          className="custom-select"
                          onChange={(e) => handleSelectChange(e, actividad.fechaCompromiso.length - 1 - actividad.fechaCompromiso.slice().reverse().findIndex(fecha => fecha === e.target.value))}
                          style={{ color: colores[actividad.fechaCompromiso.length - 1]} } // Inicializa con el color del primer elemento invertido
                        >
                                    {actividad.fechaCompromiso.slice().reverse().map((fecha, index) => (
                                        <option
                                            key={index}
                                            className={`option-${index}`}
                                            style={{ color: colores[(actividad.fechaCompromiso.length - 1 - index) % colores.length] }}
                                        >
                                            {fecha}
                                        </option>
                                    ))}
                                </select>
                          {aprobado ? (
                              <>
                                  <input
                                      type="date"
                                      onChange={(e) => handleTempFechaChange(e.target.value)}
                                      required
                                  />
                                  <button onClick={(e) => { e.preventDefault();handleUpdateFechaCompromiso(index)
                                   }} className='button-new-date'>
                                      Reprogramar Fecha
                                  </button>
                              </>
                          ) : (
                              <input
                                  type="date"
                                  onChange={(e) => handleActividadChange(index, 'fechaCompromiso', e.target.value)}
                                  required
                              />
                          )}
                      </div>
                      )}

                      {
                      (!revisado) ? null : (
                        <div >
                           {ajustarFecha(actividad.fechaCompromiso.slice(-1)[0])}
                        </div>
                        )}
                      </td>
                      {(revisado || aprobado) ? null : ( 
                      <td className='cancel-acc'>
                        {index !== 0 && (
                          <button onClick={() => eliminarFilaActividad(index)}>Eliminar</button>
                        )}
                      </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {
              (revisado || aprobado) ? null : ( 
              <button  onClick={(e) => {
                e.preventDefault();
                agregarFilaActividad();
              }} className='button-agregar'>Agregar Fila</button>
            )}
            </div>
            {
              (proceso || aprobado || revisado) ? null : (
                <button type="submit" className='button-guar-ish'>
                  Enviar
                </button>
              )
            }
          </div>
          </form>
        </div>
    );
  } else {
    return <div>Error al cargar los datos</div>;
  };
  
  };

export default Ishikawa;
