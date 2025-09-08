const mongoose = require('mongoose');
const { bicicletasModel } = require('../models/bicicletas'); 
const { estacionModel }   = require('../models/estacion');

const ESTADOS = ['disponible', 'en_uso', 'mantenimiento'];

exports.getBicicletas = async (req, res) => {
  try {
    const { estado } = req.query;
    const filter = {};
    if (estado) filter.estado = estado; 
    const data = await bicicletasModel
      .find(filter)
      .populate('estacion', 'nombre') 
      .lean();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: 'Error listando bicicletas' });
  }
};

exports.getBicicletaById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Id inválido' });
    const bici = await bicicletasModel.findById(id).populate('estacion', 'nombre').lean();
    if (!bici) return res.status(404).json({ message: 'Bicicleta no encontrada' });
    res.json(bici);
  } catch (e) {
    res.status(500).json({ message: 'Error obteniendo bicicleta' });
  }
};

exports.createBicicleta = async (req, res) => {
  try {
    let { serial, estado, estacion } = req.body;
    if (serial) serial = String(serial).trim().toUpperCase();
    if (estado && !ESTADOS.includes(estado))
      return res.status(400).json({ message: 'Estado inválido', allowed: ESTADOS });
    if (!mongoose.Types.ObjectId.isValid(estacion))
      return res.status(400).json({ message: 'Id de estación inválido' });
    const existeEstacion = await estacionModel.exists({ _id: estacion });
    if (!existeEstacion) return res.status(404).json({ message: 'Estación no encontrada' });
    const bici = await bicicletasModel.create({ serial, estado, estacion });
    res.status(201).json(bici);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'El serial ya existe', field: 'serial' });
    }
    if (e.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        details: Object.values(e.errors).map(err => err.message),
      });
    }
    res.status(500).json({ message: 'Error creando bicicleta' });
  }
};

exports.updateBicicleta = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Id inválido' });
    const data = { ...req.body };
    if (data.serial) data.serial = String(data.serial).trim().toUpperCase();
    if (data.estado && !ESTADOS.includes(data.estado))
      return res.status(400).json({ message: 'Estado inválido', allowed: ESTADOS });
    if (data.estacion) {
      if (!mongoose.Types.ObjectId.isValid(data.estacion))
        return res.status(400).json({ message: 'Id de estación inválido' });

      const existeEstacion = await estacionModel.exists({ _id: data.estacion });
      if (!existeEstacion) return res.status(404).json({ message: 'Estación no encontrada' });
    }
    const bici = await bicicletasModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!bici) return res.status(404).json({ message: 'Bicicleta no encontrada' });
    res.json(bici);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'El serial ya existe', field: 'serial' });
    }
    res.status(500).json({ message: 'Error actualizando bicicleta' });
  }
};

exports.deleteBicicleta = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Id inválido' });
    const borrada = await bicicletasModel.findByIdAndDelete(id);
    if (!borrada) return res.status(404).json({ message: 'Bicicleta no encontrada' });
    res.json(borrada);
  } catch (e) {
    res.status(500).json({ message: 'Error eliminando bicicleta' });
  }
};
