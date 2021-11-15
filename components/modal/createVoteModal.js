/* eslint-disable react/prop-types */
/* eslint-disable consistent-return */
/* eslint-disable arrow-body-style */
import React, { useState } from 'react';
import { useRouter } from 'next/router';

import { List } from 'immutable';

import {
  getFirestore, setDoc, doc,
} from 'firebase/firestore';

import styles from 'components/modal/styles.module.scss';

import Input from 'components/input';
import LoadingButton from 'components/loadingButton';
import closeCreateVoteModal from 'utils/modal/closeCreateVoteModal';

const CreateVoteModal = () => {
  const router = useRouter();
  const { group } = router.query;

  const [voteName, setVoteName] = useState('');
  const [voteContent, setVoteContent] = useState('');
  const [voteItems, setVoteItems] = useState(List(['', '']));

  const addGroup = async () => {
    if (voteName.length < 2) return alert('최소 2자 이상의 그룹 이름을 입력해주세요');
    if (voteContent.length < 2) return alert('최소 2자 이상의 그룹 슬로건을 입력해주세요');

    const db = getFirestore();

    const voteDocRef = doc(db, 'groups', group, 'vote', 'vote-1');

    const data = {
      created: new Date().getTime(),
      voteName,
      voteContent,
      totalVotes: 0,
      totalVoteItems: voteItems.size,
      voteMembers: [],
    };

    for (let i = 0; i < voteItems.size; i += 1) {
      data[`voteItem-${i + 1}`] = {
        item: voteItems.get(i),
        total: 0,
      };
    }

    await setDoc(voteDocRef, data);

    alert('투표가 성공적으로 만들어졌습니다');
    closeCreateVoteModal();
  };

  const addRow = () => {
    setVoteItems(voteItems.push(''));
  };

  const deleteRow = (index) => () => {
    setVoteItems(voteItems.delete(index));
  };

  return (
    <div className={styles['modal-background-shadow']} id="create-vote-modal" style={{ width: `${window.innerWidth}px` }}>
      <div className={styles['modal-card-wrapper']}>
        <button type="button" onClick={closeCreateVoteModal}>
          <img src="/icon/close.png" alt="close" className={styles.close} />
        </button>
        <div className={styles['modal-card-t2']}>
          <div className={styles.label}>투표 만들기</div>
          <div className={styles['input-wrapper']}>
            <Input
              placeholder="투표 제목을 입력해주세요"
              value={voteName}
              onChange={({ target: { value } }) => setVoteName(value)}
            />
          </div>
          <div className={styles['input-wrapper']}>
            <Input
              placeholder="투표 내용을 입력해주세요"
              value={voteContent}
              onChange={({ target: { value } }) => setVoteContent(value)}
            />
          </div>
          <div className={styles['vote-item-label-row']}>
            <div>답항목</div>
            <button type="button" onClick={addRow}>항목 추가하기</button>
          </div>
          {
            voteItems.toJS().map((vi, i) => {
              if (i === 0 || i === 1) {
                return (
                  <div className={styles['input-wrapper']} key={String(i)}>
                    <Input
                      placeholder="항목을 추가해주세요"
                      value={vi}
                      onChange={({ target: { value } }) => setVoteItems(voteItems.set(i, value))}
                    />
                  </div>
                );
              }

              return (
                <div className={styles['input-wrapper']} key={String(i)}>
                  <Input
                    placeholder="항목을 추가해주세요"
                    value={vi}
                    onChange={({ target: { value } }) => setVoteItems(voteItems.set(i, value))}
                  />
                  <button type="button" onClick={deleteRow(i)}>삭제</button>
                </div>
              );
            })
          }
          <div className={styles['submit-button-wrapper']}>
            <LoadingButton label="투표 만들기" onClick={addGroup} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVoteModal;
