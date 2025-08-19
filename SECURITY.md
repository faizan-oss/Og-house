# 🔒 Security Guide for OG House Project

## ⚠️ **CRITICAL SECURITY INFORMATION**

This project contains sensitive configuration files that should **NEVER** be committed to Git or shared publicly.

## 🚨 **Files That Should NEVER Be Committed**

- `.env` - Contains database credentials, API keys, and secrets
- `createAdmin.js` - Contains admin account credentials
- `config/db.js` - Database connection details
- `config/cloudinary.js` - Cloudinary API credentials
- `config/razorpay.js` - Razorpay payment credentials

## 🛡️ **Security Setup Steps**

### **1. Environment Variables (.env)**

1. Copy `env.template` to `.env`
2. Fill in your actual credentials:
   ```bash
   cp env.template .env
   ```

3. Update `.env` with your real credentials:
   ```env
   MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
   JWT_SECRET=your_super_secret_random_string_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

### **2. Admin Account Setup**

1. Copy `createAdmin.template.js` to `createAdmin.js`:
   ```bash
   cp createAdmin.template.js createAdmin.js
   ```

2. Update the admin credentials in `createAdmin.js`:
   ```javascript
   const adminData = {
     name: 'Your Admin Name',
     email: 'your_admin@email.com',
     password: 'your_secure_password',
     role: 'admin'
   };
   ```

3. Run the script to create admin:
   ```bash
   node createAdmin.js
   ```

4. **DELETE** `createAdmin.js` after use:
   ```bash
   rm createAdmin.js
   ```

### **3. Configuration Files**

If you have separate config files, ensure they use environment variables:

```javascript
// config/db.js
module.exports = {
  uri: process.env.MONGO_URI
};

// config/cloudinary.js
module.exports = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};
```

## 🔐 **Security Best Practices**

### **1. Strong Passwords**
- Use at least 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Never reuse passwords

### **2. JWT Secret**
- Use a random string of at least 32 characters
- Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### **3. Database Security**
- Use strong database passwords
- Enable MongoDB authentication
- Use connection strings with authentication

### **4. API Keys**
- Rotate API keys regularly
- Use environment-specific keys (dev/staging/prod)
- Never hardcode in source code

## 🚀 **Deployment Security**

### **1. Production Environment**
- Use production-grade MongoDB cluster
- Enable SSL/TLS for database connections
- Use strong production JWT secrets

### **2. Environment Variables**
- Set environment variables on your hosting platform
- Never commit `.env` files
- Use platform-specific secret management

### **3. Access Control**
- Limit database access to application servers only
- Use IP whitelisting where possible
- Enable MongoDB network access controls

## 🧹 **Cleanup Commands**

If you accidentally committed sensitive files:

```bash
# Remove from Git history (DANGEROUS - use with caution)
chmod +x remove-sensitive-files.sh
./remove-sensitive-files.sh

# Force push to GitHub (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

## 📋 **Checklist**

- [ ] `.env` file created with real credentials
- [ ] `.env` added to `.gitignore`
- [ ] `createAdmin.js` created with secure credentials
- [ ] Admin account created
- [ ] `createAdmin.js` deleted
- [ ] All config files use environment variables
- [ ] Sensitive files removed from Git history
- [ ] New credentials set up
- [ ] Old credentials rotated/disabled

## 🆘 **Emergency Response**

If credentials are compromised:

1. **IMMEDIATELY** rotate all affected credentials
2. **IMMEDIATELY** disable old API keys
3. **IMMEDIATELY** change database passwords
4. **IMMEDIATELY** regenerate JWT secrets
5. Review Git history for other sensitive data
6. Consider using GitGuardian or similar tools

## 📞 **Support**

For security issues or questions:
- Review this document thoroughly
- Check your hosting platform's security documentation
- Consider professional security audit for production deployments

---

**Remember: Security is everyone's responsibility! 🔒**
