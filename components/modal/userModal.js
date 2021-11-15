/* eslint-disable react/prop-types */
/* eslint-disable consistent-return */
/* eslint-disable arrow-body-style */
import React from 'react';
import { useRouter } from 'next/router';

import {
  getFirestore, increment, updateDoc, doc, deleteDoc, setDoc,
} from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

import closeUserModal from 'utils/modal/closeUserModal';

import styles from 'components/modal/styles.module.scss';

const UserModal = ({
  userLists,
  owner,
}) => {
  const router = useRouter();
  const { group } = router.query;

  const auth = getAuth();
  const { uid } = auth.currentUser;

  const isOwner = uid === owner;

  const changeLeader = (index) => async () => {
    if (window.confirm(`${userLists[index].displayName}님에게 정말로 리더를 위임하시겠습니까?`)) {
      const db = getFirestore();
      await Promise.all([
        updateDoc(doc(db, 'groups', group), {
          owner: userLists[index].uid,
        }),
      ]);
      alert('리더가 위임되었습니다');
    }
  };

  const addBlacklist = (index) => async () => {
    if (window.confirm(`${userLists[index].displayName}님을 정말로 블랙리스트에 추가하시겠습니까?`)) {
      const db = getFirestore();
      await Promise.all([
        setDoc(doc(db, 'groups', group, 'blacklist', userLists[index].uid), { isBlacklist: true }),
        updateDoc(doc(db, 'users', userLists[index].uid), {
          joinGroup: '',
        }),
        deleteDoc(doc(db, 'groups', group, 'participants', userLists[index].uid)),
        updateDoc(doc(db, 'groups', group), {
          totalParticipants: increment(-1),
        }),
      ]);
      alert('블랙리스트에 추가되었습니다');
    }
  };

  return (
    <div className={styles['modal-background-shadow']} id="user-modal">
      <div className={styles['modal-card-wrapper']}>
        <button type="button" onClick={closeUserModal}>
          <img src="/icon/close.png" alt="close" className={styles.close} />
        </button>
        <div className={styles['modal-card-t3']}>
          {
            userLists.map((user, i) => {
              return (
                <div key={String(i)} className={styles['user-row']}>
                  <div className={styles['displayName-wrapper']}>
                    {user.displayName}
                    {user.uid === owner ? <div className={styles.badge}>리더</div> : null}
                  </div>
                  <div>
                    {isOwner && user.uid !== owner
                      ? <button type="button" className={styles['leader-change-btn']} onClick={changeLeader(i)}>그룹리더 위임</button>
                      : null }
                    {isOwner && user.uid !== owner
                      ? <button type="button" className={styles['blacklist-btn']} onClick={addBlacklist(i)}>블랙리스트 추가</button>
                      : null }
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};

export default UserModal;
