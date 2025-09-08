const { estacionModel } = require("../models/estacion");
const mongoose = require ('mongoose')

exports.getEstaciones = async (req,res)=>{
    try {
        let estaciones = await estacionModel.find().sort({ nombre : 1}).lean();
        res.json(estaciones)
    } catch (error) {
        res.status(500).json({ message: 'Error listando las estaciones'})
    }
};

exports.getEstacionById = async (req,res) => {
    
    try {
        const { id } = req.params;
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Id inválido' });
        }
        const estacion = await estacionModel.findById(id).lean();
        if (!estacion) return res.status(404).json({ message: 'Id NO encontrada' });
        res.json(estacion);
        }
        
     catch (error) {
        res.status(500).json({menssage:'Error obteniendo estacion'})
    }};


exports.createEstacion = async (req, res) => {
  try {
    
    const { nombre, lat, lng, capacidad } = req.body;
    const doc = await estacionModel.create({
      nombre: typeof nombre === 'string' ? nombre.trim() : nombre,
      lat, lng, capacidad
    });
    return res.status(201).json(doc);

  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'El nombre de la estación ya existe',
        field: 'nombre'
      });
    }
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    console.error(error);
    return res.status(500).json({ message: 'Error creando estación' });
  }
};



exports.updateEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id inválido' });
    }
    const cambios = req.body;
    const actualizada = await estacionModel.findByIdAndUpdate(
      id,
      { $set: cambios },
      {
        new: true,
        runValidators: true, 
        context: 'query'  
      }
    );
    if (!actualizada) {
      return res.status(404).json({ message: 'Estación no encontrada' });
    }
    return res.status(200).json(actualizada);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: 'El nombre de la estación ya existe',
        field: Object.keys(err.keyPattern || { nombre: 1 })[0]
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    console.error('[updateEstacion]', err);
    return res.status(500).json({ message: 'Error actualizando estación' });
  }
};

exports.deleteEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id inválido' });
    }
    const eliminado = await estacionModel.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ message: 'Estación no encontrada' });
    }
    return res.status(200).json(eliminado);
  } catch (error) {
    return res.status(500).json({ message: 'Error eliminando estación' });
  }
};