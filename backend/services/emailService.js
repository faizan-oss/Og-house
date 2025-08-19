const nodemailer = require('nodemailer');
const User = require('../models/User');

let cachedTransporter = null;

function isEmailConfigured() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS &&
    !!process.env.FROM_EMAIL
  );
}

function getTransporter() {
  if (cachedTransporter) {
    console.log('✅ Using cached SMTP transporter');
    return cachedTransporter;
  }
  
  if (!isEmailConfigured()) {
    console.log('❌ SMTP not configured. Required vars:');
    console.log('   SMTP_HOST:', !!process.env.SMTP_HOST);
    console.log('   SMTP_PORT:', !!process.env.SMTP_PORT);
    console.log('   SMTP_USER:', !!process.env.SMTP_USER);
    console.log('   SMTP_PASS:', !!process.env.SMTP_PASS);
    console.log('   FROM_EMAIL:', !!process.env.FROM_EMAIL);
    return null;
  }

  console.log('🔧 Creating new SMTP transporter...');
  console.log('   Host:', process.env.SMTP_HOST);
  console.log('   Port:', process.env.SMTP_PORT);
  console.log('   User:', process.env.SMTP_USER);
  console.log('   Secure:', process.env.SMTP_SECURE);

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  console.log('✅ SMTP transporter created successfully');
  return cachedTransporter;
}

async function getAdminRecipientEmails() {
  console.log('🔍 Looking for admin recipients...');
  
  // Prefer admins from DB
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    console.log('👥 Found admin users in DB:', adminEmails);

    if (adminEmails.length > 0) return adminEmails;
  } catch (err) {
    console.error('❌ Error querying admin users from DB:', err);
    // Fall back to env if DB query fails
  }

  // Fallback to comma-separated env var
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  
  console.log('📧 Using admin emails from env:', fromEnv);
  return fromEnv;
}

function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  } catch {
    return `₹${Number(amount || 0).toFixed(2)}`;
  }
}

function buildOrderEmailHtml(order) {
  const createdAt = new Date(order.createdAt || Date.now()).toLocaleString();
  const itemsRows = (order.items || [])
    .map((item, index) => {
      const name = item.food?.name || 'Item';
      const qty = item.quantity || 1;
      const price = item.food?.price || 0;
      const lineTotal = price * qty;
      const isEven = index % 2 === 0;
      return `<tr style="background:${isEven ? '#ffffff' : '#f8fafc'};">
        <td style="padding:15px;border-bottom:1px solid #e2e8f0;color:#111827;font-weight:500;">${name}</td>
        <td style="padding:15px;border-bottom:1px solid #e2e8f0;color:#6b7280;font-weight:600;" align="center">${qty}</td>
        <td style="padding:15px;border-bottom:1px solid #e2e8f0;color:#6b7280;" align="right">${formatCurrency(price)}</td>
        <td style="padding:15px;border-bottom:1px solid #e2e8f0;color:#111827;font-weight:600;" align="right">${formatCurrency(lineTotal)}</td>
      </tr>`;
    })
    .join('');

  // Calculate totals
  const subtotal = order.totalAmount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const finalAmount = order.finalAmount || (subtotal + deliveryFee);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order - The OG House</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:650px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #1f2937 0%, #374151 100%);padding:30px;text-align:center;position:relative;">
        <div style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.1);padding:8px 12px;border-radius:20px;font-size:11px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">New Order</div>
        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:300;letter-spacing:2px;">THE OG HOUSE</h1>
        <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;font-weight:300;">Culinary Excellence Delivered</p>
        <div style="width:60px;height:2px;background:#f59e0b;margin:15px auto 0;"></div>
      </div>

      <!-- Order Summary Header -->
      <div style="background:#f8fafc;padding:25px;border-bottom:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
          <h2 style="margin:0;color:#1e293b;font-size:20px;font-weight:600;">Order #${String(order._id).slice(-8).toUpperCase()}</h2>
          <span style="margin-left:10px;background:#10b981;color:white;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${order.status || 'Pending'}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;color:#64748b;font-size:13px;">
          <div><strong style="color:#374151;">${order.orderType || 'Delivery'}</strong> • ${order.paymentMethod || 'Cash on Delivery'}</div>
          <div style="text-align:right;">${createdAt}</div>
        </div>
      </div>

      <!-- Customer & Delivery Info -->
      <div style="padding:30px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px;">
          
          <!-- Customer Details -->
          <div>
            <h3 style="margin:0 0 15px;color:#374151;font-size:16px;font-weight:600;border-bottom:2px solid #f59e0b;padding-bottom:8px;display:inline-block;">Customer Information</h3>
            <div style="space-y:8px;">
              <div style="margin-bottom:8px;">
                <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Name</span>
                <div style="color:#111827;font-weight:600;font-size:15px;">${order.customerName || 'N/A'}</div>
              </div>
              <div style="margin-bottom:8px;">
                <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Phone</span>
                <div style="color:#111827;font-weight:600;font-size:15px;">${order.phone || order.deliveryDetails?.phone || 'N/A'}</div>
              </div>
              <div style="margin-bottom:8px;">
                <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Email</span>
                <div style="color:#111827;font-weight:400;font-size:14px;">${order.email || 'Not provided'}</div>
              </div>
            </div>
          </div>

          <!-- Delivery/Pickup Details -->
          <div>
            ${order.orderType !== 'pickup' ? `
            <h3 style="margin:0 0 15px;color:#374151;font-size:16px;font-weight:600;border-bottom:2px solid #f59e0b;padding-bottom:8px;display:inline-block;">Delivery Address</h3>
            <div style="background:#f8fafc;padding:15px;border-radius:8px;border-left:4px solid #3b82f6;">
              <div style="margin-bottom:8px;">
                <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Address</span>
                <div style="color:#111827;font-weight:500;line-height:1.4;">${order.deliveryDetails?.address || 'N/A'}</div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div>
                  <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">City</span>
                  <div style="color:#111827;font-weight:500;">${order.deliveryDetails?.city || 'N/A'}</div>
                </div>
                <div>
                  <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Pincode</span>
                  <div style="color:#111827;font-weight:500;">${order.deliveryDetails?.pincode || 'N/A'}</div>
                </div>
              </div>
            </div>
            ` : `
            <h3 style="margin:0 0 15px;color:#374151;font-size:16px;font-weight:600;border-bottom:2px solid #f59e0b;padding-bottom:8px;display:inline-block;">Pickup Order</h3>
            <div style="background:#ecfdf5;padding:15px;border-radius:8px;border-left:4px solid #10b981;">
              <div style="color:#065f46;font-weight:500;">🏪 Customer will collect from restaurant</div>
              <div style="color:#6b7280;font-size:13px;margin-top:5px;">Please prepare order for pickup</div>
            </div>
            `}
          </div>
        </div>

        <!-- Special Instructions -->
        ${order.specialInstructions ? `
        <div style="background:linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);padding:20px;border-radius:12px;border-left:4px solid #f59e0b;margin-bottom:30px;">
          <h3 style="margin:0 0 10px;color:#92400e;font-size:16px;font-weight:600;">✨ Special Instructions</h3>
          <p style="margin:0;font-style:italic;color:#7c2d12;font-size:15px;line-height:1.5;">"${order.specialInstructions}"</p>
        </div>
        ` : ''}

        <!-- Order Items -->
        <div style="margin-bottom:30px;">
          <h3 style="margin:0 0 20px;color:#374151;font-size:18px;font-weight:600;border-bottom:2px solid #f59e0b;padding-bottom:8px;display:inline-block;">Order Details</h3>
          
          <div style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <table style="border-collapse:collapse;width:100%;">
      <thead>
                <tr style="background:linear-gradient(135deg, #1f2937 0%, #374151 100%);">
                  <th align="left" style="padding:15px;color:#ffffff;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
                  <th align="center" style="padding:15px;color:#ffffff;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                  <th align="right" style="padding:15px;color:#ffffff;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
                  <th align="right" style="padding:15px;color:#ffffff;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
            
            <!-- Totals Section -->
            <div style="background:#ffffff;padding:20px;border-top:1px solid #e2e8f0;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="color:#6b7280;font-size:14px;">Subtotal</span>
                <span style="margin-left: 10px;color:#111827;font-weight:600;font-size:16px;">${formatCurrency(subtotal)}</span>
              </div>
              
              ${deliveryFee > 0 ? `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="color:#6b7280;font-size:14px;">Delivery Fee</span>
                <span style="color:#111827;font-weight:600;font-size:16px;">${formatCurrency(deliveryFee)}</span>
              </div>
              ` : ''}
              
              <div style="border-top:2px solid #e2e8f0;padding-top:15px;margin-top:15px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="margin-top:10px;color:#111827;font-weight:700;font-size:18px;">TOTAL</span>
                  <span style="margin-left: 10px;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#ffffff;padding:8px 20px;border-radius:25px;font-weight:700;font-size:18px;">${formatCurrency(finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:linear-gradient(135deg, #1f2937 0%, #374151 100%);padding:25px;text-align:center;">
        <div style="margin-bottom:15px;">
          <div style="width:60px;height:2px;background:#f59e0b;margin:0 auto 15px;"></div>
          <h4 style="margin:0;color:#ffffff;font-size:16px;font-weight:300;letter-spacing:1px;">THE OG HOUSE</h4>
          <p style="margin:5px 0 0;color:#d1d5db;font-size:12px;">Culinary Excellence Delivered</p>
        </div>
        
        <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;">
          <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.4;">
            You are receiving this email because you are an admin for The OG House.<br>
            Please process this order as soon as possible.
          </p>
        </div>
      </div>
      
    </div>
  </body>
  </html>`;
}

async function sendOrderPlacedEmail(order) {
  console.log('📧 Attempting to send email notification...');
  console.log('📋 Order data received:', {
    id: order._id,
    idType: typeof order._id,
    customerName: order.customerName,
    orderType: order.orderType,
    totalAmount: order.totalAmount,
    finalAmount: order.finalAmount
  });
  
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('❌ Email not sent: SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL');
    return;
  }
  console.log('✅ SMTP transporter configured successfully');

  const to = await getAdminRecipientEmails();
  if (!to || to.length === 0) {
    console.warn('❌ Email not sent: No admin recipients found. Create an admin user or set ADMIN_EMAILS');
    return;
  }
  console.log('✅ Admin recipients found:', to);

  const subject = `New ${order.orderType || 'Delivery'} Order #${String(order._id).slice(-8).toUpperCase()} | ${order.customerName || 'Customer'} | ₹${order.finalAmount || order.totalAmount || 0} | The OG House`;
  const html = buildOrderEmailHtml(order);

  try {
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: to.join(','),
      subject,
      html,
    });
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendOrderPlacedEmail,
  isEmailConfigured,
};
