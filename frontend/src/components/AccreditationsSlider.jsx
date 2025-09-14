import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/PartnerSlider.module.css';
import { API_URL, STATIC_URL } from '../config';

const AccreditationsSlider = () => {
  const [partners, setPartners] = useState([]);
  const trackRef = useRef(null);
  const scrollIntervalRef = useRef(null);


  useEffect(() => {
    
    const fetchPartners = async () => {
      try {
        const res = await axios.get(`${API_URL}/partners`, { withCredentials: true });

        // 🔁 Only show accreditors or both
        const filtered = res.data.filter(p =>
          p.type?.toLowerCase() === 'accreditator' || p.type?.toLowerCase() === 'both'
        );

        setPartners(filtered);
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
   }; 
    fetchPartners();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const startScroll = () => {
      scrollIntervalRef.current = setInterval(() => {
        if (track.scrollLeft + 1 >= track.scrollWidth - track.clientWidth) {
          track.scrollLeft = 0;
        } else {
          track.scrollLeft += 1;
        }
      }, 30);
    };

    const stopScroll = () => clearInterval(scrollIntervalRef.current);

    track.addEventListener('mouseenter', stopScroll);
    track.addEventListener('mouseleave', startScroll);

    startScroll();

    return () => {
      stopScroll();
      track.removeEventListener('mouseenter', stopScroll);
      track.removeEventListener('mouseleave', startScroll);
    };
  }, [partners]);

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>Our Accreditors</h2>
      <div className={styles.sliderContainer}>
        <div className={styles.sliderTrack} ref={trackRef}>
          {partners.map((partner) => (
            <div key={partner.id} className={styles.logoItem}>
              <img
                src={`${STATIC_URL}/uploads/partners/${partner.logo}`}
                alt={partner.name}
                className={styles.logoImage}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccreditationsSlider;
