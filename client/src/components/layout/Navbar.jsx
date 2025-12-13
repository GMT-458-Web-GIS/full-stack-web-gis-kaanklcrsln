import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AddFriendModal from '../friends/AddFriendModal';
import NotificationPanel from '../notifications/NotificationPanel';
import ProfileModal from '../profile/ProfileModal';
import SettingsModal from '../settings/SettingsModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <img src="/Friendly/assets/friendly-logo_trans.png" alt="Friendly Logo" />
          </div>

          <div className={styles.actions}>
            {/* Bildirimler Butonu */}
            <button 
              className={styles.iconBtn} 
              title="Bildirimler"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowAddFriend(false);
              }}
            >
              🔔
            </button>

            {/* Arkadaş Ekle Butonu */}
            <button 
              className={styles.iconBtn} 
              title="Arkadaş Ekle"
              onClick={() => {
                setShowAddFriend(true);
                setShowNotifications(false);
              }}
            >
              👥
            </button>

            {/* Profil Menüsü */}
            <div className={styles.menu} ref={menuRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setIsOpen(!isOpen)}
                title="Profil"
              >
                👤
              </button>

              {isOpen && (
                <div className={styles.dropdown}>
                  {user && (
                    <>
                      <div className={styles.userInfo}>
                        <p className={styles.userName}>
                          {user.displayName || user.email?.split('@')[0] || 'Kullanıcı'}
                        </p>
                        <p className={styles.userEmail}>{user.email}</p>
                      </div>
                      <hr className={styles.divider} />
                    </>
                  )}

                  <button 
                    className={styles.menuItem} 
                    onClick={() => {
                      setIsOpen(false);
                      setShowProfile(true);
                    }}
                  >
                    ✏️ Profili Düzenle
                  </button>
                  <button 
                    className={styles.menuItem} 
                    onClick={() => {
                      setIsOpen(false);
                      setShowSettings(true);
                    }}
                  >
                    ⚙️ Ayarlar
                  </button>
                  <hr className={styles.divider} />
                  <button className={styles.menuItemDanger} onClick={handleLogout}>
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AddFriendModal 
        isOpen={showAddFriend} 
        onClose={() => setShowAddFriend(false)} 
      />
      
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
