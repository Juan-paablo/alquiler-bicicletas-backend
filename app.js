require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const router = require('./routes/router');
app.use('/api', router); 

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Mongo_Atlas conectado');
    app.listen(3000, () => console.log('Servidor conectado en 3000'));
  })
  .catch(err => console.error('Error al conectarse a Mongo_Atlas', err));

