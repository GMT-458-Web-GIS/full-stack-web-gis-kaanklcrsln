import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import styles from './UserFriendsModal.module.css';

export default function UserFriendsModal({ isOpen, onClose, userId }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendsData, setFriendsData] = useState({});
  const [loading, setLoading] = useState(true);

  const currentUserId = userId || user?.uid;

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    setLoading(true);
    const friendsRef = ref(rtdb, `users/${currentUserId}/friends`);
    
    const unsubscribe = onValue(friendsRef, (snapshot) => {
      const friendIds = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          friendIds.push(child.key);
        });
      }

      setFriends(friendIds);

      // Her arkadaşın bilgisini yükle
      if (friendIds.length === 0) {
        setFriendsData({});
        setLoading(false);
        return;
      }

      const tempData = {};
      let loaded = 0;

      friendIds.forEach((friendId) => {
        const friendRef = ref(rtdb, `users/${friendId}`);
        const unsubscribeFriend = onValue(friendRef, (snapshot) => {
          if (snapshot.exists()) {
            tempData[friendId] = snapshot.val();
          }
          loaded++;
          if (loaded === friendIds.length) {
            setFriendsData(tempData);
            setLoading(false);
          }
        });

        return unsubscribeFriend;
      });
    });

    return () => unsubscribe();
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Arkadaşlar</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loadingMessage}>Yükleniyor...</div>
          ) : friends.length === 0 ? (
            <div className={styles.emptyMessage}>
              <p>Henüz arkadaş yok</p>
            </div>
          ) : (
            <div className={styles.friendsList}>
              {friends.map((friendId) => {
                const friendInfo = friendsData[friendId];
                if (!friendInfo) return null;
                
                return (
                  <div key={friendId} className={styles.friendCard}>
                    {friendInfo.profilePicture ? (
                      <img 
                        src={friendInfo.profilePicture} 
                        alt={friendInfo.displayName}
                        className={styles.friendAvatar}
                      />
                    ) : (
                      <div className={styles.friendAvatarPlaceholder}>👤</div>
                    )}
                    <div className={styles.friendInfo}>
                      <h3>{friendInfo.displayName}</h3>
                      {friendInfo.university && (
                        <p className={styles.friendUniversity}>{friendInfo.university}</p>
                      )}
                      {friendInfo.bio && (
                        <p className={styles.friendBio}>{friendInfo.bio}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
