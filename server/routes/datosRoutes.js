const express = require('express');
const router = express.Router();
const Datos = require('../models/datosSchema');
const datosController = require('../controllers/datosController');

// Ruta para el registro
router.post('/', datosController.nuevoAuditoria);
router.get('/', datosController.obtenerTodosDatos);

// Ruta para actualizar datos existentes
router.put('/:id', datosController.actualizarEstado);

router.put('/estado/:id', datosController.datosEstado);

router.post('/carga-masiva', async (req, res) => {
    const { overwrite } = req.query;
    let jsonData = req.body; // Asegúrate de que los datos estén en el cuerpo de la solicitud

    try {
        // Validación de que los datos sean un arreglo
        if (!Array.isArray(jsonData)) {
            return res.status(400).json({ error: 'Los datos proporcionados no son válidos. Se esperaba un arreglo de objetos.' });
        }

        // Asegúrate de que 'Programa' sea un array de objetos
        jsonData = jsonData.map(item => {
            if (typeof item.Programa === 'string') {
                item.Programa = JSON.parse(item.Programa);
            }
            return item;
        });

        // Validación de campos requeridos
        const requiredFields = ['TipoAuditoria', 'FechaInicio', 'FechaFin', 'Duracion', 'Departamento', 'AreasAudi', 'Auditados', 'AuditorLider', 'AuditorLiderEmail', 'Observador'];
        const missingFields = jsonData.filter(item => requiredFields.some(field => !item[field]));

        if (missingFields.length > 0) {
            console.error('Faltan campos requeridos:', missingFields);
            return res.status(400).json({ error: 'Por favor completa todos los campos requeridos en los datos del archivo' });
        }

        const existingData = await Datos.findOne({
            TipoAuditoria: jsonData[0].TipoAuditoria,
            FechaInicio: jsonData[0].FechaInicio,
            FechaFin: jsonData[0].FechaFin,
            Departamento: jsonData[0].Departamento
        });

        if (existingData && overwrite !== 'true') {
            return res.status(409).json({ message: 'Datos ya existen. ¿Desea sobrescribir?' });
        }

        if (existingData && overwrite === 'true') {
            await Datos.findByIdAndUpdate(existingData._id, jsonData[0]);
            return res.status(200).json({ success: true, message: 'Datos sobrescritos exitosamente' });
        }

        // Guardar los datos en la base de datos
        const savedData = await Datos.create(jsonData);
        console.log('Datos guardados en la base de datos:', savedData);

        res.status(200).json({ success: true, data: savedData });
    } catch (error) {
        console.error('Error al procesar la carga masiva:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
