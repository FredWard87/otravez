import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../App';
import logo from "../../assets/img/logoAguida.png";
import './css/Revicion.css'; 
import Navigation from '../Navigation/Navbar';
import Swal from 'sweetalert2';

const Reporte = () => {
    const { userData } = useContext(UserContext);
    const [datos, setDatos] = useState([]);
    const [hiddenDurations, setHiddenDurations] = useState([]);
    const [, setCriteriosConteo] = useState({});
    const [, setTotalCriterios] = useState(0);
    const [notas, setNotas] = useState({});
    const [visibleTextAreas, setVisibleTextAreas] = useState({});
    const [hiddenRows, setHiddenRows] = useState({}); 
    const [conteoCriteriosOcultos, setConteoCriteriosOcultos] = useState({});


    console.log('Aquiiiiiiiii',conteoCriteriosOcultos);

    useEffect(() => {
        obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[userData]);

    useEffect(() => {
        const notasIniciales = {};
        datos.forEach(dato => {
            notasIniciales[dato._id] = dato.Comentario || '';
        });
        setNotas(notasIniciales);
    }, [datos]);    
    
    const obtenerDatos = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
            if (userData && userData.Correo) {
                const datosFiltrados = response.data.filter((dato) => 
                    dato.Estado === "Realizada"
                );
    
                // Ordenar por FechaElaboracion del más reciente al más antiguo
                datosFiltrados.sort((a, b) => {
                    const fechaElaboracionA = new Date(a.FechaElaboracion);
                    const fechaElaboracionB = new Date(b.FechaElaboracion);
                    return fechaElaboracionB - fechaElaboracionA;
                });
    
                let conteo = {};
                let total = 0;
                datosFiltrados.forEach(dato => {
                    dato.Programa.forEach(programa => {
                        programa.Descripcion.forEach(desc => {
                            if (desc.Criterio && desc.Criterio !== 'NA') {
                                if (!conteo[desc.Criterio]) {
                                    conteo[desc.Criterio] = 0;
                                }
                                conteo[desc.Criterio]++;
                                total++;
                            }
                        });
                    });
                });
    
                setDatos(datosFiltrados);
                setCriteriosConteo(conteo);
                setTotalCriterios(total);
    
                // Ocultar todas las duraciones excepto la más reciente por defecto
                const duracionesOcultas = datosFiltrados.slice(1).map(dato => dato.Duracion);
                setHiddenDurations(duracionesOcultas);
            } else {
                console.log('userData o userData.Correo no definidos:', userData);
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }; 

    const toggleDuration = (duration) => {
        setHiddenDurations(hiddenDurations.includes(duration) ?
            hiddenDurations.filter((dur) => dur !== duration) :
            [...hiddenDurations, duration]
        );
    };

    const toggleRowVisibility = (periodIdx, rowId, criterios) => {
        setHiddenRows((prevHiddenRows) => {
            const isHidden = !prevHiddenRows[rowId];
            const newHiddenRows = {
                ...prevHiddenRows,
                [rowId]: isHidden
            };
    
            const criteriosOcultos = Object.keys(newHiddenRows)
                .filter(id => newHiddenRows[id])
                .map(id => criterios[id])
                .flat()
                .filter(Boolean);
    
            actualizarConteoCriteriosOcultos(periodIdx, criteriosOcultos);
            return newHiddenRows;
        });
    };
    
    const actualizarConteoCriteriosOcultos = (periodIdx, criterios) => {
        let conteo = { m: 0, M: 0, C: 0 };
        for (const criterio of criterios) {
            if (criterio === 'm' || criterio === 'M' || criterio === 'C') {
                conteo[criterio]++;
            }
        }
        setConteoCriteriosOcultos((prevConteo) => ({
            ...prevConteo,
            [periodIdx]: conteo
        }));
    };
    
    
    const handleToggleRowVisibility = (periodIdx, programIdx, descIdx) => {
        const criterios = datos.reduce((acc, dato, pIdx) => {
            dato.Programa.forEach((programa, prgIdx) => {
                programa.Descripcion.forEach((desc, dscIdx) => {
                    const rowId = `${pIdx}-${prgIdx}-${dscIdx}`;
                    acc[rowId] = desc.Criterio;
                });
            });
            return acc;
        }, {});
        toggleRowVisibility(periodIdx, `${periodIdx}-${programIdx}-${descIdx}`, criterios);
    };    
    
    const contarCriteriosPorTipo = (criterios, tipo) => {
        return Object.keys(criterios).filter(criterio => criterio === tipo).reduce((acc, criterio) => {
            acc[criterio] = criterios[criterio];
            return acc;
        }, {});
    };

    const checkboxValues = {
        'Conforme': 1,
        'm': 0.7,
        'M': 0.3,
        'C': 0
    };

    const calcularPuntosTotales = (conteo) => {
        let puntosTotales = 0;
        for (const [criterio, valor] of Object.entries(conteo)) {
            if (checkboxValues[criterio] !== undefined) {
                puntosTotales += valor * checkboxValues[criterio];
            }
        }
        return puntosTotales.toFixed(2);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const actualizarEstadoADevuelto = async (id, AuditorLiderEmail) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/datos/estado/${id}`, {
                Estado: 'Devuelto',
                Comentario: notas[id] || '' ,
                AuditorLiderEmail
            });
            obtenerDatos();
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };

    const actualizarEstadoTerminada = async (id, puntuacionObtenida, confExternas, estatus, porcentajeTotal, AuditorLiderEmail) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/datos/estado/${id}`, {
                Estado: 'Terminada',
                PuntuacionObten: puntuacionObtenida,
                PuntuacionConf: confExternas,
                Estatus: estatus,
                PorcentajeTotal: porcentajeTotal,
                AuditorLiderEmail
            });
            obtenerDatos();
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };
    
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    const toggleTextAreaVisibility = debounce((id) => {
        setVisibleTextAreas(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    }, 100); 
    
     const notaCorreccion = (e, id) => {
        const newNotas = { ...notas, [id]: e.target.value };
        setNotas(newNotas);
    };
       
    const Rechazar = async (id, AuditorLiderEmail) => {
        Swal.fire({
          title: '¿Estás seguro de querer rechazar este reporte?',
          text: '¡El reporte será devuelto!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3ccc37',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, rechazar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            actualizarEstadoADevuelto(id, AuditorLiderEmail);
          }
        });
      };

      const Aprobar = async (id, puntuacionObtenida, confExternas, estatus, porcentajeTotal, AuditorLiderEmail) => {
        Swal.fire({
          title: '¿Estás seguro de querer aprobar este reporte?',
          text: '¡Será enviado al auditado!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3ccc37',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, aprobar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            actualizarEstadoTerminada(id, puntuacionObtenida,confExternas, estatus, porcentajeTotal, AuditorLiderEmail);
          }
        });
      };  

    return (
        <div className='espacio-repo'>
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
            </div>
            
            <div className="datos-container-repo">

            <h1 style={{fontSize:'3rem', display:'flex' ,justifyContent:'center', marginTop:'0'}}>Revisión de Reporte</h1>
       
                <div className="form-group-datos">
                {datos.map((dato, periodIdx) => {
                    let conteo = {};
                    let total = 0;

                    dato.Programa.forEach(programa => {
                        programa.Descripcion.forEach(desc => {
                            if (desc.Criterio && desc.Criterio !== 'NA') {
                                if (!conteo[desc.Criterio]) {
                                    conteo[desc.Criterio] = 0;
                                }
                                conteo[desc.Criterio]++;
                                total++;
                            }
                        });
                    });

                    const puntosObtenidos = calcularPuntosTotales(conteo);
                    const conteoCriteriosTabla = conteoCriteriosOcultos[periodIdx] || { m: 0, M: 0, C: 0 };
                    const confExternas = dato.PuntuacionMaxima - total;
                    const PuntuacionObtenida = dato.PuntuacionMaxima ? (confExternas + ((puntosObtenidos * 100 + ((conteoCriteriosTabla.m * 0.3) + (conteoCriteriosTabla.M * 0.7) + conteoCriteriosTabla.C) * 100) / 100)) : 
                        ((puntosObtenidos * 100 + ((conteoCriteriosTabla.m * 0.3) + (conteoCriteriosTabla.M * 0.7) + conteoCriteriosTabla.C) * 100) / 100).toFixed(2);

                    const resultado = dato.PuntuacionMaxima ? (((confExternas + ((puntosObtenidos * 100 + ((conteoCriteriosTabla.m * 0.3) + (conteoCriteriosTabla.M * 0.7) + conteoCriteriosTabla.C) * 100) / 100)) * 100)/ dato.PuntuacionMaxima) : 
                    (((puntosObtenidos * 100 + ((conteoCriteriosTabla.m * 0.3) + (conteoCriteriosTabla.M * 0.7) + conteoCriteriosTabla.C) * 100) / 100).toFixed(2)) * 100 / total;

                    const porcentajeTotal = dato.PuntuacionMaxima ? (((confExternas + ((puntosObtenidos * 100 + ((conteoCriteriosTabla.m * 0.3) + (conteoCriteriosTabla.M * 0.7) + conteoCriteriosTabla.C) * 100) / 100)) * 100)/ dato.PuntuacionMaxima).toFixed(2) :
                    (((puntosObtenidos * 100 + ((conteoCriteriosTabla.m * 0.3) + (conteoCriteriosTabla.M * 0.7) + conteoCriteriosTabla.C) * 100) / 100) * 100 / total).toFixed(2)

                    const estatus = resultado >= 90 ? "Bueno" :
                                    resultado >= 80 ? "Aceptable" :
                                    resultado >= 60 ? "No Aceptable" : "Crítico";

                        return (
                            <div key={periodIdx}>
                                <div className="duracion-bloque-repo">
                                    <h2 onClick={() => toggleDuration(dato.Duracion)}>
                                        Fecha de Elaboración: {formatDate(dato.FechaElaboracion)}
                                    </h2>
                                </div>

                                <div className={`update-button-container ${hiddenDurations.includes(dato.Duracion) ? 'hidden' : ''}`}>
                                    <div className='contenedor-repo'>
                                    <div className='buttons-estado'>
                                    <button onClick={() => toggleTextAreaVisibility(dato._id)}>
                                            {visibleTextAreas[dato._id] ? 'Ocultar Nota' : 'Escribir Nota'}
                                        </button>
                                        <button className='boton-rechazar' onClick={() => Rechazar(dato._id, dato.AuditorLiderEmail)}>Rechazar</button>
                                        <button onClick={() => Aprobar(dato._id, PuntuacionObtenida, confExternas,estatus, porcentajeTotal, dato.AuditorLiderEmail)}>Aprobar</button>
                                    </div>     
                                    {visibleTextAreas[dato._id] && (
                                        <textarea
                                            className='textarea-mod'
                                            value={notas[dato._id] || ''}
                                            onChange={(e) => notaCorreccion(e, dato._id)}
                                         placeholder='Razón del rechazo. . .'></textarea>
                                    )}
                                        <div className="header-container-datos-repo">
                                            <img src={logo} alt="Logo Empresa" className="logo-empresa-repo" />
                                            <div className='encabezado'>
                                            <h1>REPORTE DE AUDITORÍA</h1>
                                            </div>
                                        </div>
                                        <div className='mover'>
                                            <div className="dato"><span className="bold-text">Duración de la auditoría:</span> {dato.Duracion}</div>
                                            <div className="dato"><span className="bold-text">Tipo de auditoría:</span> {dato.TipoAuditoria}</div>
                                            <div className="dato"><span className="bold-text">Fecha de Elaboración de Reporte:</span> {formatDate(dato.FechaElaboracion)}</div>
                                        </div>
                                        <div className='tabla-reporte'>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan="1" className="conformity-header-repo">Puntos Obtenidos</th>
                                                </tr>
                                            </thead>
                                        
                                        <div className="horizontal-container">
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">
                                                    <div className="horizontal-inline">
                                                        <div>Conforme: </div>
                                                        <div style={{marginLeft:'3px'}}>{dato.PuntuacionMaxima ? confExternas : ''}</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'Conforme')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item">
                                                            {conteo[criterio] + (conteoCriteriosTabla.M + conteoCriteriosTabla.m + conteoCriteriosTabla.C)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="horizontal-item">
                                                <div className="horizontal-inline">
                                                    <div>NC Menor:</div>
                                                    {Object.keys(contarCriteriosPorTipo(conteo, 'm')).map(criterio => (
                                                        <div key={criterio} className="horizontal-inline-item">
                                                            {conteo[criterio] - conteoCriteriosTabla.m}
                                                        </div>
                                                    ))}
                                                </div>
                                                </div>
                                            </div>
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">
                                                    <div className="horizontal-inline"> 
                                                        <div>NC Mayor:</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'M')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item"> 
                                                            {conteo[criterio] - conteoCriteriosTabla.M}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="horizontal-item">
                                                    <div className="horizontal-inline"> 
                                                        <div>NC Crítica:</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'C')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item"> 
                                                            {conteo[criterio] - conteoCriteriosTabla.C}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">Puntuación Máxima: {dato.PuntuacionMaxima ? dato.PuntuacionMaxima : total}</div>
                                                <div className="horizontal-item">
                                                    Puntuación Obtenida: {PuntuacionObtenida}
                                                </div>
                                            </div>
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">Porcentaje: {porcentajeTotal}%</div>
                                                <div className="horizontal-item">Estatus: {estatus}</div>
                                            </div>
                                        </div>
                                        </table>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan="1" className="conformity-header-repo">Objetivo</th>
                                                </tr>
                                            </thead>
                                            <div>{dato.Objetivo ? dato.Objetivo : 'Garantizar que el Sistema cumpla continuamente con los requisitos internacionales, lo que da como resultado una certificación que asegura el suministro de productos seguros a los consumidores en todo el mundo.'}</div>
                                        </table>

                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan="2" className="conformity-header-repo">Alcance</th>
                                                </tr>
                                                <tr>
                                                    <th className="table-header">Documento de Referencia</th>
                                                    <th className="table-header">Áreas Auditadas</th>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        {dato.Programa.map((programa, programIdx) => (
                                                            <div key={programIdx}>
                                                                {programa.Nombre}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td><div>{dato.AreasAudi}</div></td>
                                                </tr>
                                                <tr>
                                                    <th className="table-header">Equipo Auditor</th>
                                                    <th className="table-header">Participantes en el Área del Recorrido</th>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>Auditor Líder: {dato.AuditorLider}</div>
                                                        <div>
                                                        {dato.EquipoAuditor.map((equipo, equipoIdx) => (
                                                            <div key={equipoIdx}>
                                                              Equipo Auditor: {equipo.Nombre}
                                                            </div>
                                                        ))}</div>
                                                        {dato.NombresObservadores && (
                                                            <div>Observador(es): {dato.NombresObservadores}</div>
                                                            )}
                                                    </td>
                                                    <td>
                                                        <div>{dato.Auditados}</div>
                                                    </td>
                                                </tr>
                                            </thead>
                                        </table>

                                        <div>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th colSpan="10" className="conformity-header-repo">Resultados</th>
                                                    </tr>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Programa</th>
                                                        <th>Lineamiento</th>
                                                        <th>Criterio</th>
                                                        <th>Hallazgos</th>
                                                        <th>Evidencia</th>
                                                        <th>Acciones</th>
                                                        <th>Fecha</th>
                                                        <th>Responsable</th>
                                                        <th>Efectividad</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {dato.Programa.map((programa, programIdx) => (
                                                    programa.Descripcion.map((desc, descIdx) => {
                                                        const base64Prefix = 'data:image/png;base64,';
                                                        const isBase64Image = desc.Hallazgo.includes(base64Prefix);

                                                        const rowId = `${periodIdx}-${programIdx}-${descIdx}`;
                                                        const isHidden = hiddenRows[rowId];

                                                        if (desc.Criterio !== 'NA' && desc.Criterio !== 'Conforme') {
                                                            return (
                                                                <React.Fragment key={descIdx}>
                                                                    <tr style={{ display: isHidden ? 'none' : 'table-row' }}>
                                                                        <td>{desc.ID}</td>
                                                                        <td className='alingR2'>{programa.Nombre}</td>
                                                                        <td className='alingR'>{desc.Requisito}</td>
                                                                        <td>{desc.Criterio}</td>
                                                                        <td style={{textAlign:'initial'}}>{desc.Observacion}</td>
                                                                        <td className='alingR' key={descIdx}>
                                                                            {desc.Hallazgo ? (
                                                                                isBase64Image ? (
                                                                                    <img
                                                                                        src={desc.Hallazgo}
                                                                                        alt="Evidencia"
                                                                                        className="hallazgo-imagen"
                                                                                    />
                                                                                ) : (
                                                                                    <span>{desc.Hallazgo}</span>
                                                                                )
                                                                            ) : null}
                                                                        </td>
                                                                        <td>
                                                                            <button className='button-oculto' onClick={() => handleToggleRowVisibility(periodIdx, programIdx, descIdx)}>
                                                                               Ocultar
                                                                            </button>
                                                                        </td>
                                                                        <td>{}</td>
                                                                        <td>{}</td>
                                                                        <td>{}</td>
                                                                    </tr>
                                                                </React.Fragment>
                                                            );
                                                        } else {
                                                            return null;
                                                        }
                                                    })
                                                ))}
                                                </tbody>

                                            </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Reporte;