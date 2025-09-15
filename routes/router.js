const express = require('express');
const router = express.Router();

const {
  getEstaciones, getEstacionById, createEstacion, updateEstacion, deleteEstacion
} = require('../controllers/estaciones.controller');

const {
  getBicicletas, getBicicletaById, createBicicleta, updateBicicleta, deleteBicicleta
} = require('../controllers/bicicletas.controller');

const {
  getAlquileres, getAlquilerById, alquilar, devolver
} = require('../controllers/alquiler.controller');

const { register, login, me } = require('../controllers/auth.controller');
const auth = require('../middleware/auth'); // <-- este exporta una FUNCIÓN

// -------- AUTH --------
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', auth, me); // <-- usa 'auth', no 'verifyToken'

// -------- ESTACIONES --------
router.get('/estaciones', getEstaciones);
router.get('/estacion/:id', getEstacionById);
router.post('/createEstacion', createEstacion);
router.put('/updateEstacion/:id', updateEstacion);
router.delete('/deleteEstacion/:id', deleteEstacion);

// -------- BICICLETAS --------
router.get('/bicicletas', getBicicletas);
router.get('/bicicleta/:id', getBicicletaById);
router.post('/createBicicleta', createBicicleta);
router.put('/updateBicicleta/:id', updateBicicleta);
router.delete('/deleteBicicleta/:id', deleteBicicleta);

// -------- ALQUILERES --------
router.get('/alquileres', getAlquileres);
router.get('/alquileres/:id', getAlquilerById);
router.post('/alquilar', auth, alquilar);
router.post('/devolver', auth, devolver);

module.exports = router;
