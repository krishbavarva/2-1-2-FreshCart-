import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get customer KPIs
export const getCustomerKPIs = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    // Get all orders for the user
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');

    if (orders.length === 0) {
      return res.json({
        totalOrders: 0,
        totalSpent: 0,
        totalItemsPurchased: 0,
        orderFrequency: 0,
        averageOrderValue: 0,
        favoriteCategories: [],
        recentOrders: []
      });
    }

    // Calculate total orders
    const totalOrders = orders.length;

    // Calculate total spent
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculate total items purchased
    const totalItemsPurchased = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
    }, 0);

    // Calculate order frequency (orders per month)
    const oldestOrder = orders[orders.length - 1];
    const newestOrder = orders[0];
    const daysDiff = (new Date(newestOrder.createdAt) - new Date(oldestOrder.createdAt)) / (1000 * 60 * 60 * 24);
    const monthsDiff = daysDiff / 30;
    const orderFrequency = monthsDiff > 0 ? (totalOrders / monthsDiff).toFixed(2) : totalOrders;

    // Calculate average order value
    const averageOrderValue = totalSpent / totalOrders;

    // Get favorite categories (top 3)
    const categoryCount = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
        }
      });
    });

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    // Get recent orders (last 5)
    const recentOrders = orders.slice(0, 5).map(order => ({
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    // Get order frequency by month (for chart)
    const monthlyOrders = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
    });

    const orderFrequencyByMonth = Object.entries(monthlyOrders)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, count }));

    res.json({
      totalOrders,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalItemsPurchased,
      orderFrequency: parseFloat(orderFrequency),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      favoriteCategories,
      recentOrders,
      orderFrequencyByMonth
    });
  } catch (error) {
    console.error('Error fetching customer KPIs:', error);
    res.status(500).json({
      message: 'Error fetching customer KPIs',
      error: error.message
    });
  }
};

// Get customer order history
export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ user: userId });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      message: 'Error fetching customer orders',
      error: error.message
    });
  }
};

