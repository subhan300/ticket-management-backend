const Location = require('../../models/locationModel');

// Create a new location
const createLocation = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { locationName } = req.body;

        // Check if a location with the same SKU already exists for the company
        const existingLocation = await Location.findOne({ locationName, companyId });

        if (existingLocation) {
            return res.status(400).json({ error: `Duplicate Location. A location with this ${locationName} already exists.` });
        }

        // Create a new location
        const location = new Location({ ...req.body, companyId: companyId });
        await location.save();

        res.status(201).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all locations
const getLocations = async (req, res) => {
    try {
        const {companyId}=req.user
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getLocationsByIds = async (req, res) => {
    try {
        const {locations}=req.user
        // const locationsIds = req.body;
        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({ error: "Invalid or empty IDs array." });
        }
        const getLocations = await Location.find({ _id: { $in: locations } ,softDelete: { $ne: true }});
        if (!getLocations.length) {
            return res.status(404).json({ message: "No locations found for the provided IDs." });
        }

        res.status(200).json(getLocations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single location by ID
const getLocationById = async (req, res) => {
    try {
        const {SKU}=req.params
        const location = await Location.findOne({ SKU });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a location by ID
const updateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateAll = async (req, res) => { 
    try {
      const location = "674f48a5d4903325eec6b58a"; // Example location ID
      const updateData = {
        $set: {
          settings: {
            unitName: "Unit-Name-Floor-Info", // Hardcoded Unit Name and Floor Info
            roomName: "Unit-Room-Number-Info", // Hardcoded Room Name and Number Info
            scanOption: "SKU" // Hardcoded Scan Option
          }
        }
      };
  
      // Perform the update operation for all records with the given location ID
      const result = await Location.updateMany(
        { _id: location }, // Filter by location
        updateData // The update action to apply
      );
  
    //   res.status(200).json({ message: 'Records updated successfully' });
    } catch (error) {
      console.error("Error updating temperature readings:", error);
    //   res.status(500).json({ message: "Internal server error" });
    }
  };
// updateAll()  
// Delete a location by ID
const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getLocationSettings= async (req,res) => {

    try {
      const {locations}=req.user
      const getLocations=await Location.find({_id:locations})
      return res.status(200).send(getLocations)
    } catch (error) {
      console.error('Error fetching managers:', error);
      res.status(400).send("failed to handle query")
    }
  };
  
module.exports = {
    getLocationSettings,
    createLocation,
    getLocations,
    getLocationById,
    updateLocation,
    deleteLocation,
    getLocationsByIds
};
