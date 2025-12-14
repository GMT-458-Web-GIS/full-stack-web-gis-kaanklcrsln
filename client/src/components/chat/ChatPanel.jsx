import styles from './ChatPanel.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import UserProfileModal from '../profile/UserProfileModal';
import UserEventsModal from '../modals/UserEventsModal';
import UserFriendsModal from '../modals/UserFriendsModal';
import GeneralChat from './GeneralChat';
import PrivateChat from './PrivateChat';

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

  return (
    <div className={styles.chatPanel}>
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
          onClick={() => { setActiveTab('general'); setSelectedPerson(null); }}
        >
          Genel
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'private' ? styles.active : ''}`}
          onClick={() => setActiveTab('private')}
        >
          Özel
        </button>
      </div>

      {activeTab === 'general' && <GeneralChat />}
      {activeTab === 'private' && <PrivateChat />}

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
