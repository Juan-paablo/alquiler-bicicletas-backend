const mongoose = require ("mongoose")
let estados = ['disponible', 'en_uso', 'mantenimiento'];
const bicicletasSchema = mongoose.Schema({
    serial:{
       type: String,
       required: true,
       trim:true,
       unique: true
    },
    estado:{
        type: String,
        enum: estados,
        default: 'disponible',
    },
    estacion:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Estacion',
        required:true,
    }
},{
    timestamps:true,
    versionKey:false,
})

exports.bicicletasModel = mongoose.model('Bicicleta', bicicletasSchema)