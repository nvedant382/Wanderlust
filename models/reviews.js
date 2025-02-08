const mongoose = require('mongoose')
const {Schema} = mongoose

const reviewSchema = new Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    createdAt:{
        type:Date,
        default:new Date(Date.now())
    },
    author:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
})

// Exporting Model
module.exports = mongoose.model("Review",reviewSchema)