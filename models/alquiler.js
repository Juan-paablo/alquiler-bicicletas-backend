const mongoose = require ("mongoose")
const alquilerSchema = mongoose.Schema({
    
    usuario: {
    nombre: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }
  },
    bicicleta:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bicicleta',
        required: true,
    },
    estacionSalida:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Estacion',
        required:true,
    },
    fechaInicio:{
        type:Date,
        required: true,
        default: Date.now
    },
    fechaFin:{
        type:Date
    },
    activo:{
        type: Boolean,
        default: true,
        required: true
    }
},{
    timestamps:true,
    versionKey:false,
    collection: 'alquileres'
})

alquilerSchema.index(
  { "usuario.correo": 1, activo: 1 },
  { unique: true, partialFilterExpression: { activo: true } }
);

exports.alquilerModel = mongoose.model('alquiler', alquilerSchema)


// Alquilar (auto-asignando bici disponible en la estación):
// {
//   "usuario": { "nombre": "Ana Pérez", "correo": "ana@test.com" },
//   "estacionSalida": "68be19b249ed4c99b23cb84c"
// }


// alquilar especificando bicicleta
// {
//   "usuario": { "nombre": "Luis", "correo": "luis@test.com" },
//   "estacionSalida": "68be19b249ed4c99b23cb84c",
//   "bicicleta": "68be2a...."   (debe estar 'disponible' y en esa estación)
// }

//devolver
// {
//   "alquilerId": "68be31cecd...",
//   "estacionDestino": "68be19bf49ed4c99b23cb84f"
// }
