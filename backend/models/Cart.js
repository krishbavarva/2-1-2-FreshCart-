import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    trim: true
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
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  category: {
    type: String,
    default: '',
    trim: true
  }
}, {
  _id: true // Ensure subdocuments have _id for item operations
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Note: Index on 'user' field is automatically created by unique: true
// No need for explicit index declaration

// Calculate total price before saving
cartSchema.pre('save', async function() {
  // Calculate total price from items
  if (this.items && Array.isArray(this.items)) {
    this.totalPrice = this.items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 0;
      return total + (itemPrice * itemQuantity);
    }, 0);
  } else {
    this.totalPrice = 0;
  }
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;

