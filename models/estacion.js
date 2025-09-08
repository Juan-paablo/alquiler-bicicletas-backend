const mongoose = require ("mongoose")
const estacionSchema = mongoose.Schema({
    nombre:{
       type: String,
       required: true,
       trim:true,
       unique: true
    },
    lat:{
        type:Number,
        required:true,
        min:-90,
        max:90
    },
    lng:{
        type:Number,
        required:true,
        min:-180,
        max:180
    },
    capacidad:{
        type:Number, 
        required: true,
        min:0
    }
},{
    timestamps:true,
    versionKey:false,
    collection: 'estacions'
})

exports.estacionModel = mongoose.model('Estacion', estacionSchema)