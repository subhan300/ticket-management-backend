const Location = require('../../models/locationModel');

// Create a new location
const createLocation = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { SKU } = req.body;

        // Check if a location with the same SKU already exists for the company
        const existingLocation = await Location.findOne({ SKU, companyId });

        if (existingLocation) {
            return res.status(400).json({ error: 'Duplicate SKU. A location with this SKU already exists.' });
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

module.exports = {
    createLocation,
    getLocations,
    getLocationById,
    updateLocation,
    deleteLocation,
};
