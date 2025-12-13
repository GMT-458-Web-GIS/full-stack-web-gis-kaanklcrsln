# Message Expiration Setup Guide

## 📝 Özet
- Genel chat mesajları Firebase'de kalıcı olarak kaydedilir
- Her mesaj `expiresAt` timestamp'ine sahip (oluşturulduğu tarihten 24 saat sonra)
- Client-side: Süresi geçmiş mesajlar gösterilmez
- Server-side: Saatte bir Cloud Function ile süresi geçmiş mesajlar silinir

## 🔧 Setup Adımları

### 1️⃣ Cloud Function Oluştur

**Google Cloud Console:**
1. https://console.cloud.google.com/functions adresine git
2. **Create Function** butonuna tıkla
3. Şu ayarları yap:

```
Environment: 2nd gen
Runtime: Node.js 18
Trigger type: Cloud Pub/Sub
Create new topic: general-chat-cleanup
Allow unauthenticated invocations: No
```

4. `index.js` dosyasını aç ve şu kodu yapıştır:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();

exports.cleanupExpiredMessages = async (req, res) => {
  try {
    const now = new Date();
    const generalChatRef = db.ref('chat/general');
    
    const snapshot = await generalChatRef.once('value');
    
    if (!snapshot.exists()) {
      return res.json({ success: true, message: 'No messages to clean' });
    }

    const messages = snapshot.val();
    const expiredMessageIds = [];

    Object.entries(messages).forEach(([messageId, message]) => {
      if (message.expiresAt && new Date(message.expiresAt) < now) {
        expiredMessageIds.push(messageId);
      }
    });

    if (expiredMessageIds.length > 0) {
      const updates = {};
      expiredMessageIds.forEach(messageId => {
        updates[`chat/general/${messageId}`] = null;
      });
      await db.ref().update(updates);
    }

    return res.json({
      success: true,
      deletedCount: expiredMessageIds.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
```

5. `package.json` dosyasında:
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}
```

6. **Deploy** butonuna tıkla

### 2️⃣ Cloud Scheduler Kur

**Google Cloud Console:**
1. https://console.cloud.google.com/cloudscheduler adresine git
2. **Create Job** butonuna tıkla
3. Şu ayarları yap:

```
Name: cleanup-general-chat-messages
Frequency: 0 * * * * (her saat başında)
Timezone: Europe/Istanbul
Execution timeout: 60s
```

4. **Execution settings:**
   - Message body: (boş)
   - Auth header: Add OIDC token
   - Service account: (Cloud Function'ın service account'u)
   - Audience: (Cloud Function'ın URL'i)

5. **Create** butonuna tıkla

### 3️⃣ Test Et

Cloud Scheduler UI'da:
1. Oluşturduğun job'u seç
2. **Force run** butonuna tıkla
3. Logs'tan başarılı çalıştığını kontrol et

### 4️⃣ Firebase Security Rules

Genel chat için kuralı güncelle:

```json
{
  "rules": {
    "chat": {
      "general": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 📊 Veri Yapısı

Her genel chat mesajı şu yapıya sahip:

```javascript
{
  text: "mesaj metni",
  userId: "user_uid",
  userEmail: "user@email.com",
  displayName: "Kullanıcı Adı",
  timestamp: "2024-12-13T12:00:00Z",
  expiresAt: "2024-12-14T12:00:00Z"  // 24 saat sonra
}
```

---

## ⏰ Timeline

**Client-side (hemen):**
- Mesaj gösterilmez (expiresAt kontrolü)
- Sayfayı yenileyince süresi geçmiş mesajlar görünmez

**Server-side (saat başında):**
- Cloud Scheduler saatte bir Cloud Function'ı tetikler
- Süresi geçmiş mesajlar Firebase'den fiziksel olarak silinir

---

## 🔍 İzleme

**Cloud Logs:**
1. Cloud Function'ın Logs sekmesine git
2. Çalıştığı zamanları ve silinen mesaj sayısını kontrol et

**Firebase Console:**
1. Realtime Database → chat/general
2. Mesajların 24 saat sonra silindiğini gözlemle

---

## ❓ SSS

**Süresi geçmiş mesajlar hemen silinir mi?**
- Client'de hemen gizlenir (expiresAt kontrolü)
- Firebase'den saatte bir silinir (Cloud Scheduler)

**Zaman dilimi önemli mi?**
- Evet! Cloud Scheduler için `Europe/Istanbul` kullan
- expiresAt otomatik hesaplanır (UTC)

**Cloud Function maliyeti nedir?**
- Google Cloud'da saatte 1 kez çalıştırma = ~0.00 USD/ay (free tier kapsamında)

**Private chat mesajları için gerekli mi?**
- Hayır, özel mesajlar silinmez (sadece genel chat için 24 saatlik TTL)

---

## 📚 Kaynaklar

- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Cloud Scheduler Docs](https://cloud.google.com/scheduler/docs)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
