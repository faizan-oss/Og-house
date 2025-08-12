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
    .map((item) => {
      const name = item.food?.name || 'Item';
      const qty = item.quantity || 1;
      const price = item.food?.price || 0;
      const lineTotal = price * qty;
      return `<tr><td style="padding:6px 10px;border:1px solid #eee;">${name}</td><td style="padding:6px 10px;border:1px solid #eee;" align="center">${qty}</td><td style="padding:6px 10px;border:1px solid #eee;" align="right">${formatCurrency(price)}</td><td style="padding:6px 10px;border:1px solid #eee;" align="right">${formatCurrency(lineTotal)}</td></tr>`;
    })
    .join('');

  return `
  <div style="font-family:Arial,sans-serif;font-size:14px;color:#111;">
    <h2 style="margin:0 0 10px;">New Order Placed</h2>
    <p style="margin:0 0 4px;"><strong>Order ID:</strong> ${order._id}</p>
    <p style="margin:0 0 4px;"><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
    <p style="margin:0 12px;"><strong>Placed at:</strong> ${createdAt}</p>
    <table style="border-collapse:collapse;width:100%;max-width:640px;margin:10px 0;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 10px;border:1px solid #eee;background:#fafafa;">Item</th>
          <th align="center" style="padding:8px 10px;border:1px solid #eee;background:#fafafa;">Qty</th>
          <th align="right" style="padding:8px 10px;border:1px solid #eee;background:#fafafa;">Price</th>
          <th align="right" style="padding:8px 10px;border:1px solid #eee;background:#fafafa;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right" style="padding:8px 10px;border:1px solid #eee;"><strong>Grand Total</strong></td>
          <td align="right" style="padding:8px 10px;border:1px solid #eee;"><strong>${formatCurrency(order.totalAmount || 0)}</strong></td>
        </tr>
        <tr>
          <td colspan="3" align="right" style="padding:8px 10px;border:1px solid #eee;">Status</td>
          <td align="right" style="padding:8px 10px;border:1px solid #eee;"><strong>${order.status || 'Pending'}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p style="color:#666;">You are receiving this email because you are an admin for The Og House.</p>
  </div>`;
}

async function sendOrderPlacedEmail(order) {
  console.log('📧 Attempting to send email notification...');
  
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

  const subject = `New order #${order._id} - ${order.customerName || 'Customer'}`;
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
