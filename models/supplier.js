// models/Supplier.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    location:{type: mongoose.Schema.Types.ObjectId, ref: "Location",required:true},
    name: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: false
    },
      phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
   
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
