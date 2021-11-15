/* eslint-disable consistent-return */
/* eslint-disable no-restricted-properties */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  getFirestore, doc, setDoc, onSnapshot, collection, updateDoc, increment, query, where, deleteField, getDoc, deleteDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';

import Layout from 'components/layout';

import styles from 'pages/styles.module.scss';
import UserModal from 'components/modal/userModal';
import UpdateGroupModal from 'components/modal/updateGroupModal';
import CreateVoteModal from 'components/modal/createVoteModal';
import MoveGroupModal from 'components/modal/moveGroupModal';
import getCharacterSize from 'utils/group/getCharacterSize';
import getGroupSize from 'utils/group/getGroupSize';
import getCurrentIconSize from 'utils/group/getCurrentIconSize';
import getEmojiSize from 'utils/group/getEmojiSize';

const Group = () => {
  const router = useRouter();
  const { group } = router.query;

  const mapRef = useRef(null);
  const auth = getAuth();

  const [center, setCenter] = useState({ lat: 37.4968436, lng: 127.03292 });
  const [zoom, setZoom] = useState(18);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [chattingList, setchattingList] = useState([]);
  const [voteData, setVoteData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [checkUser, setCheckUser] = useState();
  const [checkUserDisplayName, setCheckUserDisplayName] = useState('');

  const groupDocUnsubscribe = useRef();
  const chattingUnsubscribe = useRef();
  const voteUnsubscribe = useRef();
  const participantsUnsubscribe = useRef();
  const blacklistUnsubscribe = useRef();

  const positionRef = useRef();
  const windowClickUnsubscribe = useRef();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user === null) setIsLoggedIn(false);
      else setIsLoggedIn(true);
      setAuthLoading(false);
    });

    return () => {
      authUnsubscribe();
      blacklistUnsubscribe.current();
      participantsUnsubscribe.current();
      groupDocUnsubscribe.current();
      chattingUnsubscribe.current();
      voteUnsubscribe.current();
      windowClickUnsubscribe.current();
    };
  }, []);

  useEffect(async () => {
    if (group !== null && group !== undefined && !authLoading) {
      const db = getFirestore();
      const { uid, displayName } = auth.currentUser;

      const groupDocRef = doc(db, 'groups', group);
      const chattingRef = collection(db, 'groups', group, 'chatting');
      const voteRef = doc(db, 'groups', group, 'vote', 'vote-1');
      const participantsRef = collection(db, 'groups', group, 'participants');
      const myRef = doc(db, 'groups', group, 'participants', uid);
      const blacklistRef = doc(db, 'groups', group, 'blacklist', uid);

      blacklistUnsubscribe.current = onSnapshot(blacklistRef, (d) => {
        if (d.data() !== undefined) {
          alert('관리자에 의해 추방당하셨습니다');
          router.replace('/');
        }
      });

      participantsUnsubscribe.current = onSnapshot(participantsRef, async (querySnapshot) => {
        let check = false;
        setParticipants(querySnapshot.docs.map((d) => {
          if (d.id === uid) {
            check = true;
          }
          return { id: d.id, ...d.data() };
        }));

        if (!check) {
          const myData = await getDoc(doc(db, 'users', uid));
          const { joinGroup } = myData.data();

          const proms = [];
          if (joinGroup !== '') {
            const preGroupDoc = await getDoc(doc(db, 'groups', joinGroup));
            const { owner: preGroupDocOwner } = preGroupDoc.data();
            if (preGroupDocOwner === uid) {
              alert('다른 그룹의 리더입니다\n기존 그룹의 리더권한을 위임하고 가입해주세요');
              router.back();
              return;
            }

            proms.push(deleteDoc(doc(db, 'groups', preGroupDoc.id, 'participants', uid)));
            proms.push(updateDoc(doc(db, 'groups', preGroupDoc.id), {
              totalParticipants: increment(-1),
            }));
          }

          positionRef.current = { x: (window.innerWidth / 2), y: (window.innerHeight / 2) };

          await Promise.all([
            setDoc(myRef, {
              displayName,
              uid,
              positionX: 0,
              positionY: 0,
            }),
            updateDoc(groupDocRef, {
              totalParticipants: increment(1),
            }),
            updateDoc(doc(db, 'users', uid), {
              joinGroup: group,
            }),
            ...proms,
          ]);
        }
      });

      const currentTime = new Date().getTime();
      const _onlyLive = where('created', '>=', currentTime);

      const chattingQuery = query(chattingRef, _onlyLive);

      groupDocUnsubscribe.current = onSnapshot(groupDocRef, (d) => {
        setData({ id: d.id, ...d.data() });
        setCenter(d.data().center);
      });

      chattingUnsubscribe.current = onSnapshot(chattingQuery, (querySnapshot) => {
        const { length } = querySnapshot.docs;
        if (length > 0) {
          setchattingList(querySnapshot.docs.map((d) => d.data()));
        }
      });

      voteUnsubscribe.current = onSnapshot(voteRef, (d) => {
        if (d.exists) setVoteData(d.data());
        else setVoteData(null);
      });

      setLoading(false);
    }
  }, [group, authLoading]);

  useEffect(() => {
    const baseRadius = 240;
    const realRadius = baseRadius * Math.sqrt(data.totalParticipants) * Math.pow(2, zoom - 18);
    const db = getFirestore();
    participants.forEach(async (p) => {
      if (Math.sqrt(Math.pow(p.positionX, 2) + Math.pow(p.positionY, 2)) > realRadius) {
        await updateDoc(doc(db, 'groups', group, 'participants', p.id), {
          positionX: 0,
          positionY: 0,
        });
      }
    });
  }, [data]);

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

  const addEmotion = (index) => async () => {
    const db = getFirestore();
    const { uid } = auth.currentUser;
    const myRef = doc(db, 'groups', group, 'participants', uid);

    await updateDoc(myRef, {
      emotion: index,
    });

    setTimeout(async () => {
      await updateDoc(myRef, {
        emotion: deleteField(),
      });
    }, 3000);
  };

  const groupSizeRef = useRef();
  const [groupSize, setGroupSize] = useState();

  useEffect(() => {
    if (!authLoading && data.totalParticipants !== undefined) {
      const _groupSize = getGroupSize(data.totalParticipants, zoom);
      groupSizeRef.current = _groupSize;
      setGroupSize(_groupSize);

      participants.forEach(({ id, positionX, positionY }) => {
        if (id === auth.currentUser.uid) {
          positionRef.current = {
            x: (positionX * Math.pow(2, zoom - 18)) + (window.innerWidth / 2),
            y: (positionY * Math.pow(2, zoom - 18)) + (window.innerHeight / 2),
          };
        }
      });

      if (windowClickUnsubscribe.current) {
        windowClickUnsubscribe.current();
      }

      const db = getFirestore();
      const { uid } = auth.currentUser;
      const myRef = doc(db, 'groups', group, 'participants', uid);

      const handleClick = async (e) => {
        if (e.clientX >= 360 && e.clientX <= window.innerWidth - 360 && e.clientY <= window.innerHeight - 88) {
          const nextPosition = {
            x: positionRef.current.x + ((e.clientX - positionRef.current.x) / 10),
            y: positionRef.current.y + ((e.clientY - positionRef.current.y) / 10),
          };

          const circleX = nextPosition.x - (window.innerWidth / 2);
          const circleY = nextPosition.y - (window.innerHeight / 2);

          if (Math.sqrt(Math.pow(circleX, 2) + Math.pow(circleY, 2)) <= (groupSizeRef.current / 2)) {
            positionRef.current = nextPosition;
            await updateDoc(myRef, {
              positionX: circleX * Math.pow(2, 18 - zoom),
              positionY: circleY * Math.pow(2, 18 - zoom),
            });
          }
        }
      };

      window.addEventListener('click', handleClick, false);

      windowClickUnsubscribe.current = () => window.removeEventListener('click', handleClick);
    }
  }, [zoom, authLoading, data]);

  // const groupSize = getGroupSize(group.totalParticipants, zoom);
  // const characterSize = getCharacterSize(zoom);
  // const curretIconSize = getCurrentIconSize(zoom);

  return (
    <>
      {!loading ? <UserModal userLists={participants} owner={data.owner} /> : null}
      {!loading ? <UpdateGroupModal groupData={data} /> : null}
      {!loading ? <CreateVoteModal groupData={data} /> : null}
      {!loading && mapRef.current !== null ? <MoveGroupModal groupData={data} center={data.center} /> : null}
      <Layout
        title="Demotaverse | 그룹상세"
        isLoggedIn={isLoggedIn}
        groupData={data}
        voteData={voteData}
        chattingList={chattingList}
      >
        {checkUser ? <div className={styles['checkuser-nickname']}>{checkUserDisplayName}</div> : null}
        <div className={styles['emotion-section']}>
          {[...Array(9).keys()].map((v, i) => {
            return (
              <button key={String(i)} type="button" onClick={addEmotion(i + 1)}>
                <img src={`/emoji/${i + 1}.png`} alt="emoji" />
              </button>
            );
          })}
        </div>
        <LoadScript
          googleMapsApiKey="AIzaSyDIoG3tiVkKgIMKJVo1BBSym5uhAth99hE"
        >
          {
            loading
              ? null
              : (
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
                    // zoomControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    draggable: false,
                  }}
                >
                  <OverlayView position={data.center} mapPaneName="overlayMouseTarget">
                    <div className={styles['group-section']}>
                      {
                        participants.map(({
                          positionX, positionY, uid, displayName, emotion,
                        }, i) => {
                          const characterPositionY = `${(positionY * Math.pow(2, zoom - 18)) - (getCharacterSize(zoom) / 2)}`;
                          const characterPositionX = `${(positionX * Math.pow(2, zoom - 18)) - (getCharacterSize(zoom) / 2)}`;

                          return (
                            <div
                              key={String(i)}
                              className={styles['character-wrapper']}
                              style={{ top: `${characterPositionY}px`, left: `${characterPositionX}px` }}
                            >
                              <div className={styles['img-wrapper']}>
                                {emotion && zoom >= 15
                                  ? (
                                    <img
                                      src={`/emoji/${emotion}.png`}
                                      alt="current"
                                      className={styles.emotion}
                                      style={{
                                        top: uid === auth.currentUser.uid
                                          ? `${-12 * Math.pow(2, zoom - 18)}px`
                                          : `${-24 * Math.pow(2, zoom - 18)}px`,
                                        width: getEmojiSize(zoom),
                                        height: getEmojiSize(zoom),
                                      }}
                                    />
                                  )
                                  : null}
                                {uid === auth.currentUser.uid && zoom >= 15
                                  ? (
                                    <img
                                      src="/icon/current.png"
                                      alt="current"
                                      className={styles.current}
                                      style={{ height: getCurrentIconSize(zoom), width: 2 * getCurrentIconSize(zoom) }}
                                    />
                                  )
                                  : null}
                                <button type="button" onClick={() => { setCheckUser(uid); setCheckUserDisplayName(displayName); }}>
                                  <img src="/img/character.png" alt="character" className={styles.character} style={{ width: getCharacterSize(zoom), height: getCharacterSize(zoom) }} />
                                </button>
                                {uid === checkUser && zoom >= 15
                                  ? (
                                    <div
                                      className={styles.check}
                                      style={{
                                        width: `${72 * Math.pow(2, zoom - 18)}px`,
                                        height: `${32 * Math.pow(2, zoom - 18)}px`,
                                        bottom: `${-4 * Math.pow(2, zoom - 18)}px`,
                                      }}
                                    />
                                  )
                                  : null}
                              </div>
                            </div>
                          );
                        })
                      }
                      <div
                        className={styles[data.type === 'color' ? 'map-overlay-color-detail' : 'map-overlay-image-detail']}
                        style={data.type === 'color' ? {
                          backgroundColor: data.color,
                          width: `${groupSize}px`,
                          height: `${groupSize}px`,
                          marginTop: `-${groupSize / 2}px`,
                          marginLeft: `-${groupSize / 2}px`,
                        } : {
                          backgroundImage: `url(${data.imageURL})`,
                          width: `${groupSize}px`,
                          height: `${groupSize}px`,
                          marginTop: `-${groupSize / 2}px`,
                          marginLeft: `-${groupSize / 2}px`,
                        }}
                      />
                    </div>
                  </OverlayView>
                </GoogleMap>
              )
          }
        </LoadScript>
      </Layout>
    </>
  );
};

export default Group;
