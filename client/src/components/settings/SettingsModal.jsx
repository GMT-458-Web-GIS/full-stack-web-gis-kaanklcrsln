import { useTheme } from '../../context/ThemeContext';
import styles from './SettingsModal.module.css';

export default function SettingsModal({ isOpen, onClose }) {
  const { darkMode, toggleDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Ayarlar</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span>🌙 Karanlık Mod</span>
              <p className={styles.settingDescription}>
                Arayüzü koyu renklerle göster
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
