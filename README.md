# YouCan Auto Location Plugin

إضافة لاكتشاف موقع العميل تلقائيًا في متاجر YouCan.

## المميزات
- اكتشاف الموقع تلقائيًا باستخدام GPS
- تعبئة عنوان الشحن أوتوماتيكيًا
- دعم اللغة العربية والإنجليزية
- مجاني بالكامل (OpenStreetMap)
- تكامل سهل مع YouCan

## التثبيت السريع

### 1. النشر على Vercel
[![نشر على Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/imadferradji/youcan-auto-location)

### 2. تسجيل الإضافة في YouCan
1. اذهب إلى https://developer.youcan.shop/apps
2. أنشئ App جديد
3. أدخل:
   - App URL: رابط Vercel الخاص بك
   - Redirect URI: رابطك/callback
   - Scopes: read_checkouts, write_checkouts

### 3. إضافة إلى متجرك
أضف هذا السكريت إلى theme.liquid:
```liquid
<script src="YOUR_VERCEL_URL/widget.js" defer></script>