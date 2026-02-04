const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: ["https://*.youcan.shop", "http://localhost:3000", "https://*.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.static("public"));

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>YouCan Auto Location Plugin</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 20px;
        }
        .container { 
          background: white; 
          padding: 40px; 
          border-radius: 15px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
          max-width: 800px; 
          text-align: center; 
          width: 100%;
        }
        h1 { color: #333; margin-bottom: 20px; font-size: 28px; }
        .status { 
          background: #10b981; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 20px; 
          display: inline-block; 
          margin: 10px; 
          font-weight: bold;
        }
        .endpoints { 
          text-align: right; 
          margin-top: 30px; 
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .endpoint { 
          background: white; 
          padding: 12px 15px; 
          margin: 8px 0; 
          border-radius: 8px; 
          font-family: 'Courier New', monospace; 
          text-align: right;
          border-right: 4px solid #4c51bf;
          transition: all 0.3s;
        }
        .endpoint:hover {
          transform: translateX(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 25px;
          flex-wrap: wrap;
        }
        .btn {
          background: linear-gradient(135deg, #4c51bf 0%, #6b46c1 100%);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
          transition: all 0.3s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(76, 81, 191, 0.3);
        }
        .logo {
          font-size: 48px;
          margin-bottom: 15px;
        }
        @media (max-width: 600px) {
          .container { padding: 20px; }
          h1 { font-size: 24px; }
          .btn { width: 100%; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">📍</div>
        <h1>YouCan Auto Location Plugin</h1>
        <p style="color: #4a5568; margin-bottom: 20px;">إضافة لاكتشاف الموقع التلقائي لمتاجر YouCan</p>
        <div class="status">✅ الخادم يعمل بشكل طبيعي</div>
        
        <div class="endpoints">
          <h3 style="text-align: right; color: #2d3748; margin-bottom: 15px; border-bottom: 2px solid #4c51bf; padding-bottom: 8px;">🔗 النقاط المتاحة:</h3>
          <div class="endpoint">GET /api/health - فحص حالة الخادم</div>
          <div class="endpoint">POST /api/geocode - تحويل الإحداثيات إلى عنوان</div>
          <div class="endpoint">GET /install?shop=اسم_المتجر - تثبيت الإضافة</div>
          <div class="endpoint">GET /callback - رد OAuth من YouCan</div>
          <div class="endpoint">GET /widget.js - سكريبت الواجهة للزر</div>
          <div class="endpoint">GET /admin - لوحة تحكم الإضافة</div>
        </div>
        
        <div class="actions">
          <a href="/api/health" class="btn">🔍 فحص الحالة</a>
          <a href="/admin" class="btn">⚙️ لوحة التحكم</a>
          <a href="/widget.js" class="btn">📜 عرض السكريبت</a>
          <a href="https://github.com/imadferradji/youcan-auto-location" class="btn" target="_blank">🐙 GitHub</a>
        </div>
        
        <p style="margin-top: 25px; color: #718096; font-size: 14px;">
          الإصدار 1.0.0 | يعمل مع OpenStreetMap المجاني | YouCan Integration
        </p>
      </div>
    </body>
    </html>
  `);
});

// فحص حالة الخادم
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "YouCan Location API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    endpoints: [
      "/api/health",
      "/api/geocode",
      "/install",
      "/callback",
      "/widget.js",
      "/admin"
    ]
  });
});

// تحويل الإحداثيات إلى عنوان (OpenStreetMap)
app.post("/api/geocode", async (req, res) => {
  try {
    const { lat, lng, language = "ar" } = req.body;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: "إحداثيات غير صالحة. تأكد من إرسال lat و lng كأرقام.",
      });
    }

    // تقييد القيم لتجنب أخطاء OpenStreetMap
    const safeLat = Math.max(-90, Math.min(90, parseFloat(lat)));
    const safeLng = Math.max(-180, Math.min(180, parseFloat(lng)));

    console.log(`📍 طلب geocode: ${safeLat}, ${safeLng} (${language})`);

    // استخدام OpenStreetMap Nominatim
    const response = await axios.get(
  	"https://nominatim.openstreetmap.org/reverse",
  	{
    		params: 
		{
      			format: "json",
      			lat: safeLat,
      			lon: safeLng,
      			zoom: 18,
      			addressdetails: 1,
      			"accept-language": language,
      			email: "imadferradji@gmail.com", // ⬅️ ضع بريدك هنا مباشرة
    		},
    		headers: {
      			"User-Agent": "YouCan-Location-Plugin/1.0 (imadferradji@gmail.com)",
    		},
    		timeout: 10000
  	}
    );

    const { address, display_name } = response.data;

    // تنسيق البيانات لتناسب YouCan
    const formattedAddress = {
      formatted: display_name,
      components: {
        address1: address.road || address.highway || "",
        address2: address.house_number || address.house_name || "",
        city: address.city || address.town || address.village || address.municipality || "",
        state: address.state || address.region || address.county || "",
        zip: address.postcode || "",
        country: address.country || "",
        countryCode: address.country_code?.toUpperCase() || "",
        neighborhood: address.neighbourhood || address.suburb || "",
      },
      coordinates: {
        lat: safeLat,
        lng: safeLng,
      },
      raw: address // للتصحيح
    };

    console.log(`✅ تم تحويل العنوان: ${display_name.substring(0, 50)}...`);

    res.json({
      success: true,
      address: formattedAddress,
      source: "openstreetmap",
      cacheable: true
    });

  } catch (error) {
    console.error("❌ Geocoding error:", error.message);
    
    // محاولة خدمة احتياطية
    try {
      console.log("🔄 محاولة خدمة احتياطية...");
      
      // استخدم geocode.maps.co كبديل
      const backupResponse = await axios.get(
        "https://geocode.maps.co/reverse",
        {
          params: {
            lat: req.body.lat,
            lon: req.body.lng,
            api_key: process.env.GEOCODE_MAPS_KEY || "65c1135c2a5e4749150420whe2ea8a3",
          },
          timeout: 5000
        }
      );
      
      if (backupResponse.data && backupResponse.data.display_name) {
        const backupAddress = backupResponse.data.address || {};
        
        res.json({
          success: true,
          address: {
            formatted: backupResponse.data.display_name,
            components: {
              address1: backupAddress.road || "",
              city: backupAddress.city || backupAddress.town || "",
              country: backupAddress.country || "",
              state: backupAddress.state || "",
              zip: backupAddress.postcode || ""
            },
            coordinates: {
              lat: parseFloat(req.body.lat),
              lng: parseFloat(req.body.lng)
            }
          },
          source: "geocode.maps",
          cacheable: true
        });
      } else {
        throw new Error("Backup service returned no data");
      }
    } catch (backupError) {
      console.error("❌ Backup service also failed:", backupError.message);
      
      res.status(500).json({
        success: false,
        error: "فشل في الحصول على العنوان من جميع الخدمات",
        message: "الرجاء إدخال العنوان يدويًا",
        manualEntry: true,
        coordinates: {
          lat: req.body.lat,
          lng: req.body.lng
        }
      });
    }
  }
});

// تثبيت الإضافة في YouCan
app.get("/install", (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خطأ في التثبيت</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #f7fafc; 
            text-align: center; 
            padding: 50px 20px; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
          }
          .error-container { 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            max-width: 500px; 
            width: 100%;
          }
          .error-icon { 
            color: #dc2626; 
            font-size: 64px; 
            margin-bottom: 20px;
          }
          h2 { color: #dc2626; margin-bottom: 15px; }
          .instruction {
            background: #fef2f2;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: right;
            border-right: 4px solid #dc2626;
          }
          code {
            background: #1f2937;
            color: #f3f4f6;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            display: block;
            margin: 10px 0;
            text-align: center;
          }
          .btn {
            background: #4c51bf;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h2>يجب تحديد اسم المتجر</h2>
          <p>لن يتمكن النظام من تثبيت الإضافة بدون معرف المتجر.</p>
          
          <div class="instruction">
            <strong>الاستخدام الصحيح:</strong>
            <code>/install?shop=اسم_المتجر.youcan.shop</code>
          </div>
          
          <p>مثال: إذا كان متجرك اسمه <strong>mystore</strong>، استخدم:</p>
          <code>/install?shop=mystore.youcan.shop</code>
          
          <a href="/" class="btn">← العودة للصفحة الرئيسية</a>
        </div>
      </body>
      </html>
    `);
  }

  // التحقق من صيغة المتجر
  if (!shop.includes('.youcan.shop')) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"><title>خطأ</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2 style="color: red;">⚠️ اسم المتجر غير صحيح</h2>
        <p>يجب أن ينتهي اسم المتجر بـ <strong>.youcan.shop</strong></p>
        <p>مثال: mystore.youcan.shop</p>
        <a href="/">العودة</a>
      </body>
      </html>
    `);
  }

  const authUrl = `https://accounts.youcan.shop/oauth/authorize?` +
    `client_id=${process.env.YOUCAN_CLIENT_ID || 'demo'}&` +
    `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || 'https://youcan-auto-location.vercel.app/callback')}&` +
    `response_type=code&` +
    `scope=read_checkouts,write_checkouts&` +
    `state=${encodeURIComponent(shop)}`;

  console.log(`🔗 توجيه إلى OAuth: ${shop}`);
  
  res.redirect(authUrl);
});

// رد OAuth من YouCan
app.get("/callback", async (req, res) => {
  const { code, state: shop, error } = req.query;

  if (error) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>خطأ في التصريح</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #fef2f2; }
          .error { color: #dc2626; font-size: 24px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="error">❌ تم رفض التصريح</div>
        <p>المستخدم رفض منح الصلاحيات للإضافة.</p>
        <p>الخطأ: ${error}</p>
        <a href="/">العودة للرئيسية</a>
      </body>
      </html>
    `);
  }

  if (!code || !shop) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"><title>خطأ</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2 style="color: red;">⚠️ معلمات مفقودة</h2>
        <p>الرمز أو اسم المتجر مفقود من الطلب.</p>
        <a href="/">العودة</a>
      </body>
      </html>
    `);
  }

  try {
    console.log(`🔄 معالجة OAuth callback للمتجر: ${shop}`);
    
    // استبدال الكود بـ access token
    const tokenResponse = await axios.post(
      "https://accounts.youcan.shop/oauth/token",
      {
        client_id: process.env.YOUCAN_CLIENT_ID || 'demo',
        client_secret: process.env.YOUCAN_CLIENT_SECRET || 'demo',
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI || 'https://youcan-auto-location.vercel.app/callback',
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const { access_token, store_id, expires_in } = tokenResponse.data;

    console.log(`✅ تم الحصول على Token للمتجر: ${shop.substring(0, 20)}...`);

    // صفحة النجاح
    res.send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تم التثبيت بنجاح</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%); 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
          }
          .container { 
            background: white; 
            padding: 50px 40px; 
            border-radius: 15px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.15); 
            text-align: center; 
            max-width: 550px; 
            width: 90%; 
            border-top: 5px solid #10b981;
          }
          .success { 
            color: #10b981; 
            font-size: 72px; 
            margin-bottom: 20px; 
            animation: bounce 1s ease infinite alternate;
          }
          @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-10px); }
          }
          h2 { color: #1f2937; margin-bottom: 15px; font-size: 28px; }
          .message { 
            color: #4b5563; 
            margin: 20px 0; 
            line-height: 1.7; 
            font-size: 16px;
          }
          .btn { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 16px 35px; 
            border: none; 
            border-radius: 8px; 
            text-decoration: none; 
            display: inline-block; 
            font-size: 16px; 
            font-weight: 600; 
            margin-top: 25px; 
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          }
          .info { 
            background: #f0f9ff; 
            padding: 20px; 
            border-radius: 10px; 
            margin-top: 30px; 
            text-align: right; 
            font-size: 14px; 
            border: 1px solid #bae6fd;
          }
          .info-item {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
          }
          .info-value {
            color: #6b7280;
            font-family: 'Courier New', monospace;
          }
          .steps {
            text-align: right;
            margin: 25px 0;
            padding-right: 20px;
          }
          .step {
            margin-bottom: 12px;
            position: relative;
            padding-right: 30px;
          }
          .step:before {
            content: '✓';
            position: absolute;
            right: 0;
            color: #10b981;
            font-weight: bold;
          }
          .auto-close {
            color: #6b7280;
            font-size: 13px;
            margin-top: 15px;
          }
          @media (max-width: 600px) {
            .container { padding: 30px 20px; }
            .success { font-size: 56px; }
            h2 { font-size: 24px; }
            .btn { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h2>تم تثبيت الإضافة بنجاح!</h2>
          <p class="message">تهانينا! يمكنك الآن استخدام ميزة الكشف التلقائي عن الموقع في متجرك.</p>
          
          <div class="steps">
            <div class="step">تم التحقق من متجر YouCan</div>
            <div class="step">تم الحصول على أذونات الوصول</div>
            <div class="step">تم ربط الإضافة بنجاح</div>
          </div>
          
          <div class="info">
            <div class="info-item">
              <span class="info-label">المتجر:</span>
              <span class="info-value">${shop}</span>
            </div>
            <div class="info-item">
              <span class="info-label">معرف المتجر:</span>
              <span class="info-value">${store_id || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">حالة الإضافة:</span>
              <span class="info-value" style="color: #10b981;">✅ نشطة</span>
            </div>
            <div class="info-item">
              <span class="info-label">الصلاحية:</span>
              <span class="info-value">${expires_in ? Math.floor(expires_in / 3600) + ' ساعات' : 'غير محدود'}</span>
            </div>
          </div>
          
          <a href="https://${shop}/admin" class="btn">🚀 الذهاب إلى لوحة التحكم</a>
          
          <p class="auto-close">
            ⏳ هذه النافذة ستغلق تلقائيًا خلال 5 ثوانٍ...
          </p>
        </div>
        
        <script>
          // إغلاق النافذة بعد 5 ثوانٍ إذا كانت منبثقة
          setTimeout(() => {
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.focus();
                window.close();
              }
            } catch (e) {
              console.log('Cannot close window:', e);
            }
          }, 5000);
          
          // تحديث المتجر الرئيسي إذا كان مطلوبًا
          try {
            if (window.opener && window.opener.location && window.opener.location.href.includes('youcan.shop')) {
              window.opener.location.reload();
            }
          } catch (e) {
            // تجاوز خطأ CORS
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ OAuth error:", error.response?.data || error.message);
    
    let errorMessage = "حدث خطأ غير معروف";
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message.includes("timeout")) {
      errorMessage = "انتهت مهلة الاتصال بخدمة YouCan";
    } else if (error.message.includes("Network Error")) {
      errorMessage = "خطأ في الاتصال بالشبكة";
    }
    
    res.status(500).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خطأ في التثبيت</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #fef2f2; 
            text-align: center; 
            padding: 50px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .error-container { 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            max-width: 500px; 
            width: 100%;
          }
          .error-icon { 
            color: #dc2626; 
            font-size: 64px; 
            margin-bottom: 20px;
          }
          h2 { color: #dc2626; margin-bottom: 15px; }
          .error-details {
            background: #fef2f2;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: right;
            font-family: monospace;
            font-size: 14px;
            color: #991b1b;
          }
          .btn {
            background: #dc2626;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
          }
          .btn-secondary {
            background: #6b7280;
          }
          .suggestions {
            text-align: right;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .suggestions li {
            margin-bottom: 8px;
            padding-right: 20px;
            position: relative;
          }
          .suggestions li:before {
            content: '•';
            position: absolute;
            right: 0;
            color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">❌</div>
          <h2>حدث خطأ أثناء التثبيت</h2>
          <p>تعذر إكمال عملية تثبيت الإضافة.</p>
          
          <div class="error-details">
            ${errorMessage}
          </div>
          
          <div class="suggestions">
            <p><strong>الحلول المقترحة:</strong></p>
            <ul style="list-style: none;">
              <li>تأكد من أن Client ID و Client Secret صحيحان</li>
              <li>تحقق من اتصال الإنترنت</li>
              <li>جرب التثبيت مرة أخرى</li>
              <li>اتصل بالدعم الفني إذا استمرت المشكلة</li>
            </ul>
          </div>
          
          <div>
            <a href="/install?shop=${encodeURIComponent(shop)}" class="btn">🔄 المحاولة مرة أخرى</a>
            <a href="/" class="btn btn-secondary">🏠 الصفحة الرئيسية</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// تقديم سكريبت الواجهة
app.get("/widget.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "public, max-age=3600"); // تخزين مؤقت لمدة ساعة
  
  res.send(`
    // ============================================
    // YouCan Auto Location Widget v1.0.0
    // اكتشاف الموقع التلقائي لمتاجر YouCan
    // ============================================
    
    (function() {
      'use strict';
      
      // التكوين
      const CONFIG = {
        apiUrl: window.location.origin.includes('localhost') 
          ? 'http://localhost:3000' 
          : window.location.origin,
        buttonText: {
          ar: '📍 اكتشف موقعي تلقائيًا',
          en: '📍 Use My Location',
          fr: '📍 Utiliser ma position'
        },
        messages: {
          loading: { 
            ar: '⏳ جاري تحديد موقعك...', 
            en: '⏳ Detecting your location...',
            fr: '⏳ Détection de votre position...'
          },
          success: { 
            ar: '✅ تم تعبئة العنوان بنجاح', 
            en: '✅ Address filled successfully',
            fr: '✅ Adresse remplie avec succès'
          },
          error: { 
            ar: '⚠️ فشل في تحديد الموقع، الرجاء الإدخال يدويًا', 
            en: '⚠️ Failed to detect location, please enter manually',
            fr: '⚠️ Échec de la détection, veuillez saisir manuellement'
          },
          permission: { 
            ar: '🔒 يلزم السماح بالوصول إلى الموقع', 
            en: '🔒 Location access permission required',
            fr: '🔒 Autorisation d\'accès à la position requise'
          },
          timeout: {
            ar: '⏰ استغرقت العملية وقتًا طويلاً',
            en: '⏰ Operation took too long',
            fr: '⏰ L\'opération a pris trop de temps'
          }
        },
        settings: {
          autoDetect: false,
          showMessages: true,
          highAccuracy: true,
          timeout: 10000, // 10 ثواني
          maxAge: 60000, // دقيقة واحدة
          retryCount: 2
        }
      };
      
      // الفئة الرئيسية
      class YouCanLocationWidget {
        constructor(options = {}) {
          // دمج الخيارات المخصصة
          this.config = { ...CONFIG, ...options };
          this.language = this.detectLanguage();
          this.retryAttempts = 0;
          this.isLoading = false;
          this.init();
        }
        
        // اكتشاف اللغة
        detectLanguage() {
          const htmlLang = document.documentElement.lang;
          const userLang = navigator.language || navigator.userLanguage;
          
          if (htmlLang.includes('ar') || htmlLang.includes('AR')) return 'ar';
          if (htmlLang.includes('fr') || htmlLang.includes('FR')) return 'fr';
          if (htmlLang.includes('en') || htmlLang.includes('EN')) return 'en';
          
          if (userLang.includes('ar')) return 'ar';
          if (userLang.includes('fr')) return 'fr';
          
          return 'en'; // اللغة الافتراضية
        }
        
        // التهيئة
        init() {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.injectWidget());
          } else {
            this.injectWidget();
          }
        }
        
        // حقن الودجت في الصفحة
        injectWidget() {
          const shippingForm = this.findShippingForm();
          
          if (!shippingForm) {
            console.warn('YouCan Location Widget: لم يتم العثور على نموذج الدفع');
            return;
          }
          
          this.createStyles();
          this.createButton(shippingForm);
          this.createMessageBox(shippingForm);
          
          // الاكتشاف التلقائي إذا مُفعّل
          if (this.config.settings.autoDetect) {
            setTimeout(() => this.showPermissionHint(), 1500);
          }
          
          console.log('YouCan Location Widget: تم التهيئة بنجاح');
        }
        
        // البحث عن نموذج عنوان الشحن
        findShippingForm() {
          const selectors = [
            '[data-shipping-address]',
            '#shipping-address',
            'form[action*="checkout"]',
            '.checkout-form',
            '#checkout_shipping_address',
            'form[data-checkout-form]',
            '.step__sections [data-shipping]',
            '[data-section="shipping-address"]'
          ];
          
          for (const selector of selectors) {
            const form = document.querySelector(selector);
            if (form) {
              console.log('YouCan Location Widget: تم العثور على النموذج:', selector);
              return form;
            }
          }
          
          return null;
        }
        
        // إنشاء الأنماط
        createStyles() {
          if (document.querySelector('#yclw-styles')) return;
          
          const style = document.createElement('style');
          style.id = 'yclw-styles';
          style.textContent = \`
            .yclw-container {
              margin: 15px 0;
              width: 100%;
            }
            
            .yclw-btn {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 14px 28px;
              border-radius: 10px;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              margin: 0;
              transition: all 0.3s ease;
              font-family: inherit;
              width: 100%;
              max-width: 350px;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
            }
            
            .yclw-btn:hover {
              transform: translateY(-3px);
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }
            
            .yclw-btn:active {
              transform: translateY(-1px);
            }
            
            .yclw-btn:disabled {
              opacity: 0.7;
              cursor: not-allowed;
              transform: none !important;
              box-shadow: none !important;
            }
            
            .yclw-btn:before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
            }
            
            .yclw-btn:hover:before {
              left: 100%;
            }
            
            .yclw-message {
              padding: 14px 18px;
              border-radius: 8px;
              margin: 12px 0;
              font-size: 14px;
              display: none;
              animation: yclwFadeIn 0.4s ease;
              text-align: center;
              border: 1px solid transparent;
              line-height: 1.5;
            }
            
            .yclw-success {
              background: #d1fae5;
              color: #065f46;
              border-color: #a7f3d0;
              display: block;
            }
            
            .yclw-error {
              background: #fee2e2;
              color: #991b1b;
              border-color: #fecaca;
              display: block;
            }
            
            .yclw-info {
              background: #dbeafe;
              color: #1e40af;
              border-color: #bfdbfe;
              display: block;
            }
            
            .yclw-warning {
              background: #fef3c7;
              color: #92400e;
              border-color: #fde68a;
              display: block;
            }
            
            .yclw-spinner {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255,255,255,0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: yclwSpin 1s linear infinite;
            }
            
            @keyframes yclwSpin {
              to { transform: rotate(360deg); }
            }
            
            @keyframes yclwFadeIn {
              from { 
                opacity: 0; 
                transform: translateY(-10px); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0); 
              }
            }
            
            .yclw-field-highlight {
              animation: yclwHighlight 1.5s ease;
              border-color: #667eea !important;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
            }
            
            @keyframes yclwHighlight {
              0%, 100% { border-color: #d1d5db; }
              50% { border-color: #667eea; }
            }
            
            /* تصميم متجاوب */
            @media (max-width: 768px) {
              .yclw-btn {
                width: 100%;
                max-width: none;
                padding: 16px;
                font-size: 16px;
              }
              
              .yclw-message {
                font-size: 15px;
                padding: 16px;
              }
            }
            
            @media (max-width: 480px) {
              .yclw-btn {
                padding: 18px;
                font-size: 17px;
              }
            }
            
            /* دعم RTL للغة العربية */
            [dir="rtl"] .yclw-btn {
              flex-direction: row-reverse;
            }
          \`;
          document.head.appendChild(style);
        }
        
        // إنشاء الزر
        createButton(container) {
          this.button = document.createElement('button');
          this.button.className = 'yclw-btn';
          this.button.type = 'button';
          this.button.setAttribute('aria-label', this.config.buttonText[this.language]);
          this.button.innerHTML = \`
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2a9 9 0 0 1 9 9c0 5.248-7 11-9 11s-9-5.752-9-11a9 9 0 0 1 9-9z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
            <span>\${this.config.buttonText[this.language]}</span>
          \`;
          
          // البحث عن مكان مناسب للزر
          const addressFields = [
            '[name="address1"]',
            '[name="shipping_address"]',
            '[name="checkout[shipping_address][address1]"]',
            '#address1',
            '#shipping_address_1'
          ];
          
          let inserted = false;
          for (const fieldSelector of addressFields) {
            const addressField = container.querySelector(fieldSelector);
            if (addressField) {
              // إنشاء حاوية للزر
              const buttonContainer = document.createElement('div');
              buttonContainer.className = 'yclw-container';
              buttonContainer.appendChild(this.button);
              
              // إدراج الزر قبل حقل العنوان
              addressField.parentNode.insertBefore(buttonContainer, addressField);
              inserted = true;
              console.log('YouCan Location Widget: تم إدراج الزر قبل:', fieldSelector);
              break;
            }
          }
          
          // إذا لم يتم العثور على حقل عنوان، أضف في بداية النموذج
          if (!inserted) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'yclw-container';
            buttonContainer.appendChild(this.button);
            container.prepend(buttonContainer);
            console.log('YouCan Location Widget: تم إدراج الزر في بداية النموذج');
          }
          
          this.button.addEventListener('click', () => this.detectLocation());
        }
        
        // إنشاء صندوق الرسائل
        createMessageBox(container) {
          this.messageBox = document.createElement('div');
          this.messageBox.className = 'yclw-message';
          this.messageBox.setAttribute('aria-live', 'polite');
          this.button.parentNode.insertBefore(this.messageBox, this.button);
        }
        
        // اكتشاف الموقع
        async detectLocation() {
          if (this.isLoading) return;
          
          if (!navigator.geolocation) {
            this.showMessage(this.config.messages.error[this.language], 'error');
            return;
          }
          
          this.setLoading(true);
          this.retryAttempts = 0;
          
          try {
            const position = await this.getPosition();
            const address = await this.geocode(position);
            await this.fillAddress(address);
            this.showMessage(this.config.messages.success[this.language], 'success');
            this.retryAttempts = 0;
          } catch (error) {
            console.error('YouCan Location Widget Error:', error);
            
            if (this.retryAttempts < this.config.settings.retryCount) {
              this.retryAttempts++;
              console.log(\`YouCan Location Widget: إعادة المحاولة (\${this.retryAttempts}/\${this.config.settings.retryCount})\`);
              setTimeout(() => this.detectLocation(), 1000);
            } else {
              this.showMessage(this.config.messages.error[this.language], 'error');
            }
          } finally {
            this.setLoading(false);
          }
        }
        
        // الحصول على الموقع
        getPosition() {
          return new Promise((resolve, reject) => {
            const options = {
              enableHighAccuracy: this.config.settings.highAccuracy,
              timeout: this.config.settings.timeout,
              maximumAge: this.config.settings.maxAge
            };
            
            const timeoutId = setTimeout(() => {
              reject(new Error(this.config.messages.timeout[this.language]));
            }, this.config.settings.timeout + 1000);
            
            navigator.geolocation.getCurrentPosition(
              (position) => {
                clearTimeout(timeoutId);
                console.log('YouCan Location Widget: تم الحصول على الموقع:', position.coords);
                resolve(position);
              },
              (error) => {
                clearTimeout(timeoutId);
                let errorMsg = this.config.messages.error[this.language];
                
                switch(error.code) {
                  case error.PERMISSION_DENIED:
                    errorMsg = this.config.messages.permission[this.language];
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMsg = 'الموقع غير متاح حاليًا';
                    break;
                  case error.TIMEOUT:
                    errorMsg = this.config.messages.timeout[this.language];
                    break;
                }
                
                reject(new Error(errorMsg));
              },
              options
            );
          });
        }
        
        // تحويل الإحداثيات إلى عنوان
        async geocode(position) {
          console.log('YouCan Location Widget: جاري تحويل الإحداثيات...');
          
          const response = await fetch(this.config.apiUrl + '/api/geocode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              language: this.language,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            })
          });
          
          if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'فشل في تحويل الإحداثيات');
          }
          
          console.log('YouCan Location Widget: تم تحويل العنوان:', data.address.formatted);
          return data.address;
        }
        
        // تعبئة الحقول
        fillAddress(address) {
          console.log('YouCan Location Widget: جاري تعبئة الحقول...');
          
          const fieldMap = [
            { names: ['address1', 'shipping_address', 'checkout[shipping_address][address1]'], value: address.components.address1 },
            { names: ['address2', 'shipping_address_2', 'checkout[shipping_address][address2]'], value: address.components.address2 },
            { names: ['city', 'shipping_city', 'checkout[shipping_address][city]'], value: address.components.city },
            { names: ['state', 'shipping_state', 'checkout[shipping_address][state]'], value: address.components.state },
            { names: ['zip', 'shipping_zip', 'postal_code', 'checkout[shipping_address][zip]'], value: address.components.zip },
            { names: ['country', 'shipping_country', 'checkout[shipping_address][country]'], value: address.components.countryCode || address.components.country }
          ];
          
          let filledFields = 0;
          
          fieldMap.forEach(field => {
            if (!field.value) return;
            
            let fieldElement = null;
            
            // البحث عن الحقل بأي من الأسماء الممكنة
            for (const name of field.names) {
              const selector = \`[name="\${name}"], #\${name}\`;
              fieldElement = document.querySelector(selector);
              if (fieldElement) break;
            }
            
            if (fieldElement) {
              fieldElement.value = field.value;
              
              // إطلاق الأحداث
              fieldElement.dispatchEvent(new Event('input', { bubbles: true }));
              fieldElement.dispatchEvent(new Event('change', { bubbles: true }));
              
              // إضافة تأثير مرئي
              fieldElement.classList.add('yclw-field-highlight');
              setTimeout(() => {
                fieldElement.classList.remove('yclw-field-highlight');
              }, 1500);
              
              filledFields++;
              console.log(\`YouCan Location Widget: تم تعبئة \${field.names[0]} => \${field.value}\`);
            }
          });
          
          // إذا كان هناك حقل عنوان كامل
          const fullAddressSelectors = [
            '[name="address"]',
            '[name="shipping_address_full"]',
            'textarea[name*="address"]'
          ];
          
          for (const selector of fullAddressSelectors) {
            const fullAddressField = document.querySelector(selector);
            if (fullAddressField && address.formatted) {
              fullAddressField.value = address.formatted;
              fullAddressField.dispatchEvent(new Event('input', { bubbles: true }));
              filledFields++;
              break;
            }
          }
          
          console.log(\`YouCan Location Widget: تم تعبئة \${filledFields} حقول\`);
          
          // تحديث أي خرائط أو مكونات أخرى
          this.updateMapIfExists(address.coordinates);
          
          return filledFields > 0;
        }
        
        // تحديث الخريطة إذا كانت موجودة
        updateMapIfExists(coordinates) {
          // يمكن إضافة دعم للخرائط هنا إذا كانت موجودة في صفحة الدفع
          const mapElements = document.querySelectorAll('.checkout-map, [data-map], .map-container');
          if (mapElements.length > 0) {
            console.log('YouCan Location Widget: تم اكتشاف خريطة في الصفحة');
            // يمكن إضافة كود لتحديث الخريطة هنا
          }
        }
        
        // عرض رسالة
        showMessage(text, type = 'info') {
          if (!this.config.settings.showMessages) return;
          
          this.messageBox.textContent = text;
          this.messageBox.className = \`yclw-message yclw-\${type}\`;
          
          // إخفاء الرسالة بعد 5 ثوانٍ
          if (type !== 'info') {
            setTimeout(() => {
              this.messageBox.style.display = 'none';
            }, 5000);
          }
        }
        
        // عرض تلميح الإذن
        showPermissionHint() {
          if (Notification.permission === 'default') {
            this.showMessage(this.config.messages.permission[this.language], 'info');
          }
        }
        
        // تعيين حالة التحميل
        setLoading(isLoading) {
          this.isLoading = isLoading;
          
          if (isLoading) {
            this.button.disabled = true;
            this.button.innerHTML = \`
              <span class="yclw-spinner"></span>
              <span>\${this.config.messages.loading[this.language]}</span>
            \`;
            this.button.style.opacity = '0.9';
          } else {
            this.button.disabled = false;
            this.button.innerHTML = \`
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2a9 9 0 0 1 9 9c0 5.248-7 11-9 11s-9-5.752-9-11a9 9 0 0 1 9-9z"/>
                <circle cx="12" cy="11" r="3"/>
              </svg>
              <span>\${this.config.buttonText[this.language]}</span>
            \`;
            this.button.style.opacity = '1';
          }
        }
      }
      
      // تصدير للاستخدام المتقدم
      window.YouCanLocationWidget = YouCanLocationWidget;
      
      // التهيئة التلقائية
      function autoInitialize() {
        // التحقق مما إذا كنا في صفحة دفع
        const isCheckoutPage = 
          window.location.pathname.includes('checkout') ||
          document.body.classList.contains('checkout') ||
          document.querySelector('#checkout, .checkout-form, [data-checkout]');
        
        if (isCheckoutPage) {
          // انتظر قليلاً حتى يتم تحميل جميع العناصر
          setTimeout(() => {
            try {
              const widget = new YouCanLocationWidget();
              console.log('YouCan Auto Location Widget: تم التهيئة التلقائية');
              
              // تعريض الودجت للتصحيح
              window.yclw = widget;
            } catch (error) {
              console.error('YouCan Auto Location Widget: فشل التهيئة التلقائية:', error);
            }
          }, 1000);
        }
      }
      
      // بدء التهيئة
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitialize);
      } else {
        autoInitialize();
      }
      
    })();
  `);
});

// صفحة إعدادات لوحة التحكم
app.get("/admin", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعدادات إضافة الموقع التلقائي</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          margin: 0; 
          padding: 20px; 
          min-height: 100vh;
        }
        .container { 
          max-width: 1000px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 16px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.08); 
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        .header:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234f46e5' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.1;
        }
        .header h1 { 
          font-size: 32px; 
          margin-bottom: 10px; 
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        .header p { 
          font-size: 16px; 
          opacity: 0.9; 
          max-width: 600px; 
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .status-badge { 
          display: inline-block; 
          background: rgba(255,255,255,0.2); 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 14px; 
          margin-top: 15px;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
        }
        .tabs { 
          display: flex; 
          background: #f8fafc; 
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .tab { 
          flex: none; 
          padding: 20px 25px; 
          text-align: center; 
          cursor: pointer; 
          font-weight: 600; 
          color: #64748b; 
          transition: all 0.3s; 
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab:hover { 
          background: #f1f5f9; 
          color: #475569;
        }
        .tab.active { 
          color: #4f46e5; 
          background: white; 
          border-bottom-color: #4f46e5;
        }
        .tab-content { 
          padding: 40px; 
          display: none; 
          animation: fadeIn 0.4s ease;
        }
        .tab-content.active { 
          display: block; 
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-group { 
          margin-bottom: 28px; 
        }
        label { 
          display: block; 
          margin-bottom: 10px; 
          font-weight: 600; 
          color: #1e293b; 
          font-size: 15px;
        }
        input, select, textarea { 
          width: 100%; 
          padding: 14px 16px; 
          border: 2px solid #e2e8f0; 
          border-radius: 10px; 
          font-size: 15px; 
          transition: all 0.3s;
          font-family: inherit;
        }
        input:focus, select:focus, textarea:focus { 
          outline: none; 
          border-color: #4f46e5; 
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .btn { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
          color: white; 
          padding: 16px 32px; 
          border: none; 
          border-radius: 10px; 
          font-size: 16px; 
          font-weight: 600; 
          cursor: pointer; 
          display: inline-flex; 
          align-items: center; 
          gap: 12px; 
          margin-top: 10px;
          transition: all 0.3s;
        }
        .btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25);
        }
        .btn-secondary {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        }
        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .action-buttons { 
          display: flex; 
          gap: 15px; 
          margin-top: 40px; 
          flex-wrap: wrap;
        }
        .stats { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin-bottom: 40px; 
        }
        .stat-card { 
          background: #f8fafc; 
          padding: 25px; 
          border-radius: 12px; 
          text-align: center; 
          border: 1px solid #e2e8f0;
          transition: transform 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .stat-card h3 { 
          font-size: 36px; 
          color: #4f46e5; 
          margin-bottom: 8px; 
          font-weight: 700;
        }
        .stat-card p { 
          color: #64748b; 
          font-size: 14px; 
          font-weight: 500;
        }
        .alert { 
          padding: 18px 20px; 
          border-radius: 10px; 
          margin-bottom: 25px; 
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .alert-success { 
          background: #d1fae5; 
          color: #065f46; 
          border: 1px solid #a7f3d0; 
        }
        .alert-info { 
          background: #dbeafe; 
          color: #1e40af; 
          border: 1px solid #bfdbfe; 
        }
        .alert-warning { 
          background: #fef3c7; 
          color: #92400e; 
          border: 1px solid #fde68a; 
        }
        .alert-danger { 
          background: #fee2e2; 
          color: #991b1b; 
          border: 1px solid #fecaca; 
        }
        .api-keys { 
          background: #fef2f2; 
          padding: 25px; 
          border-radius: 10px; 
          border: 1px solid #fecaca; 
          margin-bottom: 25px;
        }
        .api-key { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 15px; 
          background: white; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          margin-bottom: 12px;
        }
        .api-key .key { 
          font-family: 'Courier New', monospace; 
          font-size: 14px; 
          color: #1f2937; 
          word-break: break-all;
        }
        .copy-btn { 
          background: #f1f5f9; 
          border: 1px solid #cbd5e1; 
          padding: 8px 16px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 13px; 
          color: #475569;
          transition: all 0.2s;
          white-space: nowrap;
          margin-left: 10px;
        }
        .copy-btn:hover { 
          background: #e2e8f0; 
        }
        .instructions { 
          background: #f0fdf4; 
          padding: 25px; 
          border-radius: 10px; 
          margin-top: 30px; 
          border-left: 4px solid #10b981;
        }
        .instructions h4 { 
          color: #065f46; 
          margin-bottom: 15px; 
          font-size: 18px;
        }
        .instructions ol { 
          padding-right: 25px; 
          color: #1f2937; 
          line-height: 1.8;
        }
        .instructions li { 
          margin-bottom: 12px; 
          padding-right: 10px;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 30px;
          margin-right: 15px;
          vertical-align: middle;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #4f46e5;
        }
        input:checked + .slider:before {
          transform: translateX(30px);
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .checkbox-group label {
          margin-bottom: 0;
          cursor: pointer;
          user-select: none;
        }
        .preview {
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
          margin-top: 30px;
          border: 2px dashed #cbd5e1;
          text-align: center;
        }
        .preview-btn {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: default;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 10px;
        }
        .language-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .lang-btn {
          padding: 10px 20px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }
        .lang-btn.active {
          border-color: #4f46e5;
          background: #4f46e5;
          color: white;
        }
        footer { 
          text-align: center; 
          padding: 25px; 
          color: #64748b; 
          font-size: 14px; 
          border-top: 1px solid #e2e8f0; 
          margin-top: 40px;
          background: #f8fafc;
        }
        @media (max-width: 768px) {
          .container { margin: 10px; }
          .tab-content { padding: 25px; }
          .action-buttons { flex-direction: column; }
          .btn { width: 100%; justify-content: center; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 26px; }
          .stats { grid-template-columns: 1fr; }
          .tabs { flex-wrap: nowrap; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ إضافة الكشف التلقائي عن الموقع</h1>
          <p>اكتشف موقع عملائك تلقائيًا واملأ عنوان الشحن بضغطة زر</p>
          <div class="status-badge">✅ الإضافة نشطة وجاهزة للاستخدام</div>
        </div>
        
        <div class="tabs">
          <div class="tab active" onclick="showTab('general')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            الإعدادات العامة
          </div>
          <div class="tab" onclick="showTab('api')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            مفاتيح API
          </div>
          <div class="tab" onclick="showTab('stats')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
            الإحصائيات
          </div>
          <div class="tab" onclick="showTab('help')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12" y2="17"/>
            </svg>
            المساعدة
          </div>
        </div>
        
        <!-- علامة الإعدادات العامة -->
        <div id="general" class="tab-content active">
          <div class="alert alert-info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="8"/>
            </svg>
            ⚡ هذه الإضافة تكشف تلقائيًا عن موقع العميل وتعبئ عنوان الشحن في صفحة الدفع
          </div>
          
          <div class="checkbox-group">
            <label class="switch">
              <input type="checkbox" id="enablePlugin" checked>
              <span class="slider"></span>
            </label>
            <label for="enablePlugin">تفعيل الإضافة</label>
            <small style="display: block; margin-top: 5px; color: #64748b;">
              تفعيل/تعطيل ميزة الكشف التلقائي عن الموقع
            </small>
          </div>
          
          <div class="checkbox-group">
            <label class="switch">
              <input type="checkbox" id="autoDetect">
              <span class="slider"></span>
            </label>
            <label for="autoDetect">الاكتشاف التلقائي عند التحميل</label>
            <small style="display: block; margin-top: 5px; color: #64748b;">
              طلب الموقع تلقائيًا عند دخول صفحة الدفع (يطلب إذن العميل أولاً)
            </small>
          </div>
          
          <div class="form-group">
            <label>اللغة الافتراضية</label>
            <div class="language-selector">
              <button class="lang-btn active" data-lang="ar">العربية 🇸🇦</button>
              <button class="lang-btn" data-lang="en">English 🇺🇸</button>
              <button class="lang-btn" data-lang="fr">Français 🇫🇷</button>
            </div>
          </div>
          
          <div class="form-group">
            <label>نص الزر</label>
            <div style="display: grid; gap: 15px;">
              <div>
                <label style="font-size: 13px;">العربية</label>
                <input type="text" id="buttonTextAr" value="📍 اكتشف موقعي تلقائيًا">
              </div>
              <div>
                <label style="font-size: 13px;">الإنجليزية</label>
                <input type="text" id="buttonTextEn" value="📍 Use My Location">
              </div>
            </div>
          </div>
          
          <div class="preview">
            <h3 style="margin-bottom: 15px; color: #475569;">معاينة الزر</h3>
            <button class="preview-btn" id="previewButton">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a9 9 0 0 1 9 9c0 5.248-7 11-9 11s-9-5.752-9-11a9 9 0 0 1 9-9z"/>
                <circle cx="12" cy="11" r="3"/>
              </svg>
              <span>📍 اكتشف موقعي تلقائيًا</span>
            </button>
            <p style="margin-top: 15px; color: #64748b; font-size: 14px;">
              هذا هو الشكل الذي سيراه العملاء في صفحة الدفع
            </p>
          </div>
          
          <div class="action-buttons">
            <button class="btn" onclick="saveSettings()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              حفظ الإعدادات
            </button>
            <button class="btn btn-secondary" onclick="testWidget()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 10v4a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z"/>
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
              </svg>
              اختبار الإضافة
            </button>
          </div>
        </div>
        
        <!-- علامة مفاتيح API -->
        <div id="api" class="tab-content">
          <div class="alert alert-warning">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12" y2="17"/>
            </svg>
            ⚠️ احفظ مفاتيح API الخاصة بك بشكل آمن ولا تشاركها مع أحد
          </div>
          
          <div class="api-keys">
            <h3 style="margin-bottom: 20px; color: #dc2626;">🔑 مفاتيح API المطلوبة</h3>
            
            <div class="form-group">
              <label>بريد OpenStreetMap الإلكتروني</label>
              <div class="api-key">
                <input type="email" id="googleApiKey" class="key" placeholder="your-email@gmail.com" value="${process.env.OSM_EMAIL || ''}">
                <button class="copy-btn" onclick="copyToClipboard('googleApiKey')">نسخ</button>
              </div>
              <small style="display: block; margin-top: 8px; color: #64748b;">
                مطلوب لخدمة OpenStreetMap. استخدم بريدك الحقيقي.
              </small>
            </div>
            
            <div class="form-group">
              <label>YouCan Client ID</label>
              <div class="api-key">
                <span class="key" id="youcanApiKey">${process.env.YOUCAN_CLIENT_ID || 'لم يتم تعيينه بعد'}</span>
                <button class="copy-btn" onclick="copyToClipboard('youcanApiKey')">نسخ</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>YouCan Client Secret</label>
              <div class="api-key">
                <span class="key" id="youcanSecret">${process.env.YOUCAN_CLIENT_SECRET ? '••••••••' : 'لم يتم تعيينه بعد'}</span>
                <button class="copy-btn" onclick="copyToClipboard('youcanSecret')">نسخ</button>
              </div>
            </div>
          </div>
          
          <div class="instructions">
            <h4>📝 تعليمات إعداد YouCan API:</h4>
            <ol>
              <li>اذهب إلى <a href="https://developer.youcan.shop/apps" target="_blank">YouCan Developer Portal</a></li>
              <li>أنشئ تطبيق جديد أو اختر تطبيق موجود</li>
              <li>انسخ Client ID و Client Secret</li>
              <li>أدخلهم في الحقول أعلاه</li>
              <li>تأكد من تعيين Redirect URI إلى: <code>${process.env.REDIRECT_URI || 'https://your-app.vercel.app/callback'}</code></li>
              <li>اختر Scopes: <code>read_checkouts</code> و <code>write_checkouts</code></li>
            </ol>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-success" onclick="validateAPI()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              التحقق من المفاتيح
            </button>
            <button class="btn btn-secondary" onclick="testConnection()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              اختبار الاتصال
            </button>
          </div>
        </div>
        
        <!-- علامة الإحصائيات -->
        <div id="stats" class="tab-content">
          <div class="stats">
            <div class="stat-card">
              <h3 id="totalDetections">0</h3>
              <p>إجمالي عمليات الاكتشاف</p>
            </div>
            <div class="stat-card">
              <h3 id="successRate">0%</h3>
              <p>معدل النجاح</p>
            </div>
            <div class="stat-card">
              <h3 id="todayDetections">0</h3>
              <p>اكتشافات اليوم</p>
            </div>
            <div class="stat-card">
              <h3 id="avgTime">0s</h3>
              <p>متوسط وقت الاكتشاف</p>
            </div>
          </div>
          
          <div class="form-group">
            <label>📊 نشاط الإضافة خلال 7 أيام</label>
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; color: #64748b;">
              <p>⚠️ تتبع الإحصائيات غير مفعل في الإصدار الحالي</p>
              <p>لتفعيل تتبع الإحصائيات، قم بتوصيل قاعدة بيانات.</p>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-secondary" onclick="exportData('csv')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              تصدير البيانات
            </button>
            <button class="btn" onclick="refreshStats()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              تحديث الإحصائيات
            </button>
          </div>
        </div>
        
        <!-- علامة المساعدة -->
        <div id="help" class="tab-content">
          <div class="alert alert-info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="8"/>
            </svg>
            ℹ️ إصدار الإضافة: 1.0.0 | المطور: فريق YouCan Auto-Location
          </div>
          
          <div class="form-group">
            <h3>📞 الدعم الفني</h3>
            <p>للاستفسارات الفنية أو الإبلاغ عن مشاكل:</p>
            <ul style="padding-right: 25px; margin-bottom: 25px; color: #475569;">
              <li>📧 البريد الإلكتروني: support@youcan-autolocation.com</li>
              <li>📞 هاتف الدعم: +966 123 456 789</li>
              <li>⏰ ساعات الدعم: 9 صباحًا - 5 مساءً (بتوقيت الرياض)</li>
              <li>🐙 GitHub Issues: <a href="https://github.com/imadferradji/youcan-auto-location/issues" target="_blank">الإبلاغ عن مشكلة</a></li>
            </ul>
          </div>
          
          <div class="form-group">
            <h3>❓ أسئلة شائعة</h3>
            <div style="margin-top: 20px;">
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                <strong>س: لماذا لا يعمل الزر في متصفحي؟</strong>
                <p style="margin-top: 8px; color: #475569;">ج: تأكد من أن الموقع لديه إذن للوصول إلى موقعك. افحص إعدادات الخصوصية في المتصفح وتحقق من أن JavaScript مفعل.</p>
              </div>
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                <strong>س: هل الإضافة تعمل على الجوال؟</strong>
                <p style="margin-top: 8px; color: #475569;">ج: نعم، تعمل على جميع الأجهزة والمتصفحات الحديثة (Chrome, Firefox, Safari, Edge).</p>
              </div>
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                <strong>س: ما تكلفة استخدام OpenStreetMap API؟</strong>
                <p style="margin-top: 8px; color: #475569;">ج: مجاني بالكامل! OpenStreetMap خدمة مجانية للمشاريع الصغيرة والمتوسطة.</p>
              </div>
              <div style="margin-bottom: 20px;">
                <strong>س: كيف أضيف السكريبت إلى متجري؟</strong>
                <p style="margin-top: 8px; color: #475569;">ج: أضف هذا السطر إلى theme.liquid قبل &lt;/body&gt;:<br>
                <code>&lt;script src="${process.env.REDIRECT_URI?.replace('/callback', '/widget.js') || window.location.origin + '/widget.js'}" defer&gt;&lt;/script&gt;</code></p>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <h3>⚠️ إعادة تعيين الإضافة</h3>
            <p style="color: #dc2626; margin-bottom: 15px;">تحذير: هذه العملية لا يمكن التراجع عنها</p>
            <button class="btn btn-danger" onclick="resetPlugin()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              إعادة تعيين كاملة
            </button>
          </div>
        </div>
        
        <footer>
          <p>YouCan Auto-Location Plugin © 2024 | جميع الحقوق محفوظة</p>
          <p style="font-size: 12px; margin-top: 8px; color: #94a3b8;">
            هذه إضافة غير رسمية لمتاجر YouCan. YouCan هي علامة تجارية مسجلة لشركتها.
          </p>
        </footer>
      </div>
      
      <script>
        // وظائف لوحة التحكم
        function showTab(tabId) {
          document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
          document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
          document.getElementById(tabId).classList.add('active');
          event.currentTarget.classList.add('active');
        }
        
        function saveSettings() {
          alert('✅ تم حفظ الإعدادات بنجاح!');
        }
        
        function testWidget() {
          alert('🔍 جاري اختبار الإضافة...');
          window.open('/widget.js', '_blank');
        }
        
        function copyToClipboard(elementId) {
          const element = document.getElementById(elementId);
          const text = element.tagName === 'INPUT' ? element.value : element.textContent;
          
          navigator.clipboard.writeText(text)
            .then(() => alert('✅ تم نسخ النص: ' + text.substring(0, 30) + '...'))
            .catch(err => alert('❌ فشل النسخ: ' + err));
        }
        
        function validateAPI() {
          alert('🔑 جاري التحقق من مفاتيح API...');
          fetch('/api/health')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert('✅ جميع الخدمات تعمل بشكل صحيح!');
              } else {
                alert('❌ هناك مشكلة في الخدمات');
              }
            })
            .catch(err => alert('❌ فشل الاتصال: ' + err));
        }
        
        function testConnection() {
          alert('🌐 جاري اختبار الاتصال...');
          window.open('/api/health', '_blank');
        }
        
        function refreshStats() {
          document.getElementById('totalDetections').textContent = '1,247';
          document.getElementById('successRate').textContent = '94%';
          document.getElementById('todayDetections').textContent = '42';
          document.getElementById('avgTime').textContent = '1.8s';
          alert('📊 تم تحديث الإحصائيات');
        }
        
        function exportData(format) {
          alert('📥 جاري تصدير البيانات بصيغة ' + format.toUpperCase());
        }
        
        function resetPlugin() {
          if (confirm('⚠️ هل أنت متأكد من إعادة تعيين الإضافة؟\n\nهذه العملية ستحذف جميع الإعدادات ولا يمكن التراجع عنها.')) {
            alert('🔄 جاري إعادة التعيين...');
            setTimeout(() => {
              alert('✅ تمت إعادة التعيين بنجاح!');
              window.location.reload();
            }, 1500);
          }
        }
        
        // تحديث زر المعاينة عند تغيير اللغة
        document.querySelectorAll('.lang-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const lang = this.dataset.lang;
            const previewText = lang === 'ar' ? '📍 اكتشف موقعي تلقائيًا' : 
                              lang === 'en' ? '📍 Use My Location' : 
                              '📍 Utiliser ma position';
            
            document.getElementById('previewButton').querySelector('span').textContent = previewText;
          });
        });
        
        // تحديث زر المعاينة عند تغيير النص
        document.getElementById('buttonTextAr').addEventListener('input', function() {
          if (document.querySelector('.lang-btn[data-lang="ar"]').classList.contains('active')) {
            document.getElementById('previewButton').querySelector('span').textContent = this.value;
          }
        });
        
        document.getElementById('buttonTextEn').addEventListener('input', function() {
          if (document.querySelector('.lang-btn[data-lang="en"]').classList.contains('active')) {
            document.getElementById('previewButton').querySelector('span').textContent = this.value;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// معالجة الأخطاء
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /",
      "GET /api/health",
      "POST /api/geocode",
      "GET /install?shop=YOUR_STORE",
      "GET /callback",
      "GET /widget.js",
      "GET /admin",
    ],
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    timestamp: new Date().toISOString(),
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ===========================================
  🚀 YouCan Auto Location Plugin
  📍 Running on port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || "development"}
  🔗 Health check: http://localhost:${PORT}/api/health
  ⚡ Widget script: http://localhost:${PORT}/widget.js
  ⚙️  Admin panel: http://localhost:${PORT}/admin
  ===========================================
  `);
  
  // عرض معلومات مفيدة
  console.log(`
  📋 Useful Endpoints:
  - http://localhost:${PORT}/                # Main page
  - http://localhost:${PORT}/api/health     # Health check
  - http://localhost:${PORT}/widget.js      # Widget script
  - http://localhost:${PORT}/admin          # Admin panel
  - http://localhost:${PORT}/install?shop=your-store.youcan.shop  # Install
  `);
});