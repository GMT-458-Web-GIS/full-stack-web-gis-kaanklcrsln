import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import styles from './UserEventsModal.module.css';

export default function UserEventsModal({ isOpen, onClose, userId }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = userId || user?.uid;

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    setLoading(true);
    const eventsRef = ref(rtdb, 'events');
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const userEvents = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const eventData = child.val();
          // Kullanıcının katılımcı olduğu etkinlikleri göster
          if (eventData.participants && eventData.participants[currentUserId] && !eventData.isDeleted) {
            userEvents.push({
              id: child.key,
              ...eventData
            });
          }
        });
      }

      // Tarihe göre sırala
      userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(userEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Paylaşılan Etkinlikler</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loadingMessage}>Yükleniyor...</div>
          ) : events.length === 0 ? (
            <div className={styles.emptyMessage}>
              <p>Henüz katılındığı etkinlik yok</p>
            </div>
          ) : (
            <div className={styles.eventsList}>
              {events.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventHeader}>
                    <h3>{event.title}</h3>
                    <span className={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className={styles.eventDescription}>{event.description}</p>
                  <div className={styles.eventDetails}>
                    <span className={styles.eventLocation}>📍 {event.location}</span>
                    <span className={styles.eventCategory}>{event.category}</span>
                  </div>
                  {event.participants && (
                    <div className={styles.participantCount}>
                      👥 {Object.keys(event.participants).length} katılımcı
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
