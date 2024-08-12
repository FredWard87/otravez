import React, { useEffect, useState, useContext } from 'react';
import './css/IshikawaRev.css';
import Navigation from "../Navigation/Navbar";
import Logo from "../../assets/img/logoAguida.png";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IshikawaImg from '../../assets/img/Ishikawa-transformed.png';
import { UserContext } from '../../App';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const IshikawaRev = () => {
    const { userData } = useContext(UserContext);
    const [ishikawas, setIshikawas] = useState([]);
    const [programa, setPrograma] = useState(null);
    const [filteredIshikawas, setFilteredIshikawas] = useState([]);
    const { _id, id, nombre} = useParams();
    const [valorSeleccionado, setValorSeleccionado] = useState('');
    const [datos, setDatos] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [notaRechazo, setNotaRechazo] = useState('');
    const [rechazo,  setRechazo] = useState([]);
    const [revisado, setRevisado] = useState([]);
    const [aprobado,  setAprobado] = useState([]);
    const [,setAuditados] = useState([]);
    const [showPart, setShowPart] = useState(true);
    const [showReprogramar, setShowReprogramar] = useState(false);
    const [showNotaRechazo, setShowNotaRechazo] = useState(false);
    const [tempFechaCompromiso, setTempFechaCompromiso] = useState('');
    const [actividades, setActividades] = useState([{ actividad: '', responsable: '', fechaCompromiso: [] }]);
    const [correcciones, setCorrecciones] = useState([{ actividad: '', responsable: '', fechaCompromiso: [], cerrada: '' }]);
    const [nuevaCorreccion, setNuevaCorreccion] = useState({actividad: '', responsable: '', fechaCompromiso: '', cerrada: '' });

    useEffect(() => {
        const obtenerDatos = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
            if (userData && userData.Correo) {
              const datosFiltrados = response.data.find(dato => dato._id === _id);
              if (datosFiltrados) {
                const programaEncontrado = datosFiltrados.Programa.find(prog => 
                  prog.Descripcion.some(desc => desc.ID === id)
                );
                  setDatos(datosFiltrados);
                  setPrograma(programaEncontrado);
            }
          }
          } catch (error) {
            console.error('Error al obtener los datos:', error);
          }
        };
      
        obtenerDatos();
      }, [userData, _id, id]); 
      
      useEffect(() => {
        if (datos && datos.Auditados) {
          const Auditados = new Date(datos.Auditados).toLocaleDateString();
          setAuditados(Auditados);
        }
      }, [datos]);   
    
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`);
            const dataFiltrada = response.data.filter(item => item.estado === 'En revisión' ||  item.estado === 'Revisado' || item.estado === 'Aprobado');
            setIshikawas(dataFiltrada);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

      useEffect(() => {
        if (filteredIshikawas.length > 0) {
            const correccionesIniciales = filteredIshikawas[0].correcciones.map(correccion => ({
                ...correccion,
                fechaCompromiso: new Date(correccion.fechaCompromiso).toISOString().split('T')[0]  // Formato YYYY-MM-DD
            }));
            if (correccionesIniciales.length === 0) {
                correccionesIniciales.push({ actividad: '', responsable: '', fechaCompromiso: '', cerrada: '' });
            }
            setCorrecciones(correccionesIniciales);
        }
    }, [filteredIshikawas]);    
    
    useEffect(() => {
        if (ishikawas.length > 0) {
            const nuevosFiltrados = ishikawas.filter(({ idRep, idReq, proName }) => idRep === _id && idReq === id && proName === nombre);
            setFilteredIshikawas(nuevosFiltrados);
            if (nuevosFiltrados.length === 0) {
                setMensaje('No hay nada por aquí.');
            } else {
                setMensaje('');
            }
        }
    }, [ishikawas, _id, id, nombre]); 

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
    
      }, [ishikawas]);   

      const handlePrintPDF = () => {
        const showLoading = () => {
          document.getElementById('loading-overlay').style.display = 'flex';
        };
      
        const hideLoading = () => {
          document.getElementById('loading-overlay').style.display = 'none';
        };
      
        // Mostrar el mensaje de carga
        showLoading();
      
        // Obtener los elementos individuales que se desean imprimir en páginas separadas
        const part1 = document.getElementById('pdf-content-part1');
        const part2 = document.getElementById('pdf-content-part2');
      
        const convertTextAreasToDivs = (element) => {
          const textareas = element.querySelectorAll('textarea');
      
          textareas.forEach((textarea) => {
            // Crear un nuevo elemento div
            const div = document.createElement('div');
            div.textContent = textarea.value;
      
            // Copiar clases
            div.className = textarea.className;
      
            // Copiar estilos en línea
            div.style.cssText = textarea.style.cssText;
      
            // Reemplazar el textarea con el div
            textarea.parentNode.replaceChild(div, textarea);
          });
        };
      
        // Función para convertir un elemento en una imagen y añadirla al PDF
        const addPartToPDF = (element, pdf, isLastPage) => {
          convertTextAreasToDivs(element); // Convertir textareas a divs antes de capturar
      
          return html2canvas(element, {
            scale: 2.5, // Ajusta la escala para mejorar la resolución
            useCORS: true, // Permitir CORS si se necesitan recursos externos
          }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 0.8); // Usar JPEG con calidad del 80%
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
            const marginX = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
            const marginY = (pdf.internal.pageSize.getHeight() - imgHeight) / 6;
      
            pdf.addImage(imgData, 'JPEG', marginX, marginY, imgWidth, imgHeight, undefined, 'FAST'); // Usa compresión rápida
      
            if (!isLastPage) {
              pdf.addPage(); // Añadir nueva página si no es la última parte
            }
          });
        };
      
        // Crear un nuevo documento PDF
        const pdf = new jsPDF('landscape', 'cm', 'letter');
      
        // Añadir las partes al PDF
        addPartToPDF(part1, pdf, false) // Añadir primera parte
          .then(() => addPartToPDF(part2, pdf, true)) // Añadir segunda parte y guardar
          .then(() => {
            pdf.save("diagrama_ishikawa.pdf");
            hideLoading(); // Ocultar el mensaje de carga después de guardar
          })
          .catch((error) => {
            console.error('Error generating PDF:', error);
            hideLoading(); // Asegurar que el mensaje de carga se oculta incluso si hay un error
          });
      };

    const handleCorreccionChange = (index, field, value) => {
        const nuevasCorrecciones = [...correcciones];
        
        if (field === 'cerrada') {
            nuevasCorrecciones[index][field] = value ? 'Sí' : 'No';
        } else if (field === 'cerradaNo') {
            nuevasCorrecciones[index]['cerrada'] = value ? 'No' : 'Sí';
        } else if (field === 'fechaCompromiso') {
            nuevasCorrecciones[index][field] = new Date(value).toISOString().split('T')[0]; 
        } else {
            nuevasCorrecciones[index][field] = value;
        }
    
        setCorrecciones(nuevasCorrecciones);
    };   
    
    const handleAgregarFila = () => {
        setCorrecciones([...correcciones, nuevaCorreccion]);
        setNuevaCorreccion({ actividad: '', responsable: '', fechaCompromiso: '', cerrada: '' });
    };
            
    const handleGuardarCambios = async () => {
        try {
            if (filteredIshikawas.length === 0) {
                alert('No hay datos para actualizar');
                return;
            }
    
            const { _id } = filteredIshikawas[0];
            const updatedIshikawa = {
                correcciones
            };
    
            console.log('Enviando datos a actualizar:', updatedIshikawa);
    
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/${_id}`, {
                estado: 'Revisado',
                ...updatedIshikawa
            });
    
            console.log('Respuesta del servidor:', response.data);
    
            alert('Información actualizada correctamente');
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Hubo un error al actualizar la información');
        }
    };    

    const Finalizar = async (event) => {
        event.preventDefault();
        Swal.fire({
          title: '¿Está seguro de querer finalizar este diagrama?',
          text: '¡Esta acción no se puede revertir!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3ccc37',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, finalizar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            handleGuardarCambios();
          }
        });
      };

      const handleGuardarAprobacion = async () => {
        try {
            const { _id } = filteredIshikawas[0];
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/${_id}`, {
                estado: 'Aprobado'
            });
            fetchData();
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Hubo un error al actualizar la información');
        }
        };

        const Aprobar = async (id, porcentaje) => {
            Swal.fire({
              title: '¿Está seguro de querer aprobar este diagrama?',
              text: '¡Esta acción no se puede revertir!',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3ccc37',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, Aprobar',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                handleGuardarAprobacion();
              }
            });
          };

    const handleGuardarRechazo = async () => {
    try {
        const { _id } = filteredIshikawas[0];
        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/${_id}`, {
            estado: 'Rechazado',
            notaRechazo 
        });
        fetchData();
    } catch (error) {
        console.error('Error updating data:', error);
        alert('Hubo un error al actualizar la información');
    }
    };

    const Rechazar = async (id, porcentaje) => {
        Swal.fire({
          title: '¿Está seguro de querer rechazar este diagrama?',
          text: '¡El diagrama será devuelto!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3ccc37',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, rechazar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            handleGuardarRechazo ();
          }
        });
      };
      
    const handleEliminarFila = (index) => {
        const nuevasCorrecciones = [...correcciones];
        nuevasCorrecciones.splice(index, 1);
        setCorrecciones(nuevasCorrecciones);
        console.log('Correcciones después de eliminar:', nuevasCorrecciones);
    };

    useEffect(() => {
        verificarRegistro();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [_id, id]);
      
    const verificarRegistro = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`);
          const dataFiltrada = response.data.filter(item => item.idRep === _id && item.idReq === id && 
            (item.estado === 'Rechazado' || item.estado === 'Revisado' || item.estado === 'Aprobado'|| item.estado === 'Asignado'));
          const registroAprobado = response.data.some(item => item.idRep === _id && item.idReq === id && item.estado === 'Aprobado');
          const registroRevisado= response.data.some(item => item.idRep === _id && item.idReq === id && item.estado === 'Revisado');
          setAprobado(registroAprobado);
          setRechazo(dataFiltrada);
          setRevisado(registroRevisado);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

    const handleTempFechaChange = (value) => {
        setTempFechaCompromiso(value);
    };

    const handleActividadChange = (index, field, value) => {
        const nuevasActividades = [...actividades];
    
        if (field === 'fechaCompromiso') {
            nuevasActividades[index][field] = [...nuevasActividades[index][field], value];
        } else {
            nuevasActividades[index][field] = value;
        }
    
        setActividades(nuevasActividades);
    };

    const handleSave = async () => {
        try {
            const data = {
                idRep: _id,
                idReq: id,
                proName: nombre,
                fecha: '',
                auditado: valorSeleccionado,
                problema: '',
                requisito:'',
                hallazgo:'',
                correccion: '',
                causa: '',
                diagrama: [],
                participantes: '',
                afectacion: '',
                actividades: [],
                estado: 'Asignado'
            };
    
            if (rechazo.length > 0) {
                // Actualizar registro existente
                const { _id: registroId } = rechazo[0];
                await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/${registroId}`, data);
                Swal.fire('Reasignado', 'El diagrama ha sido reasignado.', 'success');
                verificarRegistro();
            } else {
                // Crear nuevo registro
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`, data);
                Swal.fire('Asignado', 'La asignación se realizó exitosamente.', 'success');
                verificarRegistro();
            }
    
            fetchData(); // Para refrescar la lista de registros
        } catch (error) {
            console.error('Error al guardar los datos:', error);
            Swal.fire('Error', 'Hubo un problema al guardar los datos.', 'error');
        }
    };  
    
    const Asignar = async () => {
        Swal.fire({
          title: '¿Está seguro de querer asignar este diagrama?',
          text: '¡Se le notificará al auditado!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3ccc37',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, asignar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            handleSave();
          }
        });
      };

    const handleUpdateFechaCompromiso = async (index) => {
        try {
            const nuevaFecha = tempFechaCompromiso;
            const actividadActualizada = {
                ...actividades[index],
                fechaCompromiso: [...actividades[index].fechaCompromiso, nuevaFecha] // Asegúrate de agregar la nueva fecha al array existente
            };
    
            const updatedActividades = [...actividades];
            updatedActividades[index] = actividadActualizada;
    
            const updatedData = {
                actividades: updatedActividades
            };
    
            const { _id } = rechazo[0];
    
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/ishikawa/fecha/${_id}`, updatedData);
            console.log('Datos actualizados:', response.data);
            fetchData();
            Swal.fire('Fecha actualizada', `La nueva fecha de compromiso es: ${nuevaFecha}`, 'success');
        } catch (error) {
            console.error('Error al actualizar la fecha de compromiso:', error);
            Swal.fire('Error', 'No se pudo actualizar la fecha de compromiso', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { value } = e.target;
      
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

        e.target.style.fontSize = fontSize;
      };
    
    const colores = ['black', 'blue', 'green', 'yellow','orange', 'red'];

    const handleSelectChange = (event, index) => {
        event.target.style.color = colores[index % colores.length];
    };

    const handleSelectChangeAud = (event) => {
        setValorSeleccionado(event.target.value);
      };

      return (
        <div>
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
            </div>
            <div>
            
            {(ishikawas.length === 0 || mensaje) && <div className="mensaje-error">
                <div className='select-ish'>
                {rechazo.map((ishikawa, asig) => (
                    <div key={asig}>
                         <div className='asignado-ishi'>Asignado: {ishikawa.auditado}</div>
                    </div>
                ))}
                <select onChange={handleSelectChangeAud} value={valorSeleccionado}>
                <option value="">Seleccione...</option>
                    {datos?.Auditados?.length > 0 ? (
                    datos.Auditados.map((auditado, index) => (
                        <option key={index} value={auditado}>
                        {auditado}
                        </option>
                    ))
                    ) : (
                    <option>Consultando. . .</option>
                    )}
                </select>
                <button onClick={Asignar}>Asignar</button>
            </div>
                <div className='mens-error'>
                <div style={{display:'flex', justifyContent:'center'}}>{mensaje}</div> 
                <div style={{display:'flex',fontSize:'100px', justifyContent:'center'}}>🏝️</div></div>
                </div>}
                {filteredIshikawas.map((ishikawa, index) => (
                <div key={index}>
                    {ishikawa.estado === 'En revisión' && (
                        <>
                            {showNotaRechazo && (
                                <div className="nota-rechazo-container">
                                    <textarea
                                        value={notaRechazo}
                                        onChange={(e) => setNotaRechazo(e.target.value)}
                                        className='textarea-ishi'
                                        rows="4"
                                        cols="50"
                                        placeholder="Escribe aquí la razón del rechazo"
                                    />
                                </div>
                            )}
                            <div className='buttons-g'>
                                <button onClick={() => setShowNotaRechazo(!showNotaRechazo)}>
                                    {showNotaRechazo ? 'Ocultar Nota' : 'Nota'}
                                </button>
                                <button onClick={Rechazar} className='boton-rechazar' >Rechazar</button>
                                <button onClick={Aprobar} >Aprobar</button>
                            </div>
                        </>
                    )}
                    <button className='button-pdf-imp' onClick={handlePrintPDF}>Guardar en PDF</button>
                    <div id='pdf-content-part1' className="image-container">
                    <img src={Logo} alt="Logo Aguida" className='logo-empresa-ish' />
                    <h1 style={{position:'absolute', fontSize:'40px'}}>Ishikawa</h1>
                    <div className='posicion-en'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2 style={{ marginLeft: '45rem', marginRight: '10px' }}>Problema: </h2>
                        <div style={{ width: '700px', fontSize: '20px' }}>{ishikawa.problema}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2 style={{ marginLeft: '45rem', marginRight: '10px' }}>Afectación: </h2>
                        <h3>{id} {programa?.Nombre}</h3>
                    </div>
                    </div>
                    <div className='posicion-en-3'>
                    GCF015
                    </div>
                    <div className='posicion-en-2'>
                    <h3>Fecha: {ishikawa.fecha}</h3>
                    </div>
                    <div>
                    <img src={IshikawaImg} alt="Diagrama de Ishikawa" className="responsive-image" />
                    {ishikawa.diagrama.map((item, i) => (
                        <div key={i}>
                        <textarea className="text-area" 
                            style={{ top: '19.1rem', left: '8.7rem' }} disabled>{item.text1}</textarea>
                        <textarea className="text-area"
                            style={{ top: '19.1rem', left: '25.4rem' }} disabled>{item.text2}</textarea>
                        <textarea className="text-area"
                            style={{ top: '19.1rem', left: '41.2rem' }} disabled>{item.text3}</textarea>
                        <textarea className="text-area"
                            style={{ top: '23.2rem', left: '12.2rem' }} disabled>{item.text4}</textarea>
                        <textarea className="text-area"
                            style={{ top: '23.2rem', left: '28.8rem' }} disabled>{item.text5}</textarea>
                        <textarea className="text-area"
                            style={{ top: '23.2rem', left: '45rem' }} disabled>{item.text6}</textarea>
                        <textarea className="text-area"
                            style={{ top: '27.2rem', left: '15.5rem' }} disabled>{item.text7}</textarea>
                        <textarea className="text-area"
                            style={{ top: '27.2rem', left: '32.3rem' }} disabled>{item.text8}</textarea>
                        <textarea className="text-area"
                            style={{ top: '27.2rem', left: '48.1rem' }} disabled>{item.text9}</textarea>
                        <textarea className="text-area" value={item.text10}
                            style={{ top: '31rem', left: '23rem' }} disabled></textarea>
                        <textarea className="text-area" name='text11' value={item.text11}
                            style={{ top: '31rem', left: '39.4rem' }} disabled></textarea>
                        <textarea className="text-area" value={item.text12}
                            style={{ top: '35rem', left: '19.7rem' }} disabled></textarea>
                        <textarea className="text-area" name='text13' value={item.text13}
                            style={{ top: '35rem', left: '36rem' }} disabled></textarea>
                        <textarea className="text-area" name='text14' value={item.text14}
                            style={{ top: '39rem', left: '16.6rem' }} disabled></textarea>
                        <textarea className="text-area" name='text15' value={item.text15}
                            style={{ top: '39rem', left: '32.8rem' }} disabled></textarea>
                        <textarea className="text-area"
                            style={{ top: '27rem', left: '67.5rem', width: '8.5rem', height: '8rem' }} value={ishikawa.problema? ishikawa.problema : item.problema}></textarea>
                        </div>
                    ))}
                    </div>
                   
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
                
                    <div className='button-pasti'>
                    <div className='cont-part'>
                  <button className='button-part' onClick={(e) => {
                      e.preventDefault();
                      setShowPart(!showPart)
                    }}>
                    ⚇
                  </button>
                  {showPart && (
                  <div className='part-div'>{ishikawa.participantes}</div>
                    )}
                  </div>
                  </div>
                  </div>
                  <div id='pdf-content-part2' className="image-container2">
                  <div className='posicion-bo'>
                    <h3>No conformidad:</h3>
                    <div style={{ width: '55em', textAlign: 'justify' }}>{ishikawa.requisito}</div>
                    <h3>Hallazgo:</h3>
                    <div className='hallazgo-container'>
                        <div>{ishikawa.hallazgo}</div>
                    </div>
                    <h3>Acción inmediata o corrección: </h3>
                    {ishikawa.correccion}
                    <h3>Causa del problema (Ishikawa, TGN, W-W, DCR):</h3>
                    <div style={{ marginBottom: '20px', width:'72em' }}>{ishikawa.causa}</div>
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
                        {ishikawa.actividades.map((actividad, i) => (
                            <tr key={i}>
                            <td style={{fontSize:'12px',width: '34em', height: 'auto', textAlign:'justify'}}>
                            {actividad.actividad}
                            </td>
                            <td style={{fontSize:'12px',width: '34em', height: 'auto', textAlign:'justify'}}>
                            {actividad.responsable}
                            </td>
                            <td >
                                <div className='td-fechas'>
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
                                </div>

                                <div className='button-cancel'>
                          {aprobado && showReprogramar ? (
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
                              <></>
                          )}
                          {
                        (!aprobado) ? null : (
                          <button className='button-repro' onClick={() => setShowReprogramar(!showReprogramar)}>
                                {showReprogramar ? 'Cancelar' : 'Reprogramar'}
                          </button>
                          )}
                        </div>
                                
                      </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <form onSubmit={Finalizar}>
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
                                        value={correccion.actividad}
                                        onChange={(e) => handleCorreccionChange(index, 'actividad', e.target.value)}
                                        className="no-border" required
                                    />
                                </td>
                                <td>
                                    <textarea
                                        type="text"
                                        value={correccion.responsable}
                                        onChange={(e) => handleCorreccionChange(index, 'responsable', e.target.value)}
                                        className="no-border" required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        value={correccion.fechaCompromiso}
                                        onChange={(e) => handleCorreccionChange(index, 'fechaCompromiso', e.target.value)}
                                        className="no-border" required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={correccion.cerrada === 'Sí'}
                                        onChange={(e) => handleCorreccionChange(index, 'cerrada', e.target.checked)}
                                        className="no-border"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={correccion.cerrada === 'No'}
                                        onChange={(e) => handleCorreccionChange(index, 'cerradaNo', e.target.checked)}
                                        className="no-border"
                                    />
                                </td>
                                <td className='cancel-acc'>
                                    {index > 0 && (
                                        <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleEliminarFila(index);}}>Eliminar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                    {
                    (revisado) ? null : (
                    <div>
                        <button onClick={(e) => {
                         e.preventDefault();
                         handleAgregarFila();}} className='button-agregar'>Agregar Fila</button>
                    </div>
                    )}
                    <div className='button-final'>
                    {
                    (!aprobado) ? null : (
                    <button type='submit' >Finalizar</button>
                    )}
                    </div>
                    </form>
                    </div>
                </div>
                </div>
                ))}
            </div>
            </div>
    );
};

export default IshikawaRev;