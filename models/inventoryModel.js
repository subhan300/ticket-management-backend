const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"company",
        required:true,
      },
  productName: {
    type: String,
    required: true,
  },
  productImages:{
    type: Array,
    required:true
  },
  description: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  usedItem: {
    type: Number,
    required: false,
    default: 0,
  },
 
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Low Stock'],
    default: 'In Stock',
  },

}, { timestamps: true });

inventorySchema.virtual('availableQty').get(function () {
    return this.quantity - this.usedItem;
  });
  
//   // Ensure virtual fields are included in toJSON and toObject outputs
//   inventorySchema.set('toJSON', { virtuals: true });
//   inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
