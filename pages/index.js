/* eslint-disable array-callback-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import Geocode from 'react-geocode';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, query, where, getDocs, getDoc, doc,
  onSnapshot,
} from 'firebase/firestore';

import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';

import Layout from 'components/layout';
import Entrance from 'components/entrance';
import CreateGroupModal from 'components/modal/createGroupModal';

import styles from 'pages/styles.module.scss';
import getGroupSize from 'utils/group/getGroupSize';
import GroupModal from 'components/modal/groupModal';
import openGroupModal from 'utils/modal/openGroupModal';
import Input from 'components/input';

const Home = () => {
  const mapRef = useRef(null);

  const [location, setLocation] = useState('');
  const [joinGroup, setJoinGroup] = useState('');

  const router = useRouter();
  const { lat, lng, tg } = router.query;

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chattingList, setChattingList] = useState([]);
  const [voteData, setVoteData] = useState(null);

  const [center, setCenter] = useState({ lat: lat ? Number(lat) : 37.4968436, lng: lng ? Number(lng) : 127.03292 });
  const [zoom, setZoom] = useState(15);

  const [groups, setGroups] = useState([]);
  const [modalData, setModalData] = useState({});

  const chattingUnsubscribe = useRef();
  const voteUnsubscribe = useRef();

  useEffect(() => {
    const auth = getAuth();
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user === null) setIsLoggedIn(false);
      else {
        setIsLoggedIn(true);
        setTimeout(async () => {
          const db = getFirestore();
          const d = await getDoc(doc(db, 'users', user.uid));
          const { joinGroup: jg } = d.data();
          setJoinGroup(jg);

          if (jg !== '') {
            const chattingRef = collection(db, 'groups', jg, 'chatting');
            const voteRef = doc(db, 'groups', jg, 'vote', 'vote-1');

            const currentTime = new Date().getTime();
            const _onlyLive = where('created', '>=', currentTime);

            const chattingQuery = query(chattingRef, _onlyLive);

            chattingUnsubscribe.current = onSnapshot(chattingQuery, (querySnapshot) => {
              const { length } = querySnapshot.docs;
              if (length > 0) {
                setChattingList(querySnapshot.docs.map((d2) => d2.data()));
              }
            });

            voteUnsubscribe.current = onSnapshot(voteRef, (d3) => {
              if (d3.exists) setVoteData(d3.data());
              else setVoteData(null);
            });
          }
        }, 1000);
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (joinGroup !== '') {
        chattingUnsubscribe.current();
        voteUnsubscribe.current();
      }
    };
  }, []);

  const handleGroupClick = (groupIndex) => () => {
    setModalData(groups[groupIndex]);
    openGroupModal();
  };

  useEffect(() => {
    if (lat && lng) {
      setCenter({ lat: Number(lat), lng: Number(lng) });
    }
    if (!lat && !lng && window.beforePosition) {
      setCenter(window.beforePosition.center);
      setZoom(window.beforePosition.zoom);
    }
  }, [lat, lng]);

  useEffect(async () => {
    const {
      east, south, north, west,
    } = mapRef.current === null ? {
      east: window.beforePosition ? window.beforePosition.east : 127.05212461654665,
      north: window.beforePosition ? window.beforePosition.north : 37.51173832024431,
      south: window.beforePosition ? window.beforePosition.south : 37.48208212929033,
      west: window.beforePosition ? window.beforePosition.west : 127.01371538345339,
    } : mapRef.current.getBounds().toJSON();

    const db = getFirestore();
    const groupRef = collection(db, 'groups');

    const conditionEast = where('center.lng', '<=', east);
    const conditionWest = where('center.lng', '>=', west);

    const execQuery = query(groupRef, conditionEast, conditionWest);
    const querySnapshot = await getDocs(execQuery);

    const docs = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.center.lat >= south && d.center.lat <= north)
      .sort((a, b) => {
        if (a.totalParticipants > b.totalParticipants) return -1;
        if (a.totalParticipants === b.totalParticipants) return 0;
        if (a.totalParticipants < b.totalParticipants) return 1;
      });

    setGroups(docs);

    window.beforePosition = {
      center,
      zoom,
      east,
      south,
      north,
      west,
    };
  }, [center, zoom]);

  useEffect(() => {
    if (tg) {
      let ti;
      groups.forEach((g, i) => {
        if (g.id === tg) ti = i;
      });
      if (ti !== undefined) handleGroupClick(ti)();
    }
  }, [tg, groups]);

  if (loading) return <div>loading</div>;

  if (!isLoggedIn) return <Entrance />;

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

  const moveToCenterByAddress = async () => {
    Geocode.setApiKey('AIzaSyDIoG3tiVkKgIMKJVo1BBSym5uhAth99hE');
    const d = await Geocode.fromAddress(location);
    if (d.results.length === 0) return alert('주소를 찾지 못했습니다.\n다른 지명을 입력해주세요');
    setCenter(d.results[0].geometry.location);
  };

  return (
    <Layout
      title="Demotaverse"
      isLoggedIn={isLoggedIn}
      joinGroup={joinGroup}
      chattingList={chattingList}
      voteData={voteData}
    >
      <CreateGroupModal center={center} />
      <GroupModal {...modalData} joinGroup={joinGroup} />
      <div className={styles['move-direction-wrapper']}>
        <Input value={location} onChange={({ target: { value } }) => setLocation(value)} placeholder="이동하실 지역을 입력해주세요" />
        <button type="button" onClick={moveToCenterByAddress}>이동</button>
      </div>
      <LoadScript
        googleMapsApiKey="AIzaSyDIoG3tiVkKgIMKJVo1BBSym5uhAth99hE"
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
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
        >
          {groups.map((group, i) => {
            const size = getGroupSize(group.totalParticipants, zoom);
            const fontSize = size >= 32 ? size * 0.14 : 0;

            const commonStyles = { width: size, height: size, fontSize };
            if (group.type === 'color') commonStyles.backgroundColor = group.color;
            else commonStyles.backgroundImage = `url(${group.imageURL})`;

            return (
              <OverlayView key={String(i)} position={group.center} mapPaneName="overlayMouseTarget">
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={handleGroupClick(i)} style={{ position: 'absolute', top: `-${size / 2}px`, left: `-${size / 2}px` }}>
                    {
                      group.type === 'color'
                        ? <div className={styles['map-overlay-color']} style={commonStyles}>{group.groupSlogun}</div>
                        : <div className={styles['map-overlay-image']} style={commonStyles}>{group.groupSlogun}</div>
                    }
                  </button>
                </div>
              </OverlayView>
            );
          })}
        </GoogleMap>
      </LoadScript>
    </Layout>
  );
};

export default Home;
