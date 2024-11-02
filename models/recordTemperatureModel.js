const mongoose = require("mongoose");

const recordTemperatureSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  isSensorIntegrated:{type:String,default:false},
  readings: [
    {
      category: {type:String, default: "room" },
      battery: {type:String, },
      date: {
        type: Date,
        default: Date.now,
      },
      
      temperature: {
        type: Number,
        required: true,
      },
       
      humidity: {
        type: Number,
        // required: true,
      },
    },
  ],
});

const Temperature = mongoose.model(
  "RecordTemperature",
  recordTemperatureSchema
);

module.exports = Temperature;
