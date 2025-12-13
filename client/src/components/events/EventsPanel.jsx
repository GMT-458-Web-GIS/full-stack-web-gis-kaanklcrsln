import { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { rtdb } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin } from '../../utils/adminConfig';
import styles from './EventsPanel.module.css';

const CATEGORIES = ['Sosyal', 'Spor', 'Sanat', 'Eğitim', 'Diğer'];

export default function EventsPanel() {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Sosyal');
  const [showDeleted, setShowDeleted] = useState(false);
  const { user } = useAuth();

  // Firebase'den etkinlikleri yükle
  useEffect(() => {
    const eventsRef = ref(rtdb, 'events');
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const eventsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          eventsData.push({
            id: child.key,
            ...child.val()
          });
        });
      }
      // Tarihe göre sırala
      eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  // Katılım/Red durumunu güncelle
  const handleParticipationChange = async (eventId, status) => {
    if (!user) return;
    
    try {
      const eventRef = ref(rtdb, `events/${eventId}/participation/${user.uid}`);
      await update(ref(rtdb, `events/${eventId}`), {
        [`participation/${user.uid}`]: status
      });
    } catch (error) {
      console.error('Katılım durumu güncellenirken hata:', error);
    }
  };

  // Etkinliği sil (Soft delete - Admin only)
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await update(ref(rtdb, `events/${eventId}`), {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: user.uid
      });
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error);
    }
  };

  // Silinen etkinliği geri getir (Admin only)
  const handleRestoreEvent = async (eventId) => {
    try {
      await update(ref(rtdb, `events/${eventId}`), {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      });
    } catch (error) {
      console.error('Etkinlik geri yüklenirken hata:', error);
    }
  };

  // Seçili kategoriye göre etkinlikleri filtrele
  const filteredEvents = events.filter(event => {
    const isInCategory = event.category === selectedCategory;
    
    // Normal kullanıcılar silinmiş etkinlikleri görmesin
    if (!isAdmin(user?.email)) {
      return isInCategory && !event.isDeleted;
    }
    
    // Admin'in showDeleted durumuna göre
    if (showDeleted) {
      return isInCategory && event.isDeleted;
    } else {
      return isInCategory && !event.isDeleted;
    }
  });

  // Kullanıcının bu etkinliğe katılım durumunu kontrol et
  const getUserParticipationStatus = (event) => {
    if (!user || !event.participation) return null;
    return event.participation[user.uid];
  };

  return (
    <div className={styles.eventsPanel}>
      <div className={styles.header}>
        <h2>Etkinlikler</h2>
      </div>

      {/* Kategori Sekmeleri */}
      <div className={styles.categoryTabs}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`${styles.categoryTab} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => {
              setSelectedCategory(category);
              setShowDeleted(false);
            }}
          >
            {category}
          </button>
        ))}
        
        {/* Silinen Etkinlikler Butonu (Admin only) */}
        {isAdmin(user?.email) && (
          <button
            className={`${styles.categoryTab} ${showDeleted ? styles.active : ''}`}
            onClick={() => setShowDeleted(!showDeleted)}
            title={showDeleted ? 'Normal etkinlikleri göster' : 'Silinen etkinlikleri göster'}
          >
            🗑️ 
          </button>
        )}
      </div>

      <div className={styles.eventsList}>
        {filteredEvents.map((event) => {
          const participationStatus = getUserParticipationStatus(event);
          
          return (
            <div key={event.id} className={`${styles.eventCard} ${event.isDeleted ? styles.deleted : ''}`}>
              <div className={styles.eventHeader}>
                <h3>{event.title}</h3>
                <div className={styles.headerIcons}>
                  {isAdmin(event.createdByEmail) && (
                    <span className={styles.adminBadge} title="Admin tarafından oluşturuldu">👨‍💼</span>
                  )}
                  {isAdmin(user?.email) && (
                    <>
                      {event.isDeleted ? (
                        <button
                          className={styles.restoreBtn}
                          onClick={() => handleRestoreEvent(event.id)}
                          title="Etkinliği geri yükle"
                        >
                          ↩️
                        </button>
                      ) : (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Etkinliği sil"
                        >
                          🗑️
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className={styles.eventDetails}>
                <div className={styles.detail}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.detailIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
                <div className={styles.detail}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.detailIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                  </svg>
                  <span>{event.date}</span>
                </div>
                <div className={styles.detail}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.detailIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>{event.time}</span>
                </div>
              </div>

              {/* Katılım İkonları - Silinen etkinliklerde gösterme */}
              {!event.isDeleted && (
              <div className={styles.participationActions}>
                <button
                  className={`${styles.participationBtn} ${participationStatus === 'approved' ? styles.approved : ''}`}
                  onClick={() => handleParticipationChange(event.id, 'approved')}
                  title="Katılacağım"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </button>
                <button
                  className={`${styles.participationBtn} ${participationStatus === 'rejected' ? styles.rejected : ''}`}
                  onClick={() => handleParticipationChange(event.id, 'rejected')}
                  title="Katılmayacağım"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
