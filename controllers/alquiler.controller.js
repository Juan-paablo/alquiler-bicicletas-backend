const mongoose = require('mongoose');
const { estacionModel } = require('../models/estacion');
const { bicicletasModel } = require('../models/bicicletas');
const { alquilerModel } = require('../models/alquiler');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---- Públicos / admin ----
exports.getAlquileres = async (req, res) => {
  try {
    const filtro = {};
    if (typeof req.query.activo !== 'undefined') {
      filtro.activo = req.query.activo === 'true';
    }
    const data = await alquilerModel
      .find(filtro)
      .populate('bicicleta', 'serial estado')
      .populate('estacionSalida', 'nombre')
      .sort({ createdAt: -1 })
      .lean();
    res.json(data);
  } catch (error) {
    console.error('[getAlquileres]', error);
    res.status(500).json({ message: 'Error listando alquileres' });
  }
};

exports.getAlquilerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Id inválido' });

    const data = await alquilerModel
      .findById(id)
      .populate('bicicleta', 'serial estado')
      .populate('estacionSalida', 'nombre')
      .lean();

    if (!data) return res.status(404).json({ message: 'Alquiler no encontrado' });
    res.json(data);
  } catch (error) {
    console.error('[getAlquilerById]', error);
    res.status(500).json({ message: 'Error obteniendo alquiler' });
  }
};

// ---- NUEVO: mis alquileres (requiere auth) ----
exports.getMisAlquileres = async (req, res) => {
  try {
    const correo = req.userEmail;
    if (!correo) return res.status(401).json({ message: 'No autenticado' });

    const data = await alquilerModel
      .find({ 'usuario.correo': correo })
      .populate('bicicleta', 'serial estado')
      .populate('estacionSalida', 'nombre')
      .sort({ createdAt: -1 })
      .lean();

    res.json(data);
  } catch (error) {
    console.error('[getMisAlquileres]', error);
    res.status(500).json({ message: 'Error listando mis alquileres' });
  }
};

// ---- Crear alquiler (requiere auth) ----
exports.alquilar = async (req, res) => {
  const { estacionSalida, bicicleta } = req.body || {};

  try {
    // Usuario autenticado (del token)
    const usuario = {
      nombre: req.userNombre,
      correo: req.userEmail,
    };
    if (!usuario.nombre || !usuario.correo) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!isValidId(estacionSalida)) {
      return res.status(400).json({ message: 'Id de estación inválido.' });
    }

    const est = await estacionModel.findById(estacionSalida).lean();
    if (!est) return res.status(404).json({ message: 'Estación de salida no encontrada.' });

    const yaActivo = await alquilerModel
      .findOne({ 'usuario.correo': usuario.correo, activo: true })
      .lean();

    if (yaActivo) {
      return res.status(409).json({ message: 'El usuario ya tiene un alquiler activo.' });
    }

    let bici;
    if (bicicleta) {
      if (!isValidId(bicicleta)) return res.status(400).json({ message: 'Id de bicicleta inválido.' });
      bici = await bicicletasModel.findById(bicicleta);
      if (!bici) return res.status(404).json({ message: 'Bicicleta no encontrada.' });
      if (String(bici.estacion) !== String(est._id)) {
        return res.status(409).json({ message: 'La bicicleta no está en la estación indicada.' });
      }
      if (bici.estado !== 'disponible') {
        return res.status(409).json({ message: 'La bicicleta no está disponible.' });
      }
    } else {
      bici = await bicicletasModel.findOne({
        estacion: est._id,
        estado: 'disponible',
      });
      if (!bici) {
        return res.status(409).json({ message: 'No hay bicicletas disponibles en esta estación.' });
      }
    }

    const alquiler = await alquilerModel.create({
      usuario: { nombre: usuario.nombre, correo: usuario.correo },
      bicicleta: bici._id,
      estacionSalida: est._id,
      fechaInicio: new Date(),
      fechaFin: null,
      activo: true,
    });

    bici.estado = 'en_uso';
    bici.estacion = null;
    await bici.save();

    return res.status(201).json(alquiler);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'El usuario ya tiene un alquiler activo.' });
    }
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        details: Object.values(error.errors).map((e) => e.message),
      });
    }
    console.error('[alquilar]', error);
    return res.status(500).json({ message: 'Error creando alquiler' });
  }
};

// ---- Devolver (requiere auth) ----
exports.devolver = async (req, res) => {
  const { alquilerId, estacionDestino } = req.body || {};

  try {
    if (!isValidId(alquilerId) || !isValidId(estacionDestino)) {
      return res.status(400).json({ message: 'Id inválido.' });
    }

    const alquiler = await alquilerModel.findById(alquilerId);
    if (!alquiler || !alquiler.activo) {
      return res.status(404).json({ message: 'Alquiler activo no encontrado.' });
    }

    // Asegurar que el alquiler pertenece al usuario autenticado
    if (alquiler.usuario?.correo !== req.userEmail) {
      return res.status(403).json({ message: 'No puedes devolver un alquiler de otro usuario.' });
    }

    const estDest = await estacionModel.findById(estacionDestino).lean();
    if (!estDest) return res.status(404).json({ message: 'Estación destino no encontrada.' });

    const ocupadas = await bicicletasModel.countDocuments({
      estacion: estDest._id,
      estado: { $ne: 'en_uso' },
    });

    if (ocupadas >= estDest.capacidad) {
      return res.status(409).json({ message: 'La estación destino está llena.' });
    }

    const bici = await bicicletasModel.findById(alquiler.bicicleta);
    if (!bici) return res.status(404).json({ message: 'Bicicleta del alquiler no existe.' });

    bici.estacion = estDest._id;
    bici.estado = 'disponible';
    await bici.save();

    alquiler.activo = false;
    alquiler.fechaFin = new Date();
    await alquiler.save();

    return res.json({ message: 'Devolución realizada', alquilerId: alquiler._id });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        details: Object.values(error.errors).map((e) => e.message),
      });
    }
    console.error('[devolver]', error);
    return res.status(500).json({ message: 'Error devolviendo bicicleta' });
  }
};
