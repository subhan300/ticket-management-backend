// controllers/videoController.js
const Video = require('../../models/guideVideosModel');

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({});
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVideo = async (req, res) => {
  const { title, description, keywords, videoUrl, type, companyIds, locationIds } = req.body;

  try {
    const video = await Video.create({
      title,
      description,
      keywords,
      videoUrl,
      type,
      companyIds,
      locationIds,
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  const { title, description, keywords, videoUrl, type, companyIds, locationIds } = req.body;

  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        keywords,
        videoUrl,
        type,
        companyIds,
        locationIds,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVideosByLocationIds = async (req, res) => {
    const { locationIds ,type,selectedLocation} = req.body;
  
    try {
       console.log("type==",type,"selcted locaton",locationIds)
      const videos = await Video.find({ type,locationIds: { $in: locationIds} });
      res.status(200).json(videos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };