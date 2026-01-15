import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Uncategorized',
    trim: true
  },
  barcode: {
    type: String,
    default: '',
    index: true
  },
  stock: {
    type: Number,
    required: true,
    default: 50,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'kg', 'liter', 'box', 'pack']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  nutriscoreGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', null],
    default: null,
    uppercase: true
  },
  nutriscoreScore: {
    type: Number,
    default: null,
    min: -15,
    max: 40
  },
  protein: {
    type: Number,
    default: null,
    min: 0
  },
  nutritionalValue: {
    energy: { type: Number, default: null },
    fat: { type: Number, default: null },
    saturatedFat: { type: Number, default: null },
    carbs: { type: Number, default: null },
    sugars: { type: Number, default: null },
    fiber: { type: Number, default: null },
    salt: { type: Number, default: null }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  supplier: {
    name: {
      type: String,
      default: ''
    },
    contact: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  restockHistory: [{
    quantity: Number,
    date: {
      type: Date,
      default: Date.now
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cost: Number,
    notes: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
productSchema.index({ stock: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ likesCount: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ protein: 1 });
productSchema.index({ nutriscoreGrade: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) {
    return 'out_of_stock';
  } else if (this.stock <= this.minStockLevel) {
    return 'low_stock';
  } else if (this.stock >= this.maxStockLevel) {
    return 'overstocked';
  }
  return 'in_stock';
});

// Method to check if restocking is needed
productSchema.methods.needsRestock = function() {
  return this.stock <= this.minStockLevel;
};

// Method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'set') {
  if (operation === 'add') {
    this.stock += quantity;
  } else if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else {
    this.stock = quantity;
  }
  
  // Update status based on stock
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock') {
    this.status = 'active';
  }
  
  return this.stock;
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;




