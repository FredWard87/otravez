const Datos = require('../models/datosSchema');
const transporter = require('../emailconfig');

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

    const nombresEquipoAuditor = EquipoAuditor.map(auditor => auditor.Nombre).join(', ');

    // Enviar correo electrónico al Auditor Líder
    const mailOptionsAuditorLider = {
      from: process.env.EMAIL_USER,
      to: AuditorLiderEmail,
      subject: 'Tienes una nueva auditoría',
      text: `Hola ${AuditorLider},\n\nSe te ha asignado como auditor líder para una nueva auditoría programada ${Duracion}.
      \nLos miembros del equipo auditor son: ${nombresEquipoAuditor}\n\nSaludos,\nEl equipo de la empresa`,
    };

    transporter.sendMail(mailOptionsAuditorLider, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico al Auditor Líder:', error);
      } else {
        console.log('Correo electrónico enviado al Auditor Líder:', info.response);
        // Después de enviar el correo al Auditor Líder, enviar correos electrónicos a los miembros del equipo auditor
        enviarCorreosMiembrosEquipoAuditor(EquipoAuditor, () => {
          // Después de enviar a los miembros del equipo auditor, enviar correos a los auditados
          enviarCorreosAuditados(Auditados);
        });
      }
    });

    // Función para enviar correos electrónicos a los miembros del equipo auditor de manera escalonada
    const enviarCorreosMiembrosEquipoAuditor = (equipoAuditor, callback) => {
      let correosEnviados = 0;
      equipoAuditor.forEach((miembro, index) => {
        setTimeout(() => {
          const mailOptionsMiembro = {
            from: process.env.EMAIL_USER,
            to: miembro.Correo,
            subject: 'Tienes una nueva auditoría',
            text: `Hola ${miembro.Nombre},\n\nSe te ha asignado como miembro del equipo auditor liderado por ${AuditorLider} para una nueva auditoría programada para ${Duracion}.\n\nSaludos,\nEl equipo de la empresa`,
          };

          transporter.sendMail(mailOptionsMiembro, (error, info) => {
            if (error) {
              console.error('Error al enviar el correo electrónico al miembro del equipo auditor:', error);
            } else {
              console.log('Correo electrónico enviado al miembro del equipo auditor:', info.response);
            }

            // Incrementa el contador de correos enviados
            correosEnviados++;
            // Verifica si todos los correos han sido enviados
            if (correosEnviados === equipoAuditor.length) {
              callback(); // Llama al callback después de enviar todos los correos
            }
          });
        }, index * 1000); // Ajusta el intervalo de tiempo según sea necesario (en milisegundos)
      });
    };

    // Función para enviar correos electrónicos a los auditados
    const enviarCorreosAuditados = (Auditados) => {
      Auditados.forEach((aud, index) => {
        setTimeout(() => {
          const mailOptionsAuditado = {
            from: process.env.EMAIL_USER,
            to: aud.Correo,
            subject: 'Tienes una nueva auditoría',
            text: `Hola ${aud.Nombre},\n\nSe te ha programado una auditoría liderada por ${AuditorLider} que se llevará a cabo ${Duracion}.\n\nSaludos,\nEl equipo de la empresa`,
          };

          transporter.sendMail(mailOptionsAuditado, (error, info) => {
            if (error) {
              console.error('Error al enviar el correo electrónico al auditado:', error);
            } else {
              console.log('Correo electrónico enviado al auditado:', info.response);
            }
          });
        }, index * 1000);
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

const actualizarEstado = async (req, res)=> {
  const { id } = req.params;
    const { programIdx, observaciones, percentage, usuario, PorcentajeTotal, Estado } = req.body;
    try {
      console.log('Payload recibido:', req.body);
        const datos = await Datos.findById(id);
        if (!datos) {
            return res.status(404).json({ error: 'Datos no encontrados' });
        }

        if (PorcentajeTotal !== undefined) {
            datos.PorcentajeTotal = PorcentajeTotal;
            datos.Estado = Estado;  // Actualiza el estado a "Devuelto"

            // Actualizar Estatus basado en PorcentajeTotal
            if (PorcentajeTotal === 100) {
                datos.Estatus = 'Bueno';
            } else if (PorcentajeTotal >= 90) {
                datos.Estatus = 'Bueno';
            } else if (PorcentajeTotal >= 80) {
                datos.Estatus = 'Aceptable';
            } else if (PorcentajeTotal >= 60) {
                datos.Estatus = 'No Aceptable';
            } else if (PorcentajeTotal < 60) {
                datos.Estatus = 'Crítico';
            }

            // Actualizar FechaElaboracion con la fecha actual
            datos.FechaElaboracion = new Date().toISOString();
        } else {
            const programa = datos.Programa[programIdx];
            if (!programa) {
                return res.status(404).json({ error: 'Programa no encontrado' });
            }

            // Actualiza las observaciones
            observaciones.forEach((obs) => {
                const descripcion = programa.Descripcion.find((desc) => desc.ID === obs.ID);
                if (descripcion) {
                    descripcion.Criterio = obs.Criterio; // Agrega esta línea para actualizar el Criterio
                    descripcion.Observacion = obs.Observacion;
                    descripcion.Hallazgo = obs.Hallazgo;
                }
            });

            // Actualiza el porcentaje del programa
            programa.Porcentaje = percentage.toFixed(2);

            // Calcular el porcentaje total
            const totalPorcentaje = datos.Programa.reduce((acc, prog) => acc + parseFloat(prog.Porcentaje), 0);
            datos.PorcentajeTotal = (totalPorcentaje / datos.Programa.length).toFixed(2);
        }
        await datos.save();

        // Enviar correo electrónico al Auditor Líder
    const mailOptionsAuditor = {
      from: process.env.EMAIL_USER,
      to: 'soleje28062004@gmail.com',
      subject: 'Se ha enviado una auditoria para revisión',
      text: `${usuario} ha enviado una auditoria para su revisión`,
    };

    transporter.sendMail(mailOptionsAuditor, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico al Audministrador:', error);
      } else {
        console.log('Correo electrónico enviado al Administrador:', info.response);
      }
    });

        res.status(200).json({ message: 'Datos actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los datos:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
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

const datosEstado = async (req, res)=>{
  const { id } = req.params;
    const { Estado,AuditorLiderEmail, Comentario, PorcentajeCump, PuntuacionObten, PuntuacionConf, Estatus, PorcentajeTotal} = req.body; 
    console.log(req.body);
    try {
      console.log('Payload recibido:', req.body);
        const datos = await Datos.findById(id);
        if (!datos) {
            return res.status(404).json({ error: 'Datos no encontrados' });
        }

        // Actualizar el estado, el comentario y el porcentaje de cumplimiento si están presentes
        datos.Estado = Estado;
        if (Comentario) {
            datos.Comentario = Comentario;
        }
        if (PorcentajeCump) {
            datos.PorcentajeCump = PorcentajeCump;
        }
        if (PuntuacionObten) {
            datos.PuntuacionObten = PuntuacionObten;
        }
        if (PuntuacionConf) {
            datos.PuntuacionConf = PuntuacionConf;
        }
        if (Estatus) {
            datos.Estatus = Estatus;
        }
        if (PorcentajeTotal) {
            datos.PorcentajeTotal = PorcentajeTotal;
        }

        await datos.save();

        let estadoEmail = Estado;
        let comentario = Comentario;

        if (Estado === 'Devuelto') {
              estadoEmail = 'rechazado';
        }
        if (Estado === 'Terminada') {
          estadoEmail = 'aprobado';
          comentario = '';
        }

         // Enviar correo electrónico al Auditor Líder
    const mailOptionsAdministrador = {
      from: process.env.EMAIL_USER,
      to: AuditorLiderEmail,
      subject: 'La auditoria se ha '+estadoEmail,
      text: `La auditoría se ha ${estadoEmail}\n${comentario}`,
    };

    transporter.sendMail(mailOptionsAdministrador, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico al Auditor:', error);
      } else {
        console.log('Correo electrónico enviado al Auditor:', info.response);
      }
    });

        res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

module.exports = {
  nuevoAuditoria,
  obtenerTodosDatos,
  cargaMasiva,
  actualizarEstado,
  datosEstado
};