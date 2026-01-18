import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    zipCode: String,
    country: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: ''
  },
  stripePaymentId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// IMPORTANT: NO PRE-SAVE HOOKS!
// Pre-save hooks can cause "next is not a function" errors
// orderNumber is generated in controllers before Order.create()
// Controllers now generate orderNumber: ORD-{timestamp}-{random}

// Aggressively clear cached model to ensure fresh schema (important for removing hooks)
// This prevents using old cached model with pre-save hooks
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Order) {
  delete mongoose.modelSchemas.Order;
}
// Also try alternative cache locations
if (mongoose.modelSchemas && mongoose.modelSchemas.OrderSchema) {
  delete mongoose.modelSchemas.OrderSchema;
}

// Verify no hooks exist on schema before creating model
if (orderSchema.$preHooks || orderSchema._hooks) {
  console.warn('⚠️ Warning: Order schema has hooks! This may cause issues.');
}

const Order = mongoose.model('Order', orderSchema);

// Verify the created model has no pre-save hooks
if (Order.schema && Order.schema.$preHooks) {
  console.warn('⚠️ Warning: Order model still has pre-save hooks after creation!');
}

export default Order;







