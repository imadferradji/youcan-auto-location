/**
 * YouCan Auto Location Widget - Development Version
 * هذا الملف للتنمية والاختبار فقط
 * النسخة النهائية موجودة في backend/server.js تحت /widget.js
 */

console.log('🔧 YouCan Auto Location Widget - Development Mode');

// فئة تطويرية للاختبار
class DevLocationWidget {
  constructor(options = {}) {
    this.options = {
      apiUrl: options.apiUrl || 'http://localhost:3000',
      debug: options.debug !== false,
      ...options
    };
    
    this.init();
  }
  
  init() {
    console.log('Dev widget initialized with options:', this.options);
    
    // اختبار الاتصال بالخادم
    this.testConnection();
    
    // إضافة زر اختبار للصفحة
    this.addTestButton();
  }
  
  async testConnection() {
    try {
      const response = await fetch(`${this.options.apiUrl}/api/health`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Connection successful:', data);
      } else {
        console.warn('⚠️ Connection issue:', data);
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
    }
  }
  
  addTestButton() {
    // إنشاء زر اختبار فقط في بيئة التطوير
    if (this.options.debug && document.body) {
      const testBtn = document.createElement('button');
      testBtn.textContent = '🧪 Test Location';
      testBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 9999;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      
      testBtn.addEventListener('click', () => this.runTest());
      document.body.appendChild(testBtn);
      
      console.log('Test button added to page');
    }
  }
  
  async runTest() {
    console.log('🧪 Running location test...');
    
    try {
      // اختبار geolocation
      if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
      }
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      console.log('📍 Position obtained:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy + 'm'
      });
      
      // اختبار geocoding
      const geoResponse = await fetch(`${this.options.apiUrl}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          language: 'ar'
        })
      });
      
      const geoData = await geoResponse.json();
      
      if (geoData.success) {
        console.log('✅ Geocoding successful:', geoData.address);
        alert(`📍 Address found: ${geoData.address.formatted}`);
      } else {
        console.error('❌ Geocoding failed:', geoData);
        alert('Geocoding failed: ' + geoData.error);
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      alert('Test failed: ' + error.message);
    }
  }
  
  // محاكاة زر YouCan الحقيقي
  simulateYouCanButton() {
    const mockButton = document.createElement('button');
    mockButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a9 9 0 0 1 9 9c0 5.248-7 11-9 11s-9-5.752-9-11a9 9 0 0 1 9-9z"/>
        <circle cx="12" cy="11" r="3"/>
      </svg>
      <span>📍 Test Auto Location</span>
    `;
    
    mockButton.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 20px;
      transition: all 0.3s;
    `;
    
    mockButton.addEventListener('click', () => this.runTest());
    
    // إضافة إلى الصفحة إذا كان هناك نموذج
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      forms[0].prepend(mockButton);
      console.log('Mock button added to form');
    }
  }
}

// التصدير للاستخدام في وحدة التحكم
if (typeof window !== 'undefined') {
  window.DevLocationWidget = DevLocationWidget;
  
  // التهيئة التلقائية في بيئة التطوير
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const devWidget = new DevLocationWidget({
          debug: true,
          apiUrl: 'http://localhost:3000'
        });
        
        // محاكاة زر YouCan
        devWidget.simulateYouCanButton();
        
        // تعريض للتصحيح
        window.yclwDev = devWidget;
        
        console.log('🧪 Development widget ready. Use window.yclwDev to access.');
      }, 1000);
    });
  }
}

// وظائف مساعدة للتنمية
const DevTools = {
  // اختبار تحديد الموقع
  testGeolocation: function() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  },
  
  // اختبار geocoding
  testGeocoding: async function(lat, lng, language = 'ar') {
    const response = await fetch('http://localhost:3000/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, language })
    });
    return response.json();
  },
  
  // محاكاة حقل عنوان YouCan
  createMockForm: function() {
    const form = document.createElement('form');
    form.innerHTML = `
      <div style="padding: 20px; border: 2px dashed #ccc; border-radius: 10px; max-width: 500px; margin: 20px auto;">
        <h3 style="color: #333;">🧪 YouCan Checkout Mock Form</h3>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Address Line 1</label>
          <input type="text" name="address1" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="Street address">
        </div>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">City</label>
          <input type="text" name="city" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="City">
        </div>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">State/Province</label>
          <input type="text" name="state" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="State">
        </div>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">ZIP/Postal Code</label>
          <input type="text" name="zip" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="ZIP code">
        </div>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Country</label>
          <input type="text" name="country" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="Country">
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          This is a mock form for testing the YouCan Location Widget.
          The real widget will look for similar field names in your actual checkout form.
        </p>
      </div>
    `;
    
    document.body.appendChild(form);
    return form;
  },
  
  // تحميل النسخة الحية من السكريبت
  loadLiveWidget: function() {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/widget.js';
    script.defer = true;
    document.head.appendChild(script);
    
    console.log('📜 Live widget script loaded');
    return script;
  }
};

// تصدير أدوات التنمية
if (typeof window !== 'undefined') {
  window.YouCanDevTools = DevTools;
  
  // رسالة ترحيب
  console.log(`
  ===========================================
  🛠️  YouCan Location Widget - Development Tools
  ===========================================
  Available commands:
  
  📍 Test geolocation:
    YouCanDevTools.testGeolocation()
      .then(pos => console.log('Position:', pos.coords))
  
  🗺️ Test geocoding:
    YouCanDevTools.testGeocoding(24.7136, 46.6753, 'ar')
      .then(data => console.log('Address:', data.address))
  
  📝 Create mock form:
    YouCanDevTools.createMockForm()
  
  📜 Load live widget:
    YouCanDevTools.loadLiveWidget()
  
  🔧 Development widget:
    const devWidget = new DevLocationWidget()
    devWidget.runTest()
  ===========================================
  `);
}

// كود استشاري للمطورين
console.log(`
💡 Tips for YouCan Widget Development:

1. Field Detection:
   The widget looks for these field names:
   - address1, shipping_address
   - city, shipping_city
   - state, shipping_state
   - zip, postal_code
   - country, shipping_country

2. Testing:
   - Use the mock form to test field mapping
   - Check browser console for debug messages
   - Test on actual YouCan checkout pages

3. Deployment:
   - The final widget is served from /widget.js
   - Minify and optimize before production
   - Test with real YouCan stores

4. Integration:
   Add this to your YouCan store's theme.liquid:
   <script src="YOUR_APP_URL/widget.js" defer></script>
`);