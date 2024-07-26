const Datos = require('../models/datosSchema');
const transporter = require('../emailConfig');

const nuevoAuditoria = async (req, res) => {
  try {
    console.log('Payload recibido:', req.body);

    const {
      TipoAuditoria,
      FechaInicio,
      FechaFin,
      Duracion,
      Departamento,
      AreasAudi,
      Auditados,
      AuditorLider,
      AuditorLiderEmail,
      EquipoAuditor,
      Observador,
      NombresObservadores,
      Programa,
      Estado,
      PorcentajeTotal,
      FechaElaboracion,
      Comentario,
      Estatus
    } = req.body;

    // Crear una nueva auditoría
    const nuevaAuditoria = new Datos({
      TipoAuditoria,
      FechaInicio,
      FechaFin,
      Duracion,
      Departamento,
      AreasAudi,
      Auditados,
      AuditorLider,
      AuditorLiderEmail,
      EquipoAuditor,
      Observador,
      NombresObservadores,
      Programa,
      Estado,
      PorcentajeTotal,
      FechaElaboracion,
      Comentario,
      Estatus
    });

    await nuevaAuditoria.save();

    // Enviar correo electrónico al Auditor Líder
    const mailOptionsAuditorLider = {
      from: process.env.EMAIL_USER,
      to: AuditorLiderEmail,
      subject: 'Tienes una nueva auditoría',
      text: `Hola ${AuditorLider},\n\nSe te ha asignado como auditor líder para una nueva auditoría programada por ${Duracion}.\n\nSaludos,\nEl equipo de la empresa`,
    };

    transporter.sendMail(mailOptionsAuditorLider, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico al Auditor Líder:', error);
      } else {
        console.log('Correo electrónico enviado al Auditor Líder:', info.response);
        // Después de enviar el correo al Auditor Líder, enviar correos electrónicos a los miembros del equipo auditor
        enviarCorreosMiembrosEquipoAuditor(EquipoAuditor);
      }
    });

    // Función para enviar correos electrónicos a los miembros del equipo auditor de manera escalonada
    const enviarCorreosMiembrosEquipoAuditor = (equipoAuditor) => {
      equipoAuditor.forEach((miembro, index) => {
        setTimeout(() => {
          const mailOptionsMiembro = {
            from: process.env.EMAIL_USER,
            to: miembro.Correo,
            subject: 'Tienes una nueva auditoría',
            text: `Hola ${miembro.Nombre},\n\nSe te ha asignado como miembro del equipo auditor liderado por ${AuditorLider} para una nueva auditoría programada ${Duracion}.\n\nSaludos,\nEl equipo de la empresa`,
          };

          transporter.sendMail(mailOptionsMiembro, (error, info) => {
            if (error) {
              console.error('Error al enviar el correo electrónico al miembro del equipo auditor:', error);
            } else {
              console.log('Correo electrónico enviado al miembro del equipo auditor:', info.response);
            }
          });
        }, index * 1000); // Ajusta el intervalo de tiempo según sea necesario (en milisegundos)
      });
    };

    res.status(201).json({ message: 'Auditoría generada exitosamente' });
  } catch (error) {
    console.error('Error al generar auditoría:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Error de validación', details: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }
};

const obtenerTodosDatos = async (req, res) => {
  try {
    const datos = await Datos.find();
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

// Carga masiva de auditorías desde un archivo Excel
const cargaMasiva = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const auditorias = data.map(row => ({
      TipoAuditoria: row['TipoAuditoria'],
      FechaInicio: row['FechaInicio'],
      FechaFin: row['FechaFin'],
      Duracion: row['Duracion'],
      Departamento: row['Departamento'],
      AreasAudi: row['AreasAudi'],
      Auditados: row['Auditados'],
      AuditorLider: row['AuditorLider'],
      AuditorLiderEmail: row['AuditorLiderEmail'],
      EquipoAuditor: row['EquipoAuditor'] ? JSON.parse(row['EquipoAuditor']) : [],
      Observador: row['Observador'],
      NombresObservadores: row['NombresObservadores'],
      Programa: row['Programa'] ? JSON.parse(row['Programa']) : [],
      Estado: row['Estado'],
      PorcentajeTotal: row['PorcentajeTotal'],
      FechaElaboracion: row['FechaElaboracion'],
      Comentario: row['Comentario'],
      Estatus: row['Estatus']
    }));

    await Datos.insertMany(auditorias);

    res.status(201).json({ message: 'Datos cargados exitosamente' });
  } catch (error) {
    console.error('Error al cargar datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  nuevoAuditoria,
  obtenerTodosDatos,
  cargaMasiva
};