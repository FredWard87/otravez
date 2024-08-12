const Areas = require('../models/areasSchema');

const obtenerAreas = async (req, res) => {
  try {
    const areas = await Areas.find();
    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const nuevaArea = async (req, res) => {
  try {
    const { departamento, areas } = req.body;

    const nuevaArea = new Areas({
      departamento,
      areas
    });

    await nuevaArea.save();

    res.status(201).json(nuevaArea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { departamento, areas } = req.body;

    const areaActualizada = await Areas.findByIdAndUpdate(
      id,
      { departamento, areas },
      { new: true }
    );

    if (!areaActualizada) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    res.status(200).json(areaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarArea = async (req, res) => {
  try {
    const { id } = req.params;

    const areaEliminada = await Areas.findByIdAndDelete(id);

    if (!areaEliminada) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    res.status(200).json({ message: 'Área eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerAreas,
  nuevaArea,
  actualizarArea,
  eliminarArea
};