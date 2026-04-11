"use client"
import { useState } from "react";
import styles from '../styles/ImageSlider.module.css'

interface Props {
  images: string[];
}

const ImageSlider: React.FC<Props> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return <p>No images available</p>;
  }

  return (
    <div className = {styles.slider}>
        <button className ={styles.leftBtn} onClick = {prevImage}>
            &#10094;
        </button>

        <img
        src = {images[currentIndex]}
        alt = {`Ad image ${currentIndex + 1}`}
        className={styles.mainImage}
        />

        <button className={styles.rightBtn} onClick={nextImage}>
            &#10095;
        </button>
    </div>
  );
};

export default ImageSlider;

