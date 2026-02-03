const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    service: 'YouCan Auto-Location API',
    version: '1.0.0'
  });
});

// OpenStreetMap Geocoding
app.post('/api/geocode', async (req, res) => {
  try {
    const { lat, lng, language = 'ar' } = req.body;
    
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat: lat,
        lon: lng,
        zoom: 18,
        addressdetails: 1,
        'accept-language': language,
        email: process.env.OSM_EMAIL || 'hello@youcanplugin.com'
      },
      headers: {
        'User-Agent': 'YouCan-Location-Plugin/1.0'
      }
    });
    
    const { address, display_name } = response.data;
    
    res.json({
      success: true,
      address: {
        formatted: display_name,
        components: {
          address1: address.road || '',
          address2: address.house_number || '',
          city: address.city || address.town || address.village || '',
          state: address.state || address.county || '',
          zip: address.postcode || '',
          country: address.country || '',
          countryCode: address.country_code?.toUpperCase() || ''
        }
      }
    });
    
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في تحديد العنوان',
      manualEntry: true
    });
  }
});

// YouCan OAuth Installation
app.get('/install', (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(400).send('يجب تحديد اسم المتجر');
  }
  
  const authUrl = `https://accounts.youcan.shop/oauth/authorize` +
    `?client_id=${process.env.YOUCAN_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=read_checkouts,write_checkouts` +
    `&state=${shop}`;
  
  res.redirect(authUrl);
});

// OAuth Callback
app.get('/callback', async (req, res) => {
  const { code, state: shop } = req.query;
  
  try {
    const tokenResponse = await axios.post('https://accounts.youcan.shop/oauth/token', {
      client_id: process.env.YOUCAN_CLIENT_ID,
      client_secret: process.env.YOUCAN_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI
    });
    
    const { access_token, store_id } = tokenResponse.data;
    
    // إرجاع صفحة نجاح
    res.send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تم التثبيت بنجاح</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
          .success { color: #10b981; font-size: 48px; margin-bottom: 20px; }
          .message { color: #333; margin: 20px 0; }
          .btn { background: #4f46e5; color: white; padding: 12px 24px; border: none; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h2>تم تثبيت الإضافة بنجاح!</h2>
          <p class="message">يمكنك الآن استخدام ميزة الكشف التلقائي عن الموقع في متجرك.</p>
          <a href="https://${shop}/admin" class="btn">العودة إلى لوحة التحكم</a>
        </div>
        <script>
          // إغلاق النافذة بعد 3 ثوانٍ إذا كانت منبثقة
          setTimeout(() => {
            if (window.opener) {
              window.close();
            }
          }, 3000);
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('حدث خطأ أثناء التثبيت');
  }
});

// Widget Script
app.get('/widget.js', (req, res) => {
  res.sendFile(__dirname + '/frontend/checkout-widget.js');
});

// Admin Panel
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin/settings.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});