import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/PendingAuditsCalendar.css';
import Navigation from '../Navigation/Navbar'; // Asegúrate de ajustar la ruta si es necesario

const PendingAuditsCalendar = () => {
  const [audits, setAudits] = useState([]);
  const [filterAuditorLider, setFilterAuditorLider] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [filterTipoAuditoria, setFilterTipoAuditoria] = useState('');

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
        console.log('Respuesta de la API:', response.data); // Log the response to check the data
        const pendingAudits = response.data.filter(audit => audit.Estado === 'pendiente');
        const sortedAudits = pendingAudits.sort((a, b) => new Date(b.FechaInicio) - new Date(a.FechaInicio));
        console.log('Auditorías pendientes ordenadas:', sortedAudits); // Log the sorted data
        setAudits(sortedAudits);
      } catch (error) {
        console.error('Error al obtener auditorías:', error);
      }
    };

    fetchAudits();
  }, []);

  const applyFilters = () => {
    return audits.filter(audit => {
      // Aplicar filtro por auditor líder (coincidencia parcial)
      if (filterAuditorLider && !audit.AuditorLider.toLowerCase().includes(filterAuditorLider.toLowerCase())) {
        return false;
      }
      // Aplicar filtro por nombre del programa (coincidencia parcial)
      if (filterPrograma && !audit.Programa.some(programa => programa.Nombre.toLowerCase().includes(filterPrograma.toLowerCase()))) {
        return false;
      }
      // Aplicar filtro por tipo de auditoría
      if (filterTipoAuditoria && audit.TipoAuditoria !== filterTipoAuditoria) {
        return false;
      }
      // Aplicar filtro por fecha de inicio y fecha fin
      if (filterFechaInicio && new Date(audit.FechaInicio) < new Date(filterFechaInicio)) {
        return false;
      }
      if (filterFechaFin && new Date(audit.FechaFin) > new Date(filterFechaFin)) {
        return false;
      }
      return true;
    });
  };

  const filteredAudits = applyFilters();

  return (
    <div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
        </div>
    <div className="pending-audits-calendar">
      <br />
      <br />
      <h1>Calendario de Auditorías Pendientes</h1>

      <div className="filters">
      <select
          value={filterTipoAuditoria}
          onChange={e => setFilterTipoAuditoria(e.target.value)}
        >
          <option value="">Filtrar por tipo de auditoría</option>
          <option value="Interna">Interna</option>
          <option value="Externa">Externa</option>
          <option value="FSSC 22000">FSSC 22000</option>
          <option value="Responsabilidad social">Responsabilidad social</option>
          <option value="Inspección de autoridades">Inspección de autoridades</option>
        </select>
        <input
          type="text"
          placeholder="Filtrar por auditor líder"
          value={filterAuditorLider}
          onChange={e => setFilterAuditorLider(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por nombre del programa"
          value={filterPrograma}
          onChange={e => setFilterPrograma(e.target.value)}
        />
        <input
          type="date"
          value={filterFechaInicio}
          onChange={e => setFilterFechaInicio(e.target.value)}
        />
        <input
          type="date"
          value={filterFechaFin}
          onChange={e => setFilterFechaFin(e.target.value)}
        />
      </div>
      <br />
      <table className="pending-audits-table">
        <thead>
          <tr>
            <th>Tipo de Auditoría</th>
            <th>Nombre del Programa</th>
            <th>Auditor Líder</th>
            <th>Equipo Auditor</th>
            <th>Observador</th>
            <th>Fecha de inicio</th>
            <th>Fecha de finalización</th>
          </tr>
        </thead>
        <tbody>
          {filteredAudits.length > 0 ? (
            filteredAudits.map(audit => (
              <tr key={audit._id}>
                <td>{audit.TipoAuditoria}</td>
                <td>
                  {audit.Programa.map(programa => (
                    <div key={programa.Nombre}>{programa.Nombre}</div>
                  ))}
                </td>
                <td>{audit.AuditorLider}</td>
                <td>
                  {audit.EquipoAuditor.length > 0 ? (
                    audit.EquipoAuditor.map(miembro => (
                      <div key={miembro.Nombre}>{miembro.Nombre} ({miembro.Correo})</div>
                    ))
                  ) : (
                    <div>Esta auditoría no cuenta con equipo auditor</div>
                  )}
                </td>
                <td>{audit.NombresObservadores ? audit.NombresObservadores : 'No cuenta con observador'}</td>
                <td>{audit.FechaInicio}</td>
                <td>{audit.FechaFin}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No tienes auditorías pendientes</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default PendingAuditsCalendar;