import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Datos.css';
import Navigation from "../Navigation/Navbar";
import logo from "../../assets/img/logoAguida.png";
import Swal from 'sweetalert2';

const Datos = () => {
  const [formData, setFormData] = useState({
    TipoAuditoria: '',
    Duracion: '',
    FechaInicio: '',
    FechaFin: '',
    Departamento:'',
    AreasAudi: [],
    Auditados: [],
    AuditorLider: '',
    AuditorLiderEmail: '', 
    EquipoAuditor: [],
    Observador: false,
    NombresObservadores: '',
    Programa: [],
    Estado: '',
    PorcentajeTotal: '',
    FechaElaboracion:'',
    Comentario:'',
    Estatus:''
  });

  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);


  const [buttonText, setButtonText] = useState({
    button1: 'Datos generales',
    button2: 'Datos del Auditor',
    button3: 'Programas'
  });

  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [formStep, setFormStep] = useState(1);
  const [areas, setAreas] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showOtherAreaInput] = useState(false);
  const [auditorLiderSeleccionado, setAuditorLiderSeleccionado] = useState('');
  const [auditadosSeleccionados, setAuditadosSeleccionados] = useState(false);
  const [equipoAuditorDisabled, setEquipoAuditorDisabled] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/areas`);
        setAreas(response.data);
      } catch (error) {
        console.error("Error al obtener las áreas", error);
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/programas`);
        setProgramas(response.data);
      } catch (error) {
        console.error("Error al obtener los programas", error);
      }
    };

    fetchProgramas();
  }, []);
  

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usuarios`);
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener los usuarios", error);
      }
    };
  
    fetchUsuarios();
  }, []);


  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
  
    if (name === 'AuditorLider') {
      setAuditorLiderSeleccionado(value);
      
      // Obtener el correo del auditor líder
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usuarios/nombre/${encodeURIComponent(value)}`);
        console.log(response);
        const email = response.data.email;
        newFormData = { ...newFormData, AuditorLiderEmail: email };
      } catch (error) {
        console.error("Error al obtener el correo electrónico del auditor líder", error);
        newFormData = { ...newFormData, AuditorLiderEmail: '' };
      }
    } else if (name === 'EquipoAuditor') {
      if (value === 'No aplica') {
        newFormData = {
          ...newFormData,
          EquipoAuditor: []
        };
        setEquipoAuditorDisabled(true);
      } else {
        setEquipoAuditorDisabled(false);
        newFormData = {
          ...newFormData,
          EquipoAuditor: newFormData.EquipoAuditor.includes(value)
            ? newFormData.EquipoAuditor.filter(e => e !== value)
            : [...newFormData.EquipoAuditor, value]
        };
      }
    }
  
    if (name === 'FechaInicio' || name === 'FechaFin') {
      const { FechaInicio, FechaFin } = newFormData;
      if (FechaInicio && FechaFin) {
        const inicio = new Date(FechaInicio + 'T00:00:00');
        const fin = new Date(FechaFin + 'T00:00:00');
        if (inicio <= fin) {
          const inicioMes = inicio.toLocaleString('es-ES', { month: 'long' });
          const finMes = fin.toLocaleString('es-ES', { month: 'long' });
          if (inicioMes === finMes) {
            newFormData.Duracion = `del ${inicio.getDate()} al ${fin.getDate()} de ${inicioMes} ${inicio.getFullYear()}`;
          } else {
            newFormData.Duracion = `del ${inicio.getDate()} de ${inicioMes} al ${fin.getDate()} de ${finMes} ${inicio.getFullYear()}`;
          }
        } else {
          alert("La fecha de fin debe ser mayor o igual a la fecha de inicio.");
          newFormData[name] = formData[name];
        }
      }
    }
  
    setFormData(newFormData);
  };
  
  const handleAreaChange = (e) => {
    const { value } = e.target;
    if (value === 'No aplica') {
      setAreasSeleccionadas([]);
      setFormData(prevFormData => ({
        ...prevFormData,
        AreasAudi: []
      }));
    } else {
      setAreasSeleccionadas(prevAreas => {
        const newAreas = prevAreas.includes(value)
          ? prevAreas.filter(area => area !== value)
          : [...prevAreas, value];
  
        setFormData(prevFormData => ({
          ...prevFormData,
          AreasAudi: newAreas
        }));
  
        return newAreas;
      });
    }
  }; 

  const handleAreaRemove = (area) => {
    setAreasSeleccionadas(prevAreas => {
      const newAreas = prevAreas.filter(a => a !== area);
      
      setFormData(prevFormData => ({
        ...prevFormData,
        AreasAudi: newAreas
      }));
  
      return newAreas;
    });
  };
  
  const handlePrevious = () => {
    setFormStep(prevStep => prevStep - 1);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (showOtherAreaInput) {
    }
    setFormStep(prevStep => prevStep + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const defaultEstado = "pendiente";
      const defaultPorcentaje = "0";

      const formDataWithAreas = {
        ...formData,
        AreasAudi: areasSeleccionadas,
        Auditados: auditadosSeleccionados,
        Estado: defaultEstado,
        PorcentajeTotal: defaultPorcentaje
      };
  
      const formDataWithDefaults = {
        ...formData,
        Estado: defaultEstado,
        PorcentajeTotal: defaultPorcentaje
      };
  
      if (formData.Programa.length === 0) {
        alert("Por favor, seleccione al menos un programa.");
        return; // Detener el envío del formulario si no se ha seleccionado ningún programa
      }
  
      console.log('Datos a enviar:', formDataWithDefaults);
  
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/datos`, formDataWithDefaults, formDataWithAreas);
      Swal.fire({
        title: 'Auditoria generada con éxito',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3ccc37'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });      
      console.log(response.data);
  
      // Limpiar los campos del formulario después de agregar un usuario exitosamente
      setFormData({
        TipoAuditoria: '',
        Duracion: '',
        FechaInicio: '',
        FechaFin: '',
        Departamento:'',
        AreasAudi: [],
        Auditados: [],
        AuditorLider: '',
        AuditorLiderEmail: '', 
        EquipoAuditor: [],
        Observador: false,
        NombresObservadores: '',
        Programa: [],
        Estado: '',
        PorcentajeTotal: '',
      });
      setFormStep(1);
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      alert("Error al guardar los datos");
    }
  };

  const handleAuditorLiderChange = async (e) => {
    const { value } = e.target;
    setAuditorLiderSeleccionado(value);
    // Obtener el correo del auditor líder
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usuarios/nombre/${encodeURIComponent(value)}`);
      console.log(response);
      const email = response.data.Correo;
      setFormData(prevFormData => ({
        ...prevFormData,
        AuditorLider: value,
        AuditorLiderEmail: email
      }));
    } catch (error) {
      console.error("Error al obtener el correo electrónico del auditor líder", error);
      setFormData(prevFormData => ({
        ...prevFormData,
        AuditorLider: value,
        AuditorLiderEmail: ''
      }));
    }
  };  

  const handleAuditados = async (e) => {
    const { value } = e.target;
    setAuditadosSeleccionados(false);
      if (!auditadosSeleccionados) {
        // Obtener el correo del miembro del equipo auditor seleccionado
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usuarios/nombre/${encodeURIComponent(value)}`);
          const email = response.data.Correo;
          
          // Actualizar el estado formData con el nuevo miembro y su correo
          setFormData(prevFormData => ({
            ...prevFormData,
            Auditados: [
              ...prevFormData.Auditados,
              { Nombre: value, Correo: email }
            ]
          }));
        } catch (error) {
          console.error("Error al obtener el correo electrónico del miembro del equipo auditor", error);
        }
      }
  };
  
  const handleEquipChange = async (e) => {
    const { value } = e.target;
    if (value === "No aplica") {
      setEquipoAuditorDisabled(true);
      setFormData({
        ...formData,
        EquipoAuditor: []
      });
    } else {
      setEquipoAuditorDisabled(false);
      if (!equipoAuditorDisabled) {
        // Obtener el correo del miembro del equipo auditor seleccionado
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/usuarios/nombre/${encodeURIComponent(value)}`);
          const email = response.data.Correo;
          
          // Actualizar el estado formData con el nuevo miembro y su correo
          setFormData(prevFormData => ({
            ...prevFormData,
            EquipoAuditor: [
              ...prevFormData.EquipoAuditor,
              { Nombre: value, Correo: email }
            ]
          }));
        } catch (error) {
          console.error("Error al obtener el correo electrónico del miembro del equipo auditor", error);
        }
      }
    }
  };
  
  
  const handleCancel = () => {
    setEquipoAuditorDisabled(false);
    setFormData({
      ...formData,
      EquipoAuditor: []
    });
  };

  const handleEquipRemove = (equip) => {
    setFormData({
      ...formData,
      EquipoAuditor: formData.EquipoAuditor.filter(e => e !== equip)
    });
  };

  const handleAuditadosRemove = (auditado) => {
    setFormData({
      ...formData,
      Auditados: formData.Auditados.filter(e => e !== auditado)
    });
  };

  const handleProgramChange = async (e) => {
    const { value } = e.target;
    const selectedProgram = programas.find(programa => programa.Nombre === value);
  
    if (selectedProgram) {
      // Modificar el objeto seleccionado para que tenga la estructura esperada por el esquema
      const formattedProgram = {
        Porcentaje: '0',
        Nombre: selectedProgram.Nombre,
        Descripcion: selectedProgram.Descripcion.map(desc => ({
          ID: desc.ID,
          Criterio: desc.Criterio || null,
          Requisito: desc.Requisito,
          Observacion:"",
          Hallazgo: "",
          FechaElaboracion: "",
          Comentario: "",
          Estatus: ""
        }))
      };
      console.log(selectedProgram);

      setFormData(prevFormData => ({
        ...prevFormData,
        Programa: [
          ...prevFormData.Programa,
          formattedProgram
        ]
      }));
    }
  };

  const handleStepChange = (step) => {
    setFormStep(step);
  };

  const handleProgramRemove = (program) => {
    setFormData({
      ...formData,
      Programa: formData.Programa.filter(p => p !== program)
    });
  };

  const handleDepartamentoChange = (e) => {
    const selectedDept = e.target.value;
    setSelectedDepartamento(selectedDept);
    
    const dept = areas.find(area => area.departamento === selectedDept);
    setFilteredAreas(dept ? dept.areas : []);
    
    setFormData({
      ...formData,
      Departamento: selectedDept
    });
  };

  const isFormComplete = (step) => {
    const formDataForStep = getFormDataForStep(step);
    const requiredFields = getRequiredFieldsForStep(step);
  
    for (const field of requiredFields) {
      if (!formDataForStep[field]) {
        return false;
      }
    }
    return true;
  };
  
  const getFormDataForStep = (step) => {
    switch (step) {
      case 2:
        return {
          TipoAuditoria: formData.TipoAuditoria,
          Duracion: formData.Duracion,
          FechaInicio: formData.FechaInicio,
          FechaFin: formData.FechaFin,
          AreasAudi: formData.AreasAudi,
          Auditados: formData.Auditados
        };
      case 3:
        return {
          TipoAuditoria: formData.TipoAuditoria,
          Duracion: formData.Duracion,
          FechaInicio: formData.FechaInicio,
          FechaFin: formData.FechaFin,
          AreasAudi: formData.AreasAudi,
          Auditados: formData.Auditados,
          AuditorLider: formData.AuditorLider,
          NombresObservadores: formData.NombresObservadores
        };
      default:
        return {};
    }
  };
  
  
  const getRequiredFieldsForStep = (step) => {
    switch (step) {
      case 2:
        return ['TipoAuditoria', 'Duracion', 'FechaInicio', 'FechaFin', 'AreasAudi', 'Auditados'];
      case 3:
        if (formData.Observador) {
          return ['TipoAuditoria', 'Duracion', 'FechaInicio', 'FechaFin', 'AreasAudi', 'Auditados',
          'AuditorLider', 'NombresObservadores'];
        } else {
          return ['TipoAuditoria', 'Duracion', 'FechaInicio', 'FechaFin', 'AreasAudi', 'Auditados',
          'AuditorLider','AuditorLider'];
        }
      default:
        return [];
    }
  };

  const updateButtonText = () => {
    if (window.innerWidth <= 770) {
      setButtonText({
        button1: 'Generales',
        button2: 'Auditor',
        button3: 'Programas'
      });
    } else {
      setButtonText({
        button1: 'Datos generales',
        button2: 'Datos del Auditor',
        button3: 'Programas'
      });
    }
  };

  useEffect(() => {
    updateButtonText();
    window.addEventListener('resize', updateButtonText);

    return () => {
      window.removeEventListener('resize', updateButtonText);
    };
  }, []);
    
  return (
      <div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <Navigation />
        </div>
        <div className="centrado">
        <div className="navigation-buttons">
      {formStep !== 4 && (
        <>
          <button onClick={() => handleStepChange(1)} className={formStep === 1 ? 'active' : ''} disabled={!isFormComplete(1)}>
            {buttonText.button1}
          </button>
          <button onClick={() => handleStepChange(2)} className={formStep === 2 ? 'active' : ''} disabled={!isFormComplete(2)}>
            {buttonText.button2}
          </button>
          <button onClick={() => handleStepChange(3)} className={formStep === 3 ? 'active' : ''} disabled={!isFormComplete(3)}>
            {buttonText.button3}
          </button>
        </>
      )}
    </div>
        {formStep === 1 && (
          <div className="datos-container">
          <form onSubmit={handleNext}>
          <h3 className="h3-small-margin">Datos generales</h3>
            <div className="registro-form-datos">
            <div className="form-group-datos" >
              <label>Tipo de auditoría:</label>
              <select name="TipoAuditoria" value={formData.TipoAuditoria} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                <option value="Interna">Interna</option>
                <option value="Externa">Externa</option>
                <option value="FSSC 22000">FSSC 22000</option>
                <option value="Responsabilidad social">Responsabilidad Social</option>
                <option value="Inspección de autoridades">Inspección de Autoridades</option>
              </select>
            </div>
            <div className="form-dates-datos">
                <div className="form-group-datos">
                  <label>Fecha de inicio:</label>
                  <input type="date" name="FechaInicio" value={formData.FechaInicio} onChange={handleChange} required />
                </div>
                <div className="form-group-datos">
                  <label>Fecha de fin:</label>
                  <input type="date" name="FechaFin" value={formData.FechaFin} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group-datos">
                <label>Duración de la auditoría:</label>
                <input type="text" name="Duracion" value={formData.Duracion} onChange={handleChange} required/>
              </div>
            <div className="form-group-datos-container">
              <div className="form-group-datos">
              <label>Departamento:</label>
              <select name="Departamento" value={selectedDepartamento} onChange={handleDepartamentoChange} required>
                <option value="">Seleccione...</option>
                {areas.map(area => (
                  <option key={area.departamento} value={area.departamento}>{area.departamento}</option>
                ))}
              </select>
            </div>
            <div className="form-group-datos">
              <label>Área:</label>
              <select name="AreasAudi" value="" onChange={handleAreaChange}>
                <option value="">Seleccione...</option>
                {filteredAreas.map((area, index) => (
                  <option key={index} value={area}>{area}</option>
                ))}
              </select>
            </div>
            </div>
            <div className="selected-areas">
              {areasSeleccionadas.map((area, index) => (
                <div key={index} className="selected-area">
                  {area}
                  <button type="button" onClick={() => handleAreaRemove(area)} className="remove-button">X</button>
                </div>
              ))}
            </div>
            <div className="form-group-datos">
              <label>Auditados:</label>
              <select
                id="Auditados"
                name="Auditados"
                value=""
                onChange={handleAuditados}
              >
                <option value="">Seleccione...</option>
                {usuarios && usuarios.filter(usuario => usuario.Departamento === selectedDepartamento).map(usuario => (
            <option key={usuario._id} value={usuario.Nombre}>{usuario.Nombre}</option>
          ))}
              </select>
            </div>
            <div className="selected-auditados">
              {formData.Auditados.map((auditado, index) => (
                <div key={index} className="selected-auditado">
                  {auditado.Nombre}
                  <button type="button" onClick={() => handleAuditadosRemove(auditado)} className="remove-button">X</button>
                </div>
              ))}
            </div>
            
            </div>
            <div className="header-container-datos2">
            <div className="button-group-datos">
            {formStep > 1 && <button type="button" className="btn-registrar-datos" onClick={handlePrevious}>Regresar</button>}
              <button type="submit" className="btn-registrar-datos">Siguiente</button>
            </div>
            </div>
        </form>
      </div>
  )}

{formStep === 2 && (
  <div className="datos-container">
    <form onSubmit={handleNext}>
      <h3 className="h3-small-margin">Datos del Auditor:</h3>
      <div className="registro-form-datos">
      <div className="form-group-datos">
        <label>Auditor Líder:</label>
        <select name="AuditorLider" value={formData.AuditorLider} onChange={handleAuditorLiderChange} required>
          <option value="">Seleccione...</option>
          {usuarios && usuarios.filter(usuario => usuario.TipoUsuario === 'auditor').map(usuario => (
            <option key={usuario._id} value={usuario.Nombre}>{usuario.Nombre}</option>
          ))}
        </select>
      </div>
      <div className="form-group-datos">
        <label>Equipo Auditor:</label>
        <select name="Equipo Auditor" value="" onChange={handleEquipChange} disabled={equipoAuditorDisabled}>
          <option value="">Seleccione...</option>
          <option value="No aplica">No aplica</option>
          {usuarios && usuarios.filter(usuario => usuario.TipoUsuario === 'auditor' && usuario.Nombre !== auditorLiderSeleccionado).map(usuario => (
            <option key={usuario._id} value={usuario.Nombre}>{usuario.Nombre}</option>
          ))}
        </select>
      </div>
      <div className="selected-programs">
        {formData.EquipoAuditor.map((equip, index) => (
          <div key={index} className="selected-program">
            {equip.Nombre} {/* Renderizar solo el nombre del miembro */}
            <button type="button" onClick={() => handleEquipRemove(equip) } className="remove-button">X</button>
          </div>
        ))}
      </div>
      {equipoAuditorDisabled && (
        <div className="form-group-datos">
          <button type="button" onClick={handleCancel}>Cancelar</button>
        </div>
      )}
      <div className="form-group-datos">
        <label>
          Observador
          <input type="checkbox" name="Observador" checked={formData.Observador} onChange={handleChange} />
        </label>
      </div>
      {formData.Observador && (
        <div className="form-group-datos">
          <label>Nombre(s) observador(es):</label>
          <input type="text" name="NombresObservadores" value={formData.NombresObservadores} onChange={handleChange} required/>
        </div>
      )}
      </div>
      <div className="header-container-datos2">
      <div className="button-group-datos">
      <button type="button" className="btn-registrar-datos" onClick={handlePrevious}>Regresar</button>
      <button type="submit" className="btn-registrar-datos">Siguiente</button>
      </div>
      </div>
    </form>
  </div>
)}

{formStep === 3 && (
  <div className="datos-container">
    <form onSubmit={handleNext}>
      <h3 className="h3-small-margin">Programas:</h3>
      <div className="registro-form-datos">
      <div className="form-group-datos">
        <label>Programa:</label>
        <select name="Programa" value="" onChange={handleProgramChange}>
          <option value="">Seleccione...</option>
          {programas
            .filter(programa => !formData.Programa.some(selected => selected.Nombre === programa.Nombre))
            .map(programa => (
              <option key={programa._id} value={programa.Nombre}>{programa.Nombre}</option>
            ))}
        </select>
      </div>
      <div className="selected-programs">
        {formData.Programa.map((program, index) => (
          <div key={index} className="selected-program">
            <p className="program-name">{program.Nombre}</p>
            <button type="button" onClick={() => handleProgramRemove(program)} className="remove-button">X</button>
          </div>
        ))}
      </div>
      </div>
      <div className="header-container-datos2">
      <div className="button-group-datos">
          <button type="button" className="btn-registrar-datos" onClick={handlePrevious}>Regresar</button>
          <button type="submit" className="btn-registrar-datos" disabled={formData.Programa.length === 0}>Siguiente</button>
      </div>
      </div>
    </form>
  </div>
)}
</div>

{formStep === 4 && (
  <div className="datos-container2">
    <form onSubmit={handleSubmit}>
      <div className="header-container-datos">
        <img src={logo} alt="Logo Empresa" className="logo-empresa" />
        <div className="button-group-datos">
          <button type="button" className="btn-registrar-datos" onClick={handlePrevious}>Regresar</button>
          <button type="submit" className="btn-registrar-datos">Generar</button>
        </div>
      </div>
      <div className="form-group-datos">
        {formData.Programa.map((program, index) => (
          <div key={index}>
            <table key={index}>
              <thead>
                <tr>
                  <th colSpan="2">{program.Nombre}</th>
                  <th colSpan="5" className="conformity-header">Cumplimiento</th> 
                  <th colSpan="1"></th>
                </tr>
                <tr>
                  <th>ID</th>
                  <th>Requisitos</th>
                  <th>Conforme</th>
                  <th>m</th>
                  <th>M</th>
                  <th>C</th>
                  <th>NA</th>
                  <th>Hallazgos/Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {program.Descripcion.map((desc, idx) => (
                  <tr key={idx}>
                    <td>{desc.ID}</td>
                    <td>{desc.Requisito}</td>
                    <td><input type="checkbox" name={`Conforme_${index}`} /></td>
                    <td><input type="checkbox" name={`m_${index}`} /></td>
                    <td><input type="checkbox" name={`M_${index}`} /></td>
                    <td><input type="checkbox" name={`C_${index}`} /></td>
                    <td><input type="checkbox" name={`NA_${index}`} /></td>
                    <td><textarea name={`Observaciones_${index}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </form>
  </div>
)}

    </div>
  );
};

export default Datos;