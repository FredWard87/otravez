const Programas = require('../models/programaSchema');
const XLSX = require('xlsx');

// Obtener todos los programas
const obtenerProgramas = async (req, res) => {
  try {
    const programas = await Programas.find();
    res.status(200).json(programas);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo programa
const crearPrograma = async (req, res) => {
  try {
    const { Nombre, Descripcion } = req.body;
    const nuevoPrograma = new Programas({ Nombre, Descripcion });
    await nuevoPrograma.save();
    res.status(201).json(nuevoPrograma);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Carga masiva de programas desde un archivo Excel
const cargaMasiva = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const programas = [];
    let nombreProgramaActual = null;
    let descripciones = [];
    const erroresDuplicados = [];

    for (const row of data) {
      console.log(row); // Añadir este log para depurar el valor de row
      // Verificar si es una fila con el nombre del programa
      if (row['Nombre del Programa']) {
        // Si encontramos un nuevo nombre de programa, almacenamos las descripciones del programa anterior
        if (nombreProgramaActual) {
          // Verificar si el programa ya existe en la base de datos
          const programaExistente = await Programas.findOne({ Nombre: nombreProgramaActual });
          if (!programaExistente) {
            programas.push({ Nombre: nombreProgramaActual, Descripcion: descripciones });
          } else {
            erroresDuplicados.push(nombreProgramaActual);
            console.warn(`El programa ${nombreProgramaActual} ya existe y no será añadido.`);
          }
          descripciones = []; // Reiniciar descripciones para el nuevo programa
        }
        nombreProgramaActual = row['Nombre del Programa']; // Actualizar el nombre del programa actual
      }

      // Agregar la descripción con el ID proporcionado
      if (row['Descripción del Requisito'] && row['ID']) {
        descripciones.push({
          ID: row['ID'].toString().trim(), // Convertir el ID a cadena
          Requisito: row['Descripción del Requisito'].trim()
        });
      } else if (row['Descripción del Requisito']) {
        console.error(`ID no está presente o no es una cadena: ${row.ID}`);
      }
    }

    // Agregar el último grupo de descripciones (si existe)
    if (nombreProgramaActual) {
      const programaExistente = await Programas.findOne({ Nombre: nombreProgramaActual });
      if (!programaExistente) {
        programas.push({ Nombre: nombreProgramaActual, Descripcion: descripciones });
      } else {
        erroresDuplicados.push(nombreProgramaActual);
        console.warn(`El programa ${nombreProgramaActual} ya existe y no será añadido.`);
      }
    }

    // Verificar el contenido de programas antes de insertarlo
    console.log(JSON.stringify(programas, null, 2));

    // Insertar los programas en la base de datos
    if (programas.length > 0) {
      await Programas.insertMany(programas);
    }

    if (erroresDuplicados.length > 0) {
      return res.status(400).json({
        message: 'Algunos programas ya existen y no fueron añadidos.',
        duplicados: erroresDuplicados
      });
    }

    res.status(201).json({ message: 'Programas cargados exitosamente' });
  } catch (error) {
    console.error('Error al cargar programas:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

// Obtener un programa por su ID
const obtenerProgramaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const programa = await Programas.findById(id);
    if (!programa) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    res.status(200).json(programa);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un programa por su ID
const actualizarProgramaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Descripcion } = req.body;
    const programaActualizado = await Programas.findByIdAndUpdate(id, { Nombre, Descripcion }, { new: true });

    if (!programaActualizado) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }

    res.status(200).json(programaActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Exportar todos los controladores
module.exports = {
  obtenerProgramas,
  crearPrograma,
  cargaMasiva,
  obtenerProgramaPorId,
  actualizarProgramaPorId,
};