import Order from '../models/Order.js';
import User from '../models/User.js';
import STORE_CONFIG from '../config/store.js';
import puppeteer from 'puppeteer';

/**
 * Generate HTML receipt/invoice for an order
 * @param {Object} order - Order document
 * @param {Object} user - User document
 * @returns {string} HTML receipt
 */
export const generateReceiptHTML = (order, user) => {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const invoiceTime = new Date(order.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format currency
  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  const storeAddress = STORE_CONFIG.address;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${order.orderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }
    .info-box {
      flex: 1;
      min-width: 250px;
    }
    .info-box h3 {
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    .info-box p {
      color: #666;
      margin: 5px 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .items-table thead {
      background: #2563eb;
      color: white;
    }
    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .items-table tbody tr:hover {
      background: #f9f9f9;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals {
      margin-top: 20px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row.grand-total {
      border-top: 2px solid #2563eb;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-ordered {
      background: #10b981;
      color: white;
    }
    .status-delivered {
      background: #3b82f6;
      color: white;
    }
    .status-cancelled {
      background: #ef4444;
      color: white;
    }
    .status-pending {
      background: #f59e0b;
      color: white;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>INVOICE</h1>
      <p>Order Receipt #${order.orderNumber}</p>
    </div>

    <div class="invoice-info">
      <div class="info-box">
        <h3>Bill To</h3>
        <p><strong>${user.firstName} ${user.lastName}</strong></p>
        <p>${user.email}</p>
        ${user.phone ? `<p>Phone: ${user.phone}</p>` : ''}
        ${order.shippingAddress ? `
          <p style="margin-top: 10px;">
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
          </p>
        ` : ''}
      </div>
      
      <div class="info-box">
        <h3>Store Information</h3>
        <p><strong>FreshCart Store</strong></p>
        <p>${storeAddress.fullAddress}</p>
        <p style="margin-top: 10px;">
          <strong>Invoice Date:</strong> ${invoiceDate}<br>
          <strong>Invoice Time:</strong> ${invoiceTime}<br>
          <strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.replace('_', ' ')}</span>
        </p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-center">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.brand ? `<br><small style="color: #666;">Brand: ${item.brand}</small>` : ''}
              ${item.category ? `<br><small style="color: #999;">${item.category}</small>` : ''}
            </td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right"><strong>${formatCurrency(item.price * item.quantity)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${formatCurrency(order.subtotal)}</span>
      </div>
      ${order.tax > 0 ? `
        <div class="total-row">
          <span>Tax (10%):</span>
          <span>${formatCurrency(order.tax)}</span>
        </div>
      ` : ''}
      ${order.deliveryFee > 0 ? `
        <div class="total-row">
          <span>Delivery Cost:</span>
          <span>${formatCurrency(order.deliveryFee)}</span>
          ${order.deliveryDistance ? `<br><small style="color: #666; font-weight: normal;">Distance: ${order.deliveryDistance.toFixed(2)} km</small>` : ''}
        </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>Total Amount:</span>
        <span>${formatCurrency(order.total)}</span>
      </div>
    </div>

    ${order.paymentMethod ? `
      <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>Payment Method:</strong> ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}<br>
          <strong>Payment Status:</strong> <span class="status-badge status-${order.paymentStatus}">${order.paymentStatus}</span>
        </p>
      </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your purchase!</p>
      <p style="margin-top: 10px;">This is a computer-generated receipt. No signature required.</p>
      <p style="margin-top: 5px;">For inquiries, please contact our customer service.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
};

/**
 * Generate receipt and return as HTML string
 * @param {string} orderId - Order ID
 * @returns {Promise<{html: string, orderNumber: string}>}
 */
export const generateReceipt = async (orderId) => {
  const order = await Order.findById(orderId).populate('user', 'firstName lastName email phone');
  
  if (!order) {
    throw new Error('Order not found');
  }

  const user = order.user;
  if (!user) {
    throw new Error('User not found for this order');
  }

  const html = generateReceiptHTML(order, user);
  
  return {
    html,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt
  };
};

/**
 * Generate PDF receipt from HTML
 * @param {string} html - HTML receipt content
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateReceiptPDF = async (html) => {
  let browser;
  try {
    console.log('📄 Starting PDF generation...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    console.log('✅ PDF generated successfully');
    
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

