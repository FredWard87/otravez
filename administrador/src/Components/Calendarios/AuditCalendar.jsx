import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import Navigation from '../Navigation/Navbar';
import './css/AuditCalendar.css';

const AuditCalendar = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [selectedAudits, setSelectedAudits] = useState([]);
  const [filters, setFilters] = useState({
    auditorLider: '',
    tipoAuditoria: '',
    departamento: '',
    aceptibilidad: '',
    year: ''
  });

  useEffect(() => {
    const fetchAuditorias = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/datos`);
        setAuditorias(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAuditorias();
  }, []);

  useEffect(() => {
    const filteredAudits = auditorias.filter(audit => audit.Estado === 'Finalizado');
    setSelectedAudits(filteredAudits);
  }, [auditorias]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const getFilteredAudits = () => {
    return selectedAudits.filter(audit => {
      const acceptability = getAcceptability(audit.PorcentajeTotal);
      const year = new Date(audit.FechaInicio).getFullYear().toString();
      return (
        (filters.auditorLider === '' || audit.AuditorLider === filters.auditorLider) &&
        (filters.tipoAuditoria === '' || audit.TipoAuditoria === filters.tipoAuditoria) &&
        (filters.departamento === '' || audit.Departamento === filters.departamento) &&
        (filters.aceptibilidad === '' || acceptability === filters.aceptibilidad) &&
        (filters.year === '' || year === filters.year)
      );
    });
  };

  const getAcceptability = (percentage) => {
    if (percentage < 70) {
      return 'Rechazado';
    } else if (percentage < 80) {
      return 'No Aceptable';
    } else if (percentage < 90) {
      return 'Aceptable';
    } else {
      return 'Excelente';
    }
  };

  const getAveragePercentageByYear = () => {
    const auditsByYear = {};
    selectedAudits.forEach(audit => {
      const year = new Date(audit.FechaInicio).getFullYear();
      if (!auditsByYear[year]) {
        auditsByYear[year] = { totalPercentage: 0, count: 0 };
      }
      auditsByYear[year].totalPercentage += parseFloat(audit.PorcentajeTotal);
      auditsByYear[year].count += 1;
    });

    const averagePercentages = Object.keys(auditsByYear).map(year => {
      const { totalPercentage, count } = auditsByYear[year];
      return { year, averagePercentage: totalPercentage / count };
    });

    return averagePercentages;
  };

  const getClassByPercentage = (percentage) => {
    if (percentage < 70) return 'red';
    if (percentage < 80) return 'orange';
    if (percentage < 90) return 'yellow';
    return 'green';
  };

  const getYears = () => {
    const years = [...new Set(auditorias.map(audit => new Date(audit.FechaInicio).getFullYear().toString()))];
    return years.sort();
  };

  return (
    <Container className="audit-calendar-container">
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <Navigation />
        </div>
      <br />
      <br />
      <br />
      <br />
      <Box className="audit-details-container">
        <Typography variant="h4" gutterBottom>
          Detalles de las Auditorías Finalizadas
        </Typography>

        {/* Filtros */}
        <Box className="filters-container">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={2.4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Auditor Líder</InputLabel>
                <Select
                  name="auditorLider"
                  value={filters.auditorLider}
                  onChange={handleFilterChange}
                  label="Auditor Líder"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {[...new Set(auditorias.map(audit => audit.AuditorLider))].map((auditorLider, index) => (
                    <MenuItem key={index} value={auditorLider}>
                      {auditorLider}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Tipo de Auditoría</InputLabel>
                <Select
                  name="tipoAuditoria"
                  value={filters.tipoAuditoria}
                  onChange={handleFilterChange}
                  label="Tipo de Auditoría"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Interna">Interna</MenuItem>
                  <MenuItem value="Externa">Externa</MenuItem>
                  <MenuItem value="Responsabilidad social">Responsabilidad social</MenuItem>
                  <MenuItem value="FSSC 22000">FSSC 22000</MenuItem>
                  <MenuItem value="Inspección de autoridades">Inspección de autoridades</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  name="departamento"
                  value={filters.departamento}
                  onChange={handleFilterChange}
                  label="Departamento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Administración">Administración</MenuItem>
                  <MenuItem value="Aseguramiento de calidad">Aseguramiento de calidad</MenuItem>
                  <MenuItem value="Gestión para la calidad">Gestión para la calidad</MenuItem>
                  <MenuItem value="Gestión para la productividad">Gestión para la productividad</MenuItem>
                  <MenuItem value="Ingeniería">Ingeniería</MenuItem>
                  <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="Planeación y Logística">Planeación y Logística</MenuItem>
                  <MenuItem value="Producción">Producción</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Aceptibilidad</InputLabel>
                <Select
                  name="aceptibilidad"
                  value={filters.aceptibilidad}
                  onChange={handleFilterChange}
                  label="Aceptibilidad"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Rechazado">Rechazado</MenuItem>
                  <MenuItem value="No Aceptable">No Aceptable</MenuItem>
                  <MenuItem value="Aceptable">Aceptable</MenuItem>
                  <MenuItem value="Excelente">Excelente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Año</InputLabel>
                <Select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  label="Año"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {getYears().map((year, index) => (
                    <MenuItem key={index} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Table className="audit-table">
          <TableHead>
            <TableRow>
              <TableCell>Tipo de Auditoría</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Área Auditada</TableCell>
              <TableCell>Auditado por</TableCell>
              <TableCell>Equipo Auditor</TableCell>
              <TableCell>Observador</TableCell>
              <TableCell>Porcentaje Obtenido</TableCell>
              <TableCell>Aceptibilidad</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredAudits().map((audit, index) => (
              <TableRow key={index}>
                <TableCell>{audit.TipoAuditoria}</TableCell>
                <TableCell>{audit.Duracion}</TableCell>
                <TableCell>{audit.Departamento}</TableCell>
                <TableCell>{audit.AreasAudi}</TableCell>
                <TableCell>{audit.AuditorLider}</TableCell>
                <TableCell>
                  {audit.EquipoAuditor && audit.EquipoAuditor.length > 0 ? (
                    <ul>
                      {audit.EquipoAuditor.map((miembro, miembroIndex) => (
                        <li key={miembroIndex}>{miembro.Nombre} - {miembro.Correo}</li>
                      ))}
                    </ul>
                  ) : (
                    'No cuenta con equipo auditor'
                  )}
                </TableCell>
                <TableCell>{audit.Observador ? 'Sí' : 'No'}</TableCell>
                <TableCell>{audit.PorcentajeTotal}</TableCell>
                <TableCell>{getAcceptability(audit.PorcentajeTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box className="average-percentage-container">
          <Typography variant="h5" gutterBottom>
            Promedio de Porcentajes por Año
          </Typography>
          <Table className="audit-table">
            <TableHead>
              <TableRow>
                <TableCell>Año</TableCell>
                <TableCell>Promedio de Porcentaje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getAveragePercentageByYear().map((data, index) => (
                <TableRow key={index} className={getClassByPercentage(data.averagePercentage)}>
                  <TableCell>{data.year}</TableCell>
                  <TableCell>{data.averagePercentage.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Container>
  );
};

export default AuditCalendar;