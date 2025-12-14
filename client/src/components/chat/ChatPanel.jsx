import styles from './ChatPanel.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import UserProfileModal from '../profile/UserProfileModal';
import UserEventsModal from '../modals/UserEventsModal';
import UserFriendsModal from '../modals/UserFriendsModal';

export default function ChatPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    profilePicture: null,
    university: '',
  });
  const [statistics, setStatistics] = useState({
    events: 0,
    friends: 0
  });
  const [messages, setMessages] = useState([]);
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
    const friendsRef = ref(rtdb, `users/${user.uid}/friends`);
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
  const privateContacts = [];

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
      {/* Kullanıcı Profil Bilgisi Paneli */}
      <div className={styles.profilePanel}>
        <div className={styles.profileContent}>
          {userProfile.profilePicture ? (
            <img src={userProfile.profilePicture} alt="Profil" className={styles.profileAvatar} />
          ) : (
            <div className={styles.profileAvatarPlaceholder}>👤</div>
          )}
          <div className={styles.profileInfo}>
            <h4 className={styles.profileName}>{userProfile.displayName}</h4>
            <p className={styles.profileUniversity}>{userProfile.university || 'Üniversite belirtilmemiş'}</p>
            <div className={styles.profileStats}>
              <span 
                className={styles.statText}
                onClick={() => setShowEventsModal(true)}
                style={{ cursor: 'pointer' }}
              >
                {statistics.events} Etkinlik
              </span>
              <span className={styles.statDivider}>|</span>
              <span 
                className={styles.statText}
                onClick={() => setShowFriendsModal(true)}
                style={{ cursor: 'pointer' }}
              >
                {statistics.friends} Arkadaş
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('general');
            setSelectedPerson(null);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.tabIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          Genel
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'private' ? styles.active : ''}`}
          onClick={() => setActiveTab('private')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.tabIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          Özel
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
                    onMouseEnter={(e) => e.target.style.color = '#c3dcf7'}
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
                  onMouseEnter={(e) => e.target.style.color = '#c3dcf7'}
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

      <UserEventsModal
        userId={user?.uid}
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
      />

      <UserFriendsModal
        userId={user?.uid}
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
      />
    </div>
  );
}
