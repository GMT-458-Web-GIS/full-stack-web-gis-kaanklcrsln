import styles from './ChatPanel.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import UserProfileModal from '../profile/UserProfileModal';

export default function ChatPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    profilePicture: null,
    university: '',
  });
  const [statistics, setStatistics] = useState({
    events: 0,
    friends: 0
  });
  const [messages, setMessages] = useState([
    { id: 1, user: 'Ahmet', text: 'Merhaba herkes!', time: '14:23' },
    { id: 2, user: 'Fatma', text: 'Selam Ahmet! Nasılsın?', time: '14:24' }
  ]);
  const [inputText, setInputText] = useState('');

  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = ref(rtdb, `users/${user.uid}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserProfile({
          displayName: data.displayName || 'Kullanıcı',
          profilePicture: data.profilePicture || null,
          university: data.university || ''
        });
      }
    });

    // Etkinlik sayısını yükle
    const eventsRef = ref(rtdb, `events`);
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      let eventCount = 0;
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const eventData = child.val();
          if (eventData.participants && eventData.participants[user.uid]) {
            eventCount++;
          }
        });
      }
      setStatistics(prev => ({ ...prev, events: eventCount }));
    });

    // Arkadaş sayısını yükle
    const friendsRef = ref(rtdb, `friends/${user.uid}`);
    const unsubscribeFriends = onValue(friendsRef, (snapshot) => {
      let friendCount = 0;
      if (snapshot.exists()) {
        snapshot.forEach(() => {
          friendCount++;
        });
      }
      setStatistics(prev => ({ ...prev, friends: friendCount }));
    });

    return () => {
      unsubscribeUser();
      unsubscribeEvents();
      unsubscribeFriends();
    };
  }, [user]);

  const handleUserNameClick = (userId) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  // Özel sohbet için kişi listesi
  const privateContacts = [
    { id: 1, name: 'Ayşe Yılmaz', avatar: '👩', messages: ['Selam! İyi misin?', 'Bugün etkinliğe gelir misin?'] },
    { id: 2, name: 'Mehmet Kaya', avatar: '👨', messages: ['Yarın harita üzerinde görüşelim'] },
    { id: 3, name: 'Zeynep Şahin', avatar: '👩‍🦰', messages: ['Etkinlik harika geçti!', 'Teşekkürler!'] },
    { id: 4, name: 'Emre Demir', avatar: '🧑', messages: ['Planlara katılmak istiyorum'] },
    { id: 5, name: 'Selin Acar', avatar: '👱‍♀️', messages: ['Çok eğlendim'] }
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      user: 'Sen',
      text: inputText,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  return (
    <div className={styles.chatPanel}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('general');
            setSelectedPerson(null);
          }}
        >
          📢 Genel
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'private' ? styles.active : ''}`}
          onClick={() => setActiveTab('private')}
        >
          💬 Özel
        </button>
      </div>

      {/* Özel Chat Modu - Kişi Listesi */}
      {activeTab === 'private' && !selectedPerson && (
        <div className={styles.contactsList}>
          <h3>Mesajlaşmalar</h3>
          {privateContacts.map((contact) => (
            <div
              key={contact.id}
              className={styles.contactItem}
              onClick={() => setSelectedPerson(contact)}
            >
              <div className={styles.contactAvatar}>{contact.avatar}</div>
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>{contact.name}</div>
                <div className={styles.contactPreview}>
                  {contact.messages[contact.messages.length - 1]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seçilmiş Kişi ile Chat */}
      {activeTab === 'private' && selectedPerson && (
        <>
          <div className={styles.chatHeader}>
            <button
              className={styles.backBtn}
              onClick={() => setSelectedPerson(null)}
            >
              ← Geri
            </button>
            <div className={styles.selectedPersonInfo}>
              <span className={styles.personAvatar}>{selectedPerson.avatar}</span>
              <span className={styles.personName}>{selectedPerson.name}</span>
            </div>
          </div>

          <div className={styles.messagesContainer}>
            {selectedPerson.messages.map((msg, idx) => (
              <div key={idx} className={styles.message}>
                <div className={styles.messageHeader}>
                  <strong
                    style={{ cursor: 'pointer', color: '#4a7ab5' }}
                    onClick={() => handleUserNameClick(selectedPerson.name)}
                    onMouseEnter={(e) => e.target.style.color = '#3d5f8d'}
                    onMouseLeave={(e) => e.target.style.color = '#4a7ab5'}
                  >
                    {selectedPerson.name}
                  </strong>
                  <span className={styles.time}>14:{String(20 + idx).padStart(2, '0')}</span>
                </div>
                <p className={styles.messageText}>{msg}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Genel Chat */}
      {activeTab === 'general' && (
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <div className={styles.messageHeader}>
                <strong
                  style={{ cursor: 'pointer', color: '#4a7ab5' }}
                  onClick={() => handleUserNameClick(msg.user)}
                  onMouseEnter={(e) => e.target.style.color = '#3d5f8d'}
                  onMouseLeave={(e) => e.target.style.color = '#4a7ab5'}
                >
                  {msg.user}
                </strong>
                <span className={styles.time}>{msg.time}</span>
              </div>
              <p className={styles.messageText}>{msg.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className={styles.input}
        />
        <button onClick={handleSendMessage} className={styles.sendBtn}>
          Gönder
        </button>
      </div>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </div>
  );
}
