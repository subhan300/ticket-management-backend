const Category = require('../../models/categories');

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { category, sizes,type } = req.body;
    const newCategory = new Category({ category, sizes,type });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Edit a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItems = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updatedItems,
      { new: true }
    );
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create multiple categories in bulk
exports.createCategoriesInBulk = async (req, res) => {
  try {
    const categories = req.body; // Expecting an array of category objects
    const newCategories = await Category.insertMany(categories);
    res.status(201).json(newCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
     const {type}=req.params
    const categories = await Category.find({type});
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
