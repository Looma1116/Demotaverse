/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-body-style */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';

import {
  collection, getDocs, getFirestore, orderBy, where, query, limit,
} from 'firebase/firestore';

import styles from 'components/nav/styles.module.scss';
import openCreateGroupModal from 'utils/modal/openCreateGroupModal';
import Dropdown from 'components/dropdown';

import presetCategory from 'config/presetCategory';
import getEmojiByCategory from 'utils/getEmojiByCategory';

const FieldNav = ({
  joinGroup,
}) => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [rankLists, setRankLists] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [open, setOpen] = useState(true);

  useEffect(async () => {
    const db = getFirestore();
    const collectionRef = collection(db, 'groups');

    const _findCategory = where('category', '==', category);
    const _orderBy = orderBy('totalParticipants', 'desc');
    const _limit = limit(15);

    const execQuery = category === 'ALL'
      ? query(collectionRef, _orderBy, _limit)
      : query(collectionRef, _findCategory, _orderBy, _limit);

    const querySnapshot = await getDocs(execQuery);
    const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setLoading(false);
    setRankLists(docs);
  }, [category]);

  const handleSignOut = async () => {
    if (window.confirm('뒤로 가시면 그동안 가입한 모든 그룹에서 탈퇴됩니다\n정말로 뒤로 가시겠습니까?')) {
      const auth = getAuth();
      const { uid } = auth.currentUser;

      await Promise.all([
        signOut(auth),
        fetch(`/api/deleteUser?uid=${uid}`),
      ]);
    }
  };

  const handleOpenCreateModal = () => {
    if (joinGroup !== '') {
      alert('이미 소속되어있는 그룹이 있습니다. 먼저 탈퇴하고 만들어주세요.');
    } else {
      openCreateGroupModal();
    }
  };

  if (!open) {
    return (
      <button type="button" className={styles.opener} onClick={() => setOpen(true)}>
        열기
      </button>
    );
  }

  return (
    <div className={styles['nav-container2']}>
      <div className={styles['arrow-wrapper']}>
        <div className={styles.row}>
          <button type="button" onClick={handleSignOut}>
            <img src="/icon/arrow-left.png" alt="arrow-back" className={styles['arrow-left']} />
          </button>
          <div className={styles.label}>로비</div>
        </div>
        <button type="button" onClick={() => setOpen(false)} className={styles.close}>접기</button>
      </div>
      <div className={styles['nav-label']}>Ranking Top 15</div>
      <div className={styles['dropdown-wrapper']}>
        <Dropdown
          value={category}
          valueSets={['ALL', ...presetCategory]}
          setter={setCategory}
        />
      </div>
      <div className={styles['ranklists-wrapper']}>
        {rankLists.map((group, i) => (
          <Link key={String(i)} href={`/?lat=${group.center.lat}&lng=${group.center.lng}&tg=${group.id}`}>
            <a className={styles['rank-row']}>
              <div>{`${i + 1}.  ${getEmojiByCategory(group.category)}   ${group.groupName}`}</div>
              <div className={styles['icon-row-t2']}>
                <img src="/icon/people.png" alt="people" />
                {group.totalParticipants}
              </div>
            </a>
          </Link>
        ))}
      </div>
      <button type="button" className={styles['btn-wrapper-01']} onClick={handleOpenCreateModal}>
        그룹생성하기
      </button>
    </div>
  );
};

export default FieldNav;
