import { useState, useRef, useCallback } from 'react';
import styles from './ImageCropModal.module.css';

export default function ImageCropModal({ image, onCrop, onClose }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const FINAL_SIZE = 128;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!img || !imageLoaded) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // En küçük boyut referans al (1:1 kare yapmak için)
    const minDimension = Math.min(imgWidth, imgHeight);
    
    // Kare alanı ortada olacak şekilde hesapla
    const sourceX = (imgWidth - minDimension) / 2;
    const sourceY = (imgHeight - minDimension) / 2;

    // 128x128 final canvas
    canvas.width = FINAL_SIZE;
    canvas.height = FINAL_SIZE;

    // Beyaz arka plan
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, FINAL_SIZE, FINAL_SIZE);

    // Ortada 1:1 kare kısmı çiz
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      minDimension,
      minDimension,
      0,
      0,
      FINAL_SIZE,
      FINAL_SIZE
    );

    // Convert to blob and return
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h3>Resmi Kırp</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.cropArea}>
          <div className={styles.imageContainer}>
            <img
              ref={imageRef}
              src={image}
              alt="Crop preview"
              className={styles.image}
              onLoad={handleImageLoad}
            />
            <div className={styles.cropOverlay}>
              <div className={styles.cropCircle}></div>
            </div>
          </div>
        </div>



        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            İptal
          </button>
          <button className={styles.cropBtn} onClick={handleCrop}>
            Kaydet
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
