import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './css/Carga.css'; // Importa tu archivo CSS aquí
import Navigation from "../Navigation/Navbar"; // Importa tu componente de navegación
import Swal from 'sweetalert2'; // Importa SweetAlert

const CargaMasiva = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo no seleccionado',
        text: 'Por favor selecciona un archivo'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Datos extraídos del archivo Excel:', jsonData);

      // Validación de campos requeridos
      const requiredFields = [
        'TipoAuditoria', 'FechaInicio', 'FechaFin', 'Duracion', 'Departamento',
        'AreasAudi', 'Auditados', 'AuditorLider', 'AuditorLiderEmail', 'EquipoAuditor_Nombre', 'EquipoAuditor_Correo', 'Observador'
      ];

      const mainData = jsonData[0];
      const missingFields = requiredFields.filter(field => !mainData[field]);

      if (missingFields.length > 0) {
        console.error('Faltan campos requeridos:', missingFields);
        Swal.fire({
          icon: 'error',
          title: 'Campos requeridos faltantes',
          text: 'Por favor completa todos los campos requeridos en los datos del archivo'
        });
        return;
      }

      // Función para convertir fechas de Excel a formato legible
      const convertExcelDateToJSDate = (serial) => {
        if (serial == null) {
          return null;
        }
        const utc_days = Math.floor(serial - 25569) + 1; // Ajuste de 1 día
        const date_info = new Date(utc_days * 86400 * 1000);
        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
      };

      // Obtener el año actual
      const currentYear = new Date().getFullYear();

      // Transformar datos del programa
      let currentAudit = {
        TipoAuditoria: mainData.TipoAuditoria,
        FechaInicio: convertExcelDateToJSDate(mainData.FechaInicio),
        FechaFin: convertExcelDateToJSDate(mainData.FechaFin),
        Duracion: mainData.Duracion,
        Departamento: mainData.Departamento,
        AreasAudi: mainData.AreasAudi,
        Auditados: [], // Inicializa como un array vacío
        AuditorLider: mainData.AuditorLider,
        AuditorLiderEmail: mainData.AuditorLiderEmail,
        EquipoAuditor: [],
        Observador: mainData.Observador,
        NombresObservadores: mainData.NombresObservadores,
        Estado: mainData.Estado,
        PorcentajeTotal: mainData.PorcentajeTotal,
        FechaElaboracion: mainData.FechaElaboracion ? convertExcelDateToJSDate(mainData.FechaElaboracion) : new Date(currentYear, 0, 1),
        Comentario: mainData.Comentario,
        Estatus: mainData.Estatus,
        Objetivo: mainData.Objetivo,
        PuntuacionMaxima: mainData.PuntuacionMaxima,
        PuntuacionObten: '',
        PuntuacionConf: '',
        Programa: []
      };

      let programa = {
        Nombre: "", 
        Porcentaje: 0,
        Descripcion: []
      };

      const processedPrograms = new Set();

      jsonData.forEach(row => {
        // Añadir valores en `Auditados`
        if (row.Auditados) {
          if (!currentAudit.Auditados.includes(row.Auditados)) {
            currentAudit.Auditados.push(row.Auditados);
          }
        }

        if (row.Programa_Nombre && !processedPrograms.has(row.Programa_Nombre)) {
          // Añadir el programa anterior si existe
          if (programa.Nombre) {
            currentAudit.Programa.push(programa);
          }
          // Marcar el programa como procesado
          processedPrograms.add(row.Programa_Nombre);
          // Crear un nuevo programa
          programa = {
            Nombre: row.Programa_Nombre,
            Porcentaje: row.Programa_Porcentaje || 0,
            Descripcion: []
          };
        }

        // Añadir descripción al programa actual
        if (row.Programa_Nombre) {
          programa.Descripcion.push({
            ID: row.Programa_ID,
            Criterio: row.Programa_Criterio,
            Requisito: row.Programa_Descripcion_Requisito,
            Observacion: row.Programa_Observacion || row.Programa_problema || '', // Aquí se añade el campo Programa_problema
            Hallazgo: row.Programa_Hallazgo || '', // Valor por defecto
          });
        }

        // Procesar EquipoAuditor si está presente
        if (row.EquipoAuditor_Nombre && row.EquipoAuditor_Correo) {
          currentAudit.EquipoAuditor.push({
            Nombre: row.EquipoAuditor_Nombre,
            Correo: row.EquipoAuditor_Correo
          });
        }
      });

      // Añadir el último programa
      if (programa.Nombre) {
        currentAudit.Programa.push(programa);
      }

      const transformedData = [currentAudit];

      console.log('Datos transformados:', transformedData);

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/datos/carga-masiva`, transformedData, {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            overwrite: false // No permitir sobreescritura inicialmente
          }
        });

        console.log('Response:', response.data);
        Swal.fire({
          icon: 'success',
          title: 'Datos cargados exitosamente',
          text: 'Los datos han sido cargados correctamente'
        }).then(() => {
          setFile(null); // Limpiar el subidor de archivos
          window.location.reload(); // Recargar la página
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Datos ya existen',
            text: error.response.data.message,
            showCancelButton: true,
            confirmButtonText: 'Sobrescribir',
            cancelButtonText: 'Cancelar'
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                const overwriteResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/datos/carga-masiva`, transformedData, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  params: {
                    overwrite: true // Permitir sobreescritura
                  }
                });

                console.log('Response:', overwriteResponse.data);
                Swal.fire({
                  icon: 'success',
                  title: 'Datos sobrescritos exitosamente',
                  text: 'Los datos han sido sobrescritos correctamente'
                }).then(() => {
                  setFile(null); // Limpiar el subidor de archivos
                  window.location.reload(); // Recargar la página
                });
              } catch (overwriteError) {
                console.error('Error al sobrescribir los datos:', overwriteError);
                Swal.fire({
                  icon: 'error',
                  title: 'Error al sobrescribir los datos',
                  text: 'Hubo un problema al sobrescribir los datos'
                });
              }
            }
          });
        } else {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al cargar los datos',
            text: 'Hubo un problema al cargar los datos'
          });
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Navigation /> {/* Aquí se coloca la navegación */}
      <div className="mass-upload-container">
        <h2 className="mass-upload-heading">Carga Masiva de Datos desde Excel</h2>
        <form className="mass-upload-form" onSubmit={handleSubmit}>
          <input className="mass-upload-input" type="file" onChange={handleFileChange} />
          <button className="mass-upload-button" type="submit">Cargar Datos</button>
        </form>
      </div>
    </>
  );
};

export default CargaMasiva;
