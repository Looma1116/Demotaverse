/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
import React, { useState } from 'react';
import { useRouter } from 'next/router';

import { getAuth } from 'firebase/auth';
import {
  getFirestore, deleteDoc, doc, updateDoc, collection, query, getDocs, where,
} from 'firebase/firestore';

import styles from 'components/nav/styles.module.scss';
import openUserModal from 'utils/modal/openUserModal';
import openUpdateGroupModal from 'utils/modal/openUpdateGroupModal';
import openCreateVoteModal from 'utils/modal/openCreateVoteModal';
import openMoveGroupModal from 'utils/modal/openMoveGroupModal';
import getEmojiByCategory from 'utils/getEmojiByCategory';

const GroupNav = ({
  groupData,
  hasVote,
}) => {
  const router = useRouter();
  const { group } = router.query;

  const auth = getAuth();
  const { uid } = auth.currentUser;

  const [open, setOpen] = useState(true);

  const resignGroup = async () => {
    if (uid === groupData.owner) return alert('그룹리더는 탈퇴하실 수 없습니다');
    if (window.confirm('정말로 탈퇴하시겠습니까?')) {
      alert('탈퇴되었습니다');
      router.replace('/');
      await fetch(`/api/resignGroup?groupId=${group}&uid=${uid}`);
    }
  };

  const deleteGroup = async () => {
    if (window.confirm('정말로 그룹을 삭제하시겠습니까?')) {
      const db = getFirestore();

      const userCollectionRef = collection(db, 'users');
      const q = query(userCollectionRef, where('joinGroup', '==', group));
      const qs = await getDocs(q);

      qs.forEach(async (d) => {
        await updateDoc(doc(db, 'users', d.id), { joinGroup: '' });
      });

      await Promise.all([
        deleteDoc(doc(db, 'groups', group)),
        updateDoc(doc(db, 'users', uid), {
          joinGroup: '',
        }),
      ]);
      router.replace('/');
      alert('삭제되었습니다');
    }
  };

  const handleWindowOpne = () => {
    window.open(groupData.groupPageURL.includes('://') ? groupData.groupPageURL : `http://${groupData.groupPageURL}`);
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
          <button type="button" onClick={() => router.replace('/')}>
            <img src="/icon/arrow-left.png" alt="arrow-back" className={styles['arrow-left']} />
          </button>
          <div className={styles.label}>월드</div>
        </div>
        <button type="button" onClick={() => setOpen(false)} className={styles.close}>접기</button>
      </div>
      <div className={styles.groupName}>{`${groupData.groupName} ${getEmojiByCategory(groupData.category)}`}</div>
      <div className={styles['icon-row']}>
        <img src="/icon/people.png" alt="people" />
        <div>{groupData.totalParticipants}</div>
      </div>
      <div className={styles.groupSlogun}>{groupData.groupSlogun}</div>
      <div className={styles.groupIntro}>{groupData.groupIntro}</div>
      {groupData.groupPageURL ? <button type="button" className={styles.groupPageURL} onClick={handleWindowOpne}>{groupData.groupPageURL}</button> : null}
      <div className={styles['group-nav-btn-section']}>
        {
          uid === groupData.owner
            ? (
              <>
                {
                  hasVote
                    ? null
                    : (
                      <button type="button" onClick={openCreateVoteModal} className={styles.t3}>
                        투표 만들기
                      </button>
                    )
                }
                <div className={styles['btn-row']}>
                  <button type="button" onClick={openUpdateGroupModal} className={styles.t1}>
                    그룹수정하기
                  </button>
                  <button type="button" onClick={deleteGroup} className={styles.t2}>
                    그룹삭제하기
                  </button>
                </div>
              </>
            )
            : null
        }
        <div className={styles['btn-row']}>
          <button type="button" onClick={openUserModal} className={styles.t1}>
            유저정보보기
          </button>
          <button type="button" onClick={resignGroup} className={styles.t2}>
            그룹 탈퇴하기
          </button>
        </div>
        {
          uid === groupData.owner
            ? (
              <button type="button" onClick={openMoveGroupModal} className={styles.t3}>
                그룹 이동시키기
              </button>
            )
            : null
        }
      </div>
    </div>
  );
};

export default GroupNav;
