/**
 * Firebase Cloud Function - Message Expiration Cleanup
 * Her saatte çalıştırılmalı (Cloud Scheduler ile)
 * 
 * Setup:
 * 1. Google Cloud Console'da Cloud Function oluştur
 * 2. Runtime: Node.js 18
 * 3. Trigger: Cloud Pub/Sub (Cloud Scheduler'dan)
 * 4. Schedule: "0 * * * *" (her saat başında)
 * 5. Timezone: Europe/Istanbul
 */

const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();

exports.cleanupExpiredMessages = async (req, res) => {
  try {
    const now = new Date();
    const generalChatRef = db.ref('chat/general');
    
    // Genel chat mesajlarını getir
    const snapshot = await generalChatRef.once('value');
    
    if (!snapshot.exists()) {
      return res.json({ 
        success: true, 
        message: 'No messages to clean' 
      });
    }

    const messages = snapshot.val();
    const expiredMessageIds = [];

    // Süresi geçmiş mesajları bul
    Object.entries(messages).forEach(([messageId, message]) => {
      if (message.expiresAt && new Date(message.expiresAt) < now) {
        expiredMessageIds.push(messageId);
      }
    });

    // Süresi geçmiş mesajları sil
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
    console.error('Message cleanup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Alternative: Firestore TTL ile otomatik silme (önerilir)
 * 
 * Eğer Cloud Firestore kullanırsan TTL policy ayarlayabilirsin:
 * 1. Firestore Collection'a ttl alanı ekle
 * 2. TTL Policy oluştur (Console'dan)
 * 3. Dokumentasyon: https://firebase.google.com/docs/firestore/ttl
 * 
 * Realtime Database için ise yukarıdaki Cloud Function gerekli.
 */
