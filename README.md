# وصال V3.1 — Expo SDK 54

نسخة مجهزة لتعمل كمشروع Expo حقيقي، وتُرفع إلى GitHub، ويمكن تشغيلها على الهاتف عبر Expo Go.

## 1) تشغيل المشروع على الهاتف عبر Expo Go

> هذه النسخة تستخدم Expo SDK 54، وهو الإصدار المناسب لإصدارات Expo Go التي تدعم SDK 54.

على الكمبيوتر ثبّت Node.js LTS بإصدار 20.19 أو أحدث، ثم داخل مجلد المشروع:

```bash
npm install
npx expo start -c
```

سيظهر QR Code. افتح **Expo Go** على الهاتف وامسح الـ QR.

إذا لم يتصل الهاتف بالكمبيوتر، جرّب:

```bash
npx expo start --tunnel
```

## 2) رفعه إلى GitHub

ارفع **محتويات هذا المجلد نفسها** إلى جذر المستودع، بحيث يكون `package.json` و`App.js` و`app.json` في الصفحة الرئيسية للمستودع، وليس داخل مجلد إضافي.

بعدها من أي كمبيوتر:

```bash
git clone https://github.com/lzaidl/9999.git
cd 9999
npm install
npx expo start -c
```

## 3) تشغيل نسخة الويب

```bash
npm install
npx expo start --web
```

## 4) فحص المشروع

```bash
npx expo-doctor
```

يوجد أيضاً GitHub Action داخل `.github/workflows/expo-check.yml` لفحص المشروع تلقائياً عند كل Push أو Pull Request.

## 5) بناء تطبيق Android/iOS لاحقاً عبر Expo EAS

ملف `eas.json` موجود ومجهز لملفات development/preview/production. عند الحاجة إلى بناء APK/AAB أو iOS استخدم EAS بعد تسجيل الدخول:

```bash
npx eas login
npx eas build:configure
npx eas build -p android --profile preview
```

## ملاحظات مهمة

- GitHub هو مكان حفظ وإدارة كود المشروع؛ لا يشغّل تطبيق React Native داخل الهاتف بحد ذاته.
- Expo Go يشغّل المشروع من جهاز التطوير عبر Metro وQR Code.
- إذا أردت أن يبني GitHub نسخة Android تلقائياً، اربط مستودع GitHub مع Expo/EAS من لوحة Expo.
- المشروع الحالي Prototype محلي: الجواهر والمنشورات والدردشة ليست مربوطة بقاعدة Supabase بعد.

## المزايا الموجودة

- جواهر 💎
- أول محادثة مع شخص جديد = 10 جواهر
- المحادثة نفسها مجانية بعد فتحها
- البحث حسب الجنس والاسم وID
- منشورات نصية
- صورة / فيديو / GIF من معرض الهاتف
- هاشتاقات اختيارية
- معاينة الوسائط وحذفها قبل النشر
- واجهة عربية ومتجاوبة للموبايل
- وضع داكن/فاتح
