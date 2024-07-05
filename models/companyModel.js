// company.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Company schema
const CompanySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    units: [{
        type: Schema.Types.ObjectId,
        ref: 'Unit'
    }]
});

// Create and export the Company model
module.exports = mongoose.model('Company', CompanySchema);
