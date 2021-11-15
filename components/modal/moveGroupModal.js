/* eslint-disable react/prop-types */
/* eslint-disable consistent-return */
/* eslint-disable arrow-body-style */
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  getFirestore, updateDoc, doc,
} from 'firebase/firestore';

import { GoogleMap } from '@react-google-maps/api';

import styles from 'components/modal/styles.module.scss';
import closeMoveGroupModal from 'utils/modal/closeMoveGroupModal';
import LoadingButton from 'components/loadingButton';

const MoveGroupModal = ({
  center: defaultCenter,
}) => {
  const router = useRouter();
  const { group } = router.query;

  const mapRef = useRef(null);

  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(15);

  const handleLoad = (_map) => {
    mapRef.current = _map;
  };

  const handleDragEnd = () => {
    if (!mapRef.current) return;
    setCenter(mapRef.current.getCenter().toJSON());
  };

  const handleZoom = () => {
    if (!mapRef.current) return;
    setZoom(mapRef.current.getZoom());
  };

  const moveGroup = async () => {
    if (window.confirm('정말로 이동하시겠습니까?')) {
      const db = getFirestore();
      await updateDoc(doc(db, 'groups', group), {
        center,
      });
      alert('성공적으로 이동했습니다');
      closeMoveGroupModal();
    }
  };

  useEffect(() => {
    setCenter(defaultCenter);
  }, [defaultCenter]);

  return (
    <div className={styles['modal-background-shadow']} id="move-group-modal">
      <div className={styles['modal-card-wrapper']}>
        <button type="button" onClick={closeMoveGroupModal}>
          <img src="/icon/close.png" alt="close" className={styles.close} />
        </button>
        <div className={styles['modal-card-t4']}>
          <div className={styles.label}>그룹 이동시키기</div>
          <div className={styles['google-map-wrapper']}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '240px' }}
              zoom={zoom}
              center={center}
              onLoad={handleLoad}
              onDragEnd={handleDragEnd}
              onZoomChanged={handleZoom}
              options={{
                fullscreenControl: false,
                panControl: false,
                rotateControl: false,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
              }}
            />
          </div>
          <div className={styles['submit-button-wrapper']}>
            <LoadingButton label="그룹 이동시키기" onClick={moveGroup} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveGroupModal;
