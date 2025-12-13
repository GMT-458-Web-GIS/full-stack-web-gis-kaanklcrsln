import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, query, orderByChild } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import styles from './GeneralChat.module.css';

// Spam ve spam benzeri kelimeler (basit örnek)
const BANNED_PATTERNS = [
  /fuck|shit|asshole/gi,
  /spam+/gi,
  /(.)\1{4,}/g // Tekrar eden karakterler (aaaaa vb.)
];

// Mesaj validasyonu
const validateMessage = (text) => {
  const trimmed = text.trim();
  
  // 1. Boş mesaj kontrolü
  if (!trimmed) {
    return { valid: false, error: 'Mesaj boş olamaz' };
  }
  
  // 2. Max 50 karakter kontrolü
  if (trimmed.length > 50) {
    return { valid: false, error: 'Mesaj max 50 karaktere kadar olabilir' };
  }
  
  // 3. Emoji kontrolü
  const emojiRegex = /[^\w\s,.!?\-'"()]/gu;
  if (emojiRegex.test(trimmed)) {
    return { valid: false, error: 'Emoji kullanılamaz' };
  }
  
  // 4. Spam/Küfür kontrolü
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Mesajda uygunsuz içerik bulundu' };
    }
  }
  
  return { valid: true };
};

export default function GeneralChat() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Firebase'den genel chat mesajlarını yükle
  useEffect(() => {
    if (!user) return;

    const chatRef = ref(rtdb, 'chat/general');
    const chatQuery = query(chatRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(chatQuery, (snapshot) => {
      const messagesData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const message = child.val();
          messagesData.push({
            id: child.key,
            ...message
          });
        });
      }
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [user]);

  // Mesajlar güncellenince en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validasyon
    const validation = validateMessage(messageText);
    if (!validation.valid) {
      setValidationError(validation.error);
      setTimeout(() => setValidationError(''), 3000); // 3 saniye sonra kapat
      return;
    }

    setLoading(true);
    setValidationError('');
    try {
      const now = new Date();
      
      await push(ref(rtdb, 'chat/general'), {
        text: messageText.trim(),
        userId: user.uid,
        userEmail: user.email,
        timestamp: now.toISOString(),
        displayName: user.displayName || user.email.split('@')[0]
      });
      setMessageText('');
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      setValidationError('Mesaj gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUser = (messageUserId) => messageUserId === user?.uid;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>General Chat</h2>
        <span className={styles.userCount}>{messages.length} mesaj</span>
      </div>

      {/* Chat Kuralları Background */}
      <div className={styles.rulesBackground}>
        <div className={styles.rulesText}>
          <strong>Chat Kuralları:</strong> Max 50 karakter • Emoji yok • Spam/Küfür yok
        </div>
      </div>

      <div className={styles.messagesList}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Henüz mesaj yok. İlk mesajı gönder!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${isCurrentUser(message.userId) ? styles.own : ''}`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.userName}>
                  {isCurrentUser(message.userId) ? 'Sen' : message.displayName}
                </span>
                <span className={styles.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={styles.messageContent}>
                <p>{message.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              setValidationError('');
            }}
            placeholder="Mesaj yaz... (Max 50 karakter)"
            disabled={loading}
            maxLength="50"
            className={styles.input}
          />
          <span className={styles.charCount}>{messageText.length}/50</span>
        </div>
        {validationError && (
          <div className={styles.errorMessage}>{validationError}</div>
        )}
        <button
          type="submit"
          disabled={loading || !messageText.trim()}
          className={styles.sendBtn}
        >
          {loading ? '...' : 'Gönder'}
        </button>
      </form>
    </div>
  );
}
