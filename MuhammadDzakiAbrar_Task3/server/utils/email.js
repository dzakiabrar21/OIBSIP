const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email verification
const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
  console.log('\n=============================================');
  console.log(`🔗 VERIFICATION LINK FOR ${email}:`);
  console.log(verificationUrl);
  console.log('=============================================\n');

  const mailOptions = {
    from: `"PizzaCraft 🍕" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - PizzaCraft',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7c948 100%); padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px;">🍕 PizzaCraft</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Welcome to the pizza universe!</p>
        </div>
        <div style="padding: 40px; color: #e0e0e0;">
          <h2 style="color: #f7c948; margin-top: 0;">Verify Your Email</h2>
          <p>You're almost there! Click the button below to verify your email address and start building your dream pizza.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #ff6b35 0%, #f7c948 100%); color: #fff; padding: 14px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
          </div>
          <p style="font-size: 13px; color: #888;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"PizzaCraft 🍕" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - PizzaCraft',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px;">🔒 Password Reset</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">PizzaCraft Security</p>
        </div>
        <div style="padding: 40px; color: #e0e0e0;">
          <h2 style="color: #f7c948; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #fff; padding: 14px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #888;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

// Send low stock alert to admin
const sendLowStockAlert = async (adminEmail, items) => {
  const transporter = createTransporter();

  const itemsList = items.map(item =>
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #e0e0e0;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #e0e0e0;">${item.category}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #ff6b35; font-weight: bold;">${item.stock}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a4a; color: #888;">${item.threshold}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: `"PizzaCraft Admin 🍕" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: '⚠️ Low Stock Alert - PizzaCraft Inventory',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%); padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px;">⚠️ Low Stock Alert</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Inventory needs attention!</p>
        </div>
        <div style="padding: 40px; color: #e0e0e0;">
          <h2 style="color: #f7c948; margin-top: 0;">Items Below Threshold</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: rgba(255,107,53,0.2);">
                <th style="padding: 10px; text-align: left; color: #f7c948;">Item</th>
                <th style="padding: 10px; text-align: left; color: #f7c948;">Category</th>
                <th style="padding: 10px; text-align: left; color: #f7c948;">Stock</th>
                <th style="padding: 10px; text-align: left; color: #f7c948;">Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 14px; color: #888;">Please restock these items as soon as possible to avoid order disruptions.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Low stock alert sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Stock alert email error:', error.message);
  }
};

// Send order status update to user
const sendOrderStatusEmail = async (email, orderId, status) => {
  const transporter = createTransporter();

  const statusMessages = {
    'Order Received': { emoji: '📋', color: '#3498db', message: 'Your order has been received and is being processed.' },
    'In the Kitchen': { emoji: '👨‍🍳', color: '#f39c12', message: 'Your pizza is being prepared in our kitchen right now!' },
    'Sent to Delivery': { emoji: '🚗', color: '#2ecc71', message: 'Your pizza is on its way! Get ready to enjoy!' },
    'Delivered': { emoji: '✅', color: '#27ae60', message: 'Your pizza has been delivered. Enjoy your meal!' }
  };

  const statusInfo = statusMessages[status] || { emoji: '📋', color: '#3498db', message: 'Your order status has been updated.' };

  const mailOptions = {
    from: `"PizzaCraft 🍕" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${statusInfo.emoji} Order Update: ${status} - PizzaCraft`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}cc 100%); padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 48px;">${statusInfo.emoji}</h1>
          <h2 style="color: #fff; margin: 10px 0 0;">${status}</h2>
        </div>
        <div style="padding: 40px; color: #e0e0e0;">
          <p style="font-size: 16px;">${statusInfo.message}</p>
          <p style="font-size: 13px; color: #888; margin-top: 20px;">Order ID: ${orderId}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Order status email error:', error.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendOrderStatusEmail
};
