// companyController.js

const Company = require('../../models/companyModel');

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

// Other controller functions like createCompany, updateCompany, deleteCompany, etc.
module.exports={
    getAllCompanies,
    createCompany,
    getCompanyById
}