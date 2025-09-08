const express = require('express')
const { getEstaciones, getEstacionById, createEstacion, updateEstacion, deleteEstacion } = require('../controllers/estaciones.controller')
const { getBicicletas, getBicicletaById, createBicicleta, updateBicicleta, deleteBicicleta } = require('../controllers/bicicletas.controller')
const { getAlquileres, getAlquilerById, alquilar, devolver } = require('../controllers/alquiler.controller')
const router = express.Router()

router.get('/estaciones', getEstaciones )
router.get('/estacion/:id', getEstacionById )
router.post('/createEstacion', createEstacion )
router.put('/updateEstacion/:id', updateEstacion )
router.delete ('/deleteEstacion/:id', deleteEstacion)

router.get('/bicicletas', getBicicletas)
router.get('/bicicleta/:id', getBicicletaById )
router.post('/createBicicleta', createBicicleta )
router.put('/updateBicicleta/:id', updateBicicleta )
router.delete ('/deleteBicicleta/:id', deleteBicicleta)

router.get('/alquileres', getAlquileres);
router.get('/alquileres/:id', getAlquilerById);
router.post('/alquilar', alquilar);
router.post('/devolver', devolver);

module.exports =router; 