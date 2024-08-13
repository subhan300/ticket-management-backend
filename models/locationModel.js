// unit.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Unit schema
const LocationSchema = new Schema({
     SKU:{type:String,required:true},
    locationName:{type:String,required:true},
    unit: {
        type: Schema.Types.ObjectId,
        required: true
    },
   
    room: {type:String,required:true},
    companyId: {
        type: Schema.Types.ObjectId,
    ref: 'Company',
        required: true
    }
});

// Create and export the Unit model
module.exports = mongoose.model('Location', LocationSchema);
