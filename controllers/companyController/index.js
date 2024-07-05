// companyController.js

const Company = require('../../models/companyModel');
const Unit=require('../../models/unitModel')
const createCompany = async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        const newCompany = new Company({
            name,
            email,
            phone
        });

        const savedCompany = await newCompany.save();
        res.status(201).json(savedCompany);
    } catch (err) {
        console.error('Error creating company:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


// Function to get all companies
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.json(companies);
    } catch (err) {
        console.error('Error fetching companies:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Function to get company by ID
const getCompanyById = async (req, res) => {
    const { companyId } = req.params;

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found.' });
        }
        res.json(company);
    } catch (err) {
        console.error('Error fetching company:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
const addUnit = async (req, res) => {
    try {
        const { companyId } = req.params;
        const unitDataReq = req.body;
          console.log("unitDataReq",unitDataReq.name)
        // Ensure all required fields are present in req.body
        if (!unitDataReq.name) {
            return res.status(400).json({ error: "Unit name and location are required" });
        }

        // Add company reference to unit data
        const unitData = { ...unitDataReq, company: companyId };

        // Create a new Unit instance
        const newUnit = new Unit(unitData);

        // Save the unit to the database
        const unit = await newUnit.save();

        // Find the company and update its units array
        const company = await Company.findById(companyId);
        if (!company) {
            throw new Error("Company not found");
        }
        company.units.push(unit);
        await company.save();

        res.status(201).json(unit);
    } catch (error) {
        console.error("Error adding unit:", error);
        res.status(400).json({ error: error.message });
    }
};



const addRoom = async (req, res) => {
    try {
        const { unitId } = req.params;
        const roomData =req.body
        

        const unit = await Unit.findById(unitId);
        unit.rooms.push();
        await unit.save(roomsData);

        res.status(201).send(room);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Other controller functions like createCompany, updateCompany, deleteCompany, etc.
module.exports={
    getAllCompanies,
    createCompany,
    getCompanyById,
    addUnit,
    addRoom
}