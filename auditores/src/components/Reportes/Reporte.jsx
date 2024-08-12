import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../App';
import logo from "../../assets/img/logoAguida.png";
import './css/Reporte.css'; 
import Navigation from '../Navigation/narbar';

const Reporte = () => {
    const { userData } = useContext(UserContext);
    const [datos, setDatos] = useState([]);
    const [hiddenDurations, setHiddenDurations] = useState([]);
    const [, setCriteriosConteo] = useState({});
    const [, setTotalCriterios] = useState(0);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
                if (userData && userData.Correo) {
                    const datosFiltrados = response.data.filter((dato) => 
                        (dato.AuditorLiderEmail === userData.Correo || 
                            (dato.EquipoAuditor.length > 0 && dato.EquipoAuditor.some(auditor => auditor.Correo === userData.Correo))) && (dato.Estado !== "pendiente" && dato.Estado !== "Devuelto")
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

        obtenerDatos();
    }, [userData]);

    const toggleDuration = (duration) => {
        setHiddenDurations(hiddenDurations.includes(duration) ?
            hiddenDurations.filter((dur) => dur !== duration) :
            [...hiddenDurations, duration]
        );
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

    return (
        <div className='espacio-repo'>
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
            </div>
            <div className="datos-container-repo">
            <h1 style={{fontSize:'3rem', display:'flex' ,justifyContent:'center', marginTop:'0'}}>Reportes Generados</h1>
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

                        return (
                            <div key={periodIdx}>
                                <div className="duracion-bloque-repo">
                                    <h2 onClick={() => toggleDuration(dato.Duracion)}>
                                        Fecha de Elaboración: {formatDate(dato.FechaElaboracion)}
                                    </h2>
                                </div>

                                <div className={`update-button-container ${hiddenDurations.includes(dato.Duracion) ? 'hidden' : ''}`}>
                                    <div className='contenedor-repo'>
                                        <div className="header-container-datos-repo">
                                            <img src={logo} alt="Logo Empresa" className="logo-empresa-repo" />
                                            <h1>REPORTE DE AUDITORÍA</h1>
                                        </div>
                                        <div className='mover'>
                                            <div className="dato"><span className="bold-text">Duración de la auditoría:</span> {dato.Duracion}</div>
                                            <div className="dato"><span className="bold-text">Tipo de auditoría:</span> {dato.TipoAuditoria}</div>
                                            <div className="dato"><span className="bold-text">Fecha de elaboración de reporte:</span> {formatDate(dato.FechaElaboracion)}</div>
                                        </div>
                                        <div className='tablas-reporte'>
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
                                                        <div>Conforme:</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'Conforme')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item">  {conteo[criterio]}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="horizontal-item">
                                                    <div className="horizontal-inline">
                                                        <div>NC Menor:</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'm')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item"> {conteo[criterio]}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">
                                                    <div className="horizontal-inline"> 
                                                        <div>NC Mayor:</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'M')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item"> {conteo[criterio]}
                                                            </div>
                                                        ))} 
                                                    </div>
                                                </div>
                                                <div className="horizontal-item">
                                                    <div className="horizontal-inline"> 
                                                        <div>NC Crítica:</div>
                                                        {Object.keys(contarCriteriosPorTipo(conteo, 'C')).map(criterio => (
                                                            <div key={criterio} className="horizontal-inline-item"> {conteo[criterio]}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">Puntuación máxima: {total}</div>
                                                <div className="horizontal-item">Puntuación Obtenida: {puntosObtenidos}</div>
                                            </div>
                                            <div className="horizontal-group">
                                                <div className="horizontal-item">Porcentaje: {dato.PorcentajeTotal}%</div>
                                                <div className="horizontal-item">Estatus: {dato.Estatus}</div>
                                            </div>
                                        </div>
                                        </table>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan="1" className="conformity-header-repo">Objetivo</th>
                                                </tr>
                                            </thead>
                                            <div>Garantizar que el Sistema cumpla continuamente con los requisitos internacionales, lo que da como resultado una certificación que asegura el suministro de productos seguros a los consumidores en todo el mundo.</div>
                                        </table>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan="2" className="conformity-header-repo">Alcance</th>
                                                </tr>
                                                <tr>
                                                    <th className="table-header">Documento de Referencia</th>
                                                    <th className="table-header">Áreas auditadas</th>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        {dato.Programa.map((programa, programIdx) => (
                                                            <div key={programIdx}>
                                                                {programa.Nombre}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        {console.log(dato.AreasAudi)} {/* Esto te ayudará a ver la estructura del array en la consola */}
                                                        {dato.AreasAudi.map((area, i) => (
                                                            <div key={i}>
                                                            {area}
                                                            </div>
                                                        ))}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th className="table-header">Equipo auditor</th>
                                                    <th className="table-header">Participantes en el área del recorrido</th>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>Auditor líder: {dato.AuditorLider}</div>
                                                        <div>
                                                        {dato.EquipoAuditor.map((equipo, equipoIdx) => (
                                                            <div key={equipoIdx}>
                                                              Equipo auditor: {equipo.Nombre}
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
                                                            if (desc.Criterio !== 'NA' && desc.Criterio !== 'Conforme') {
                                                                return (
                                                                    <tr key={descIdx}>
                                                                        <td>{desc.ID}</td>
                                                                        <td className='alingR2'>{programa.Nombre}</td>
                                                                        <td className='alingR'>{desc.Requisito}</td>
                                                                        <td>{desc.Criterio}</td>
                                                                        <td>{desc.Observacion}</td>
                                                                        <td key={descIdx}>
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
                                                                        <td>{}</td>
                                                                        <td>{}</td>
                                                                        <td>{}</td>
                                                                        <td>{}</td>
                                                                    </tr>
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