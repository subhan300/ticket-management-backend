// models/videoModel.js
const mongoose = require('mongoose');

const guideVideosSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['generic', 'software', 'propertyMaintenance'],
    required: true,
  },
  companyIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Company',
    required: false,
  },
  locationIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Location',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const guideVideos = mongoose.model('guideVideos', guideVideosSchema);

module.exports = guideVideos;