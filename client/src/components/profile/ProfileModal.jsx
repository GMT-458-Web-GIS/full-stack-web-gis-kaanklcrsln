import { useState, useEffect, useRef } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { rtdb, auth, storage } from '../../api/firebase';
import styles from './ProfileModal.module.css';

const UNIVERSITIES = [
  'Ankara Üniversitesi',
  'İhsan Doğramacı Bilkent Üniversitesi',
  'Orta Doğu Teknik Üniversitesi (ODTÜ)',
  'Başkent Üniversitesi',
  'Hacettepe Üniversitesi',
  'Atılım Üniversitesi',
  'Gazi Üniversitesi',
  'Çankaya Üniversitesi',
  'Ankara Hacı Bayram Veli Üniversitesi',
  'TOBB Ekonomi ve Teknoloji Üniversitesi',
  'Ankara Yıldırım Beyazıt Üniversitesi',
  'Ufuk Üniversitesi',
  'Ankara Sosyal Bilimler Üniversitesi',
  'TED Üniversitesi',
  'Ankara Müzik ve Güzel Sanatlar Üniversitesi',
  'Türk Hava Kurumu Üniversitesi',
  'Sağlık Bilimleri Üniversitesi (Gülhane Kampüsü)',
  'Yüksek İhtisas Üniversitesi',
  'Ostim Teknik Üniversitesi',
  'Lokman Hekim Üniversitesi'
];

export default function ProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    university: '',
    bio: '',
    socialLinks: [''],
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [socialLinkCount, setSocialLinkCount] = useState(1);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = ref(rtdb, `users/${userId}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const links = data.socialLinks || [''];
        setProfile({
          displayName: data.displayName || auth.currentUser.displayName || '',
          email: data.email || auth.currentUser.email || '',
          university: data.university || '',
          bio: data.bio || '',
          socialLinks: links,
          profilePicture: data.profilePicture || null
        });
        setSocialLinkCount(links.length);
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Dosya boyutu 5MB\'dan küçük olmalıdır' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async () => {
        const img = new Image();
        img.onload = async () => {
          // Otomatik 1:1 kırpıp kaydet
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const imgWidth = img.naturalWidth;
          const imgHeight = img.naturalHeight;
          const minDimension = Math.min(imgWidth, imgHeight);
          
          const sourceX = (imgWidth - minDimension) / 2;
          const sourceY = (imgHeight - minDimension) / 2;
          
          canvas.width = 128;
          canvas.height = 128;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 128, 128);
          
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            minDimension,
            minDimension,
            0,
            0,
            128,
            128
          );
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              await uploadProfilePicture(blob);
            }
          }, 'image/jpeg', 0.95);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (croppedBlob) => {
    setLoading(true);

    try {
      const userId = auth.currentUser.uid;
      const imageRef = storageRef(storage, `profilePictures/${userId}/profile.jpg`);
      
      await uploadBytes(imageRef, croppedBlob);
      const downloadURL = await getDownloadURL(imageRef);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: downloadURL });

      // Update Realtime Database
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, { profilePicture: downloadURL });

      setProfile(prev => ({ ...prev, profilePicture: downloadURL }));
      setMessage({ type: 'success', text: 'Profil resmi güncellendi! ✓' });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ type: 'error', text: 'Profil resmi yüklenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userId = auth.currentUser.uid;
      const userRef = ref(rtdb, `users/${userId}`);

      await update(userRef, {
        displayName: profile.displayName,
        university: profile.university,
        bio: profile.bio,
        socialLinks: profile.socialLinks.filter(link => link.trim() !== '')
      });

      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: profile.displayName });

      setMessage({ type: 'success', text: 'Profil güncellendi!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Profil güncellenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLinkChange = (index, value) => {
    const newLinks = [...profile.socialLinks];
    newLinks[index] = value;
    setProfile(prev => ({ ...prev, socialLinks: newLinks }));
  };

  const handleAddSocialLink = () => {
    if (socialLinkCount < 3) {
      setProfile(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
      setSocialLinkCount(prev => prev + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modal} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Profili Düzenle</h3>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.form}>
            {/* Profile Picture + Name + University */}
            <div className={styles.topSection}>
              {/* Avatar Section */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profil" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>👤</div>
                  )}
                  <button
                    className={styles.avatarEditBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    title="Profil fotoğrafı yükle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
               
              </div>

              {/* Name + University Section */}
              <div className={styles.rightSection}>
                {/* Display Name */}
                <div className={styles.field}>
                  <label>Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Ad Soyad"
                    maxLength={50}
                  />
                </div>

                {/* University */}
                <div className={styles.field}>
                  <label>Üniversite</label>
                  <select
                    value={profile.university}
                    onChange={(e) => setProfile(prev => ({ ...prev, university: e.target.value }))}
                  >
                    <option value="">Üniversite seçin</option>
                    {UNIVERSITIES.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.field}>
              <label>Biyografi</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Kendinizden bahsedin..."
                maxLength={200}
                rows={3}
              />
              <span className={styles.charCount}>{profile.bio.length}/200</span>
            </div>

            {/* Social Links */}
            <div className={styles.field}>
              <label>Sosyal Medya Linkleri (maks. 3)</label>
              <div className={styles.socialLinksContainer}>
                {profile.socialLinks.map((link, index) => (
                  <input
                    key={index}
                    type="url"
                    value={link || ''}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    placeholder={`Link ${index + 1} (örn: instagram.com/kullaniciadi)`}
                    className={styles.socialInput}
                  />
                ))}
              </div>
              {socialLinkCount < 3 && (
                <button
                  type="button"
                  className={styles.addLinkBtn}
                  onClick={handleAddSocialLink}
                >
                  + Link Ekle
                </button>
              )}
            </div>

            {/* Save Button */}
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
