const mongoose=require('mongoose')

const Invoice= new mongoose.Schema({
    date:{
        type:Date,
        required:true
    },
    number: {
        type: Number,
        required: true
    },
    amount:{
        type:Number,
        required: true
    },
    id:{
        type:String,
        required:true
    }
  
})
module.exports = mongoose.model("invoice", Invoice)