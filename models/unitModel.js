// unit.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Unit schema
const UnitSchema = new Schema({
    name: {
        type: String,
        required: true
    },
   
    rooms: {type:Array},
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
});

// Create and export the Unit model
module.exports = mongoose.model('Unit', UnitSchema);
