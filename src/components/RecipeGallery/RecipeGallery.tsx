"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";

import Image from "next/image";
import { Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { RecipeImage } from "@/types/recipe";
import styles from "./RecipeGallery.module.css";

interface RecipeGalleryProps {
  images: RecipeImage[];
  /** Used as the base alt text for each slide (recipe title). */
  alt: string;
}

const IMAGE_SIZES = "(max-width: 900px) 100vw, 800px";

export default function RecipeGallery({ images, alt }: RecipeGalleryProps) {
  if (images.length === 0) {
    return (
      <div className={styles.singleSlide}>
        <div className={styles.placeholder} aria-hidden="true" />
      </div>
    );
  }

  // A single photo is shown as a plain static image — no Swiper controls to
  // navigate between one slide.
  if (images.length === 1) {
    return (
      <div className={styles.singleSlide}>
        <Image src={images[0].url} alt={alt} fill sizes={IMAGE_SIZES} className={styles.image} priority />
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Keyboard]}
      navigation
      pagination={{ clickable: true }}
      keyboard={{ enabled: true }}
      className={styles.swiper}
    >
      {images.map((image, index) => (
        <SwiperSlide key={image.publicId ?? image.url} className={styles.slide}>
          <Image
            src={image.url}
            alt={`${alt} (${index + 1}/${images.length})`}
            fill
            sizes={IMAGE_SIZES}
            className={styles.image}
            priority={index === 0}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
