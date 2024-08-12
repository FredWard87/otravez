import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../App';
import logo from "../../assets/img/logoAguida.png";
import Navigation from '../Navigation/Navbar';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Finalizada = () => {
    const { userData } = useContext(UserContext);
    const [datos, setDatos] = useState([]);
    const [ishikawas, setIshikawas] = useState([]);
    const [hiddenDurations, setHiddenDurations] = useState([]);
    const [, setCriteriosConteo] = useState({});
    const [, setTotalCriterios] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[userData]);

    const obtenerDatos = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
            if (userData && userData.Correo) {
                const datosFiltrados = response.data.filter((dato) => 
                    dato.Estado === "Finalizado"
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`);
                const dataFiltrada = response.data.filter(item => 
                item.estado === 'En revisión' ||  item.estado === 'Revisado' ||  item.estado === 'Rechazado' || item.estado === 'Aprobado' ) ;
                setIshikawas(dataFiltrada);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

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

    const navIshikawa = (_id, id) => {
        navigate(`/ishikawa/${_id}/${id}`);
    }; 
    
    const generatePDF = async (id) => {
        const input = document.getElementById(id);
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('l', 'cm', 'letter');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const imageHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
        // Define the threshold height for splitting the page
        const thresholdHeight = pdfHeight * 0.75; // Adjust this value as needed
    
        if (imageHeight <= thresholdHeight) {
            // If the image height is within the threshold, add it to the PDF as a single page
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imageHeight);
        } else {
            // Split the content into multiple pages
            let yOffset = 0;
            while (yOffset < imageHeight) {
                pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, imageHeight);
                yOffset += pdfHeight;
                if (yOffset < imageHeight) {
                    pdf.addPage();
                }
            }
        }
        
        pdf.save(`reporte_${id}.pdf`);
    };

    return (
        <div className='espacio-repo'>
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
            </div>
            <div className="datos-container-repo">
            <h1 style={{fontSize:'3rem', display:'flex' ,justifyContent:'center', marginTop:'0'}}>Reportes Finalizados</h1>
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
                                    <button onClick={() => generatePDF(`reporte-${periodIdx}`)}>Guardar como PDF</button>
                                </div>

                                <div className={`update-button-container ${hiddenDurations.includes(dato.Duracion) ? 'hidden' : ''}`}>
                                    <div className='contenedor-repo'>
                                        <div className="header-container-datos-repo">
                                            <img src={logo} alt="Logo Empresa" className="logo-empresa-repo" />
                                            <div className='encabezado'>
                                            <h1>REPORTE DE AUDITORÍA</h1>
                                            </div>
                                        </div>
                                        <div className='mover'>
                                            <div className="dato"><span className="bold-text">Duración de la auditoría:</span> {dato.Duracion}</div>
                                            <div className="dato"><span className="bold-text">Tipo de auditoría:</span> {dato.TipoAuditoria}</div>
                                            <div className="dato"><span className="bold-text">Fecha de elaboración de reporte:</span> {formatDate(dato.FechaElaboracion)}</div>
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
                                                        <div>Conforme:</div>
                                                        <div style={{marginLeft:'3px'}}>{dato.PuntuacionConf ?  dato.PuntuacionConf : ''}</div>
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
                                                <div className="horizontal-item">Puntuación máxima: { dato.PuntuacionMaxima ? dato.PuntuacionMaxima : total}</div>
                                                <div className="horizontal-item">Puntuación Obtenida: {dato.PuntuacionObten ? dato.PuntuacionObten: puntosObtenidos}</div>
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
                                                <tbody>
                                                    <tr>
                                                        <td>{dato.Objetivo ? dato.Objetivo : 'Objetivo de ejemplo'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th colSpan="2" className="conformity-header-repo">Alcance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td style={{backgroundColor:'#bdfdbd', fontWeight: 'bold', width:'50%'}}>Documento de Referencia</td>
                                                        <td style={{backgroundColor:'#bdfdbd', fontWeight: 'bold'}}>Áreas auditadas</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            {dato.Programa.map((programa, programIdx) => (
                                                                <div key={programIdx}>
                                                                    {programa.Nombre}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td>{dato.AreasAudi}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{backgroundColor:'#bdfdbd', fontWeight: 'bold'}}>Equipo auditor</td>
                                                        <td style={{backgroundColor:'#bdfdbd', fontWeight: 'bold'}}>Participantes en el área del recorrido</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div>Auditor líder: {dato.AuditorLider}</div>
                                                            <div>
                                                                {dato.EquipoAuditor.map((equipo, equipoIdx) => (
                                                                    <div key={equipoIdx}>
                                                                        Equipo auditor: {equipo.Nombre}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {dato.NombresObservadores && (
                                                                <div>Observador(es): {dato.NombresObservadores}</div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div>{dato.Auditados}</div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th colSpan="6" className="conformity-header-repo">Resultados</th>
                                                            <th colSpan="4" className="conformity-header-repo">Porcentaje de Cumplimiento: <span>
                                                                    {dato.PorcentajeCump != null ? Number(dato.PorcentajeCump).toFixed(2) : '0.00'}
                                                                </span>%</th>
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
                                                        {dato.Programa.map((programa, programIdx) =>
                                                            programa.Descripcion.map((desc, descIdx) => {
                                                                const base64Prefix = 'data:image/png;base64,';
                                                                const isBase64Image = desc.Hallazgo.includes(base64Prefix);

                                                                if (desc.Criterio !== 'NA' && desc.Criterio !== 'Conforme') {
                                                                    const ishikawa = ishikawas.find(ish => {
                                                                        return ish.idReq === desc.ID && ish.idRep === dato._id;
                                                                    });

                                                                    const ajustarFecha = (fechaString) => {
                                                                        const fecha = new Date(fechaString);
                                                                        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
                                                                        return fecha.toLocaleDateString('es-ES');
                                                                    };

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
                                                                            <td>{ishikawa ? (ishikawa.actividades.length > 0 ? ishikawa.actividades[0].actividad : '') : ''}</td>
                                                                            <td>{ishikawa ? (ishikawa.actividades.length > 0 ? ishikawa.actividades[0].responsable : '') : ''}</td>
                                                                            <td>
                                                                                {ishikawa ? (
                                                                                    ishikawa.actividades.length > 0 ? ajustarFecha(ishikawa.actividades[0].fechaCompromiso) : ''
                                                                                ) : ''}
                                                                            </td>
                                                                            <td>
                                                                                <button className='button-estado' onClick={() => navIshikawa(dato._id, desc.ID)}>{ishikawa ? ishikawa.estado : 'Pendiente'}</button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                } else {
                                                                    return null;
                                                                }
                                                            })
                                                        )}
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

export default Finalizada;