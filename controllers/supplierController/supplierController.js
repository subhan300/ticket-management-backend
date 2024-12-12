// controllers/supplierController.js
const Supplier = require('../../models/supplier');

// Create a new supplier
exports.createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const { selectedLocation}=req.user
        const suppliers = await Supplier.find( {location: { $in:  selectedLocation } ,});
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single supplier by ID
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.status(200).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateAllSupplier = async () => {
    try {
      const location = "66df7372e2fe86332f1ad7c5"; // The location you want to add to all records
  
      const result = await Supplier.updateMany(
        {}, 
        { $set: { location: location } } // Set the 'location' field for all records
      );
    } catch (error) {
      console.error("Error updating temperature readings:", error);
      // res.status(500).json({ message: "Internal server error" });
    }
  };
// Delete a supplier
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.status(200).json("deleted");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
