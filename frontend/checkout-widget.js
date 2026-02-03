// نسخة مبسطة للبدء
(function() {
  'use strict';
  
  const config = {
    apiUrl: window.location.origin + '/api/geocode',
    buttonText: {
      ar: '📍 اكتشف موقعي تلقائيًا',
      en: '📍 Use My Location'
    },
    messages: {
      loading: { ar: 'جاري تحديد موقعك...', en: 'Detecting your location...' },
      success: { ar: '✅ تم تعبئة العنوان', en: '✅ Address filled' },
      error: { ar: '⚠️ الرجاء إدخال العنوان يدويًا', en: '⚠️ Please enter manually' }
    }
  };
  
  class LocationWidget {
    constructor() {
      this.language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      this.init();
    }
    
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.inject());
      } else {
        this.inject();
      }
    }
    
    inject() {
      this.createStyles();
      this.createButton();
    }
    
    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .yc-location-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 10px 0;
          transition: all 0.3s;
          font-family: inherit;
        }
        
        .yc-location-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .yc-location-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .yc-location-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: yc-spin 1s linear infinite;
        }
        
        @keyframes yc-spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    createButton() {
      const addressField = document.querySelector('[name="address1"], [name="shipping_address"]');
      if (!addressField) return;
      
      this.button = document.createElement('button');
      this.button.className = 'yc-location-btn';
      this.button.type = 'button';
      this.button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a9 9 0 0 1 9 9c0 5.248-7 11-9 11s-9-5.752-9-11a9 9 0 0 1 9-9z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
        <span>${config.buttonText[this.language]}</span>
      `;
      
      addressField.parentNode.insertBefore(this.button, addressField);
      this.button.addEventListener('click', () => this.detectLocation());
    }
    
    async detectLocation() {
      if (!navigator.geolocation) {
        alert('المتصفح لا يدعم تحديد الموقع');
        return;
      }
      
      this.setLoading(true);
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000
          });
        });
        
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            language: this.language
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.fillAddress(data.address);
          alert(config.messages.success[this.language]);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert(config.messages.error[this.language]);
      } finally {
        this.setLoading(false);
      }
    }
    
    fillAddress(address) {
      const fields = {
        'address1': address.components.address1,
        'city': address.components.city,
        'state': address.components.state,
        'zip': address.components.zip,
        'country': address.components.country
      };
      
      Object.entries(fields).forEach(([name, value]) => {
        const field = document.querySelector(`[name="${name}"]`);
        if (field && value) {
          field.value = value;
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
    
    setLoading(loading) {
      if (loading) {
        this.button.disabled = true;
        this.button.innerHTML = `
          <span class="yc-location-spinner"></span>
          <span>${config.messages.loading[this.language]}</span>
        `;
      } else {
        this.button.disabled = false;
        this.button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a9 9 0 0 1 9 9c0 5.248-7 11-9 11s-9-5.752-9-11a9 9 0 0 1 9-9z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
          <span>${config.buttonText[this.language]}</span>
        `;
      }
    }
  }
  
  // Start
  document.addEventListener('DOMContentLoaded', () => {
    new LocationWidget();
  });
})();