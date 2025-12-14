import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import styles from './UserProfileModal.module.css';
import UserEventsModal from '../modals/UserEventsModal';
import UserFriendsModal from '../modals/UserFriendsModal';

export default function UserProfileModal({ userId, isOpen, onClose }) {
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    profilePicture: null,
    university: '',
    bio: ''
  });
  const [statistics, setStatistics] = useState({
    events: 0,
    friends: 0
  });
  const [loading, setLoading] = useState(true);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);

    // Kullanıcı profilini yükle
    const userRef = ref(rtdb, `users/${userId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserProfile({
          displayName: data.displayName || 'Kullanıcı',
          profilePicture: data.profilePicture || null,
          university: data.university || '',
          bio: data.bio || ''
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
          if (eventData.participants && eventData.participants[userId]) {
            eventCount++;
          }
        });
      }
      setStatistics(prev => ({ ...prev, events: eventCount }));
    });

    // Arkadaş sayısını yükle
    const friendsRef = ref(rtdb, `users/${userId}/friends`);
    const unsubscribeFriends = onValue(friendsRef, (snapshot) => {
      let friendCount = 0;
      if (snapshot.exists()) {
        friendCount = Object.keys(snapshot.val()).length;
      }
      setStatistics(prev => ({ ...prev, friends: friendCount }));
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeEvents();
      unsubscribeFriends();
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {loading ? (
          <div className={styles.loading}>Yükleniyor...</div>
        ) : (
          <div className={styles.content}>
            {/* Profil Başlığı */}
            <div className={styles.profileHeader}>
              {/* Sol: Profil Resmi */}
              <div className={styles.avatarSection}>
                {userProfile.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="Profil"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>👤</div>
                )}
              </div>

              {/* Sağ: İstatistikler */}
              <div className={styles.statsSection}>
                <h2 className={styles.userName}>{userProfile.displayName}</h2>

                {userProfile.university && (
                  <p className={styles.university}>{userProfile.university}</p>
                )}

                <div className={styles.stats}>
                  <div className={styles.statItem} onClick={() => setShowEventsModal(true)} style={{ cursor: 'pointer' }}>
                    <span className={styles.statLabel}>Etkinlik</span>
                    <span className={styles.statValue}>{statistics.events}</span>
                  </div>
                  <div className={styles.statItem} onClick={() => setShowFriendsModal(true)} style={{ cursor: 'pointer' }}>
                    <span className={styles.statLabel}>Arkadaş</span>
                    <span className={styles.statValue}>{statistics.friends}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Biyografi */}
            {userProfile.bio && (
              <div className={styles.bioSection}>
                <p className={styles.bio}>{userProfile.bio}</p>
              </div>
            )}
          </div>
        )}

        <UserEventsModal
          userId={userId}
          isOpen={showEventsModal}
          onClose={() => setShowEventsModal(false)}
        />

        <UserFriendsModal
          userId={userId}
          isOpen={showFriendsModal}
          onClose={() => setShowFriendsModal(false)}
        />
      </div>
    </div>
  );
}
