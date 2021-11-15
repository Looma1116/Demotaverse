/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import {
  getFirestore, updateDoc, doc, increment, arrayUnion, deleteDoc, addDoc, collection,
} from 'firebase/firestore';

import styles from 'components/chatting/styles.module.scss';

const Chatting = ({
  voteData,
  chattingList,
  groupOwner,
  group,
}) => {
  const scrollRef = useRef();
  const [comment, setComment] = useState('');

  const router = useRouter();
  const isGroupPage = router.pathname !== '/';

  const auth = getAuth();
  const { uid, displayName } = auth.currentUser;

  useEffect(() => {
    if (scrollRef.current !== null) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chattingList]);

  const amIVoteMember = !voteData ? false : voteData.voteMembers.includes(uid);

  const handleVote = (index) => async () => {
    const db = getFirestore();
    const docRef = doc(db, 'groups', group, 'vote', 'vote-1');
    await updateDoc(docRef, {
      totalVotes: increment(1),
      voteMembers: arrayUnion(uid),
      [`voteItem-${index}.total`]: increment(1),
    });
  };

  const handleVoteDelete = async () => {
    if (window.confirm('정말로 투표를 삭제하시겠습니까?')) {
      const db = getFirestore();
      const docRef = doc(db, 'groups', group, 'vote', 'vote-1');
      await deleteDoc(docRef);
      alert('투표가 삭제되었습니다');
    }
  };

  const addComment = () => {
    if (comment.length < 2) return alert('최소 2글자를 입력해주세요');
    const db = getFirestore();
    const collectionRef = collection(db, 'groups', group, 'chatting');
    addDoc(collectionRef, {
      displayName,
      comment,
      created: new Date().getTime(),
    });
    setComment('');
  };

  const handleKeyDownComment = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      addComment();
    }
  };

  const [maxVote, setMaxVote] = useState(1);

  useEffect(() => {
    if (voteData !== null && voteData !== undefined) {
      for (let i = 0; i < voteData.totalVoteItems; i += 1) {
        if (maxVote < voteData[`voteItem-${i + 1}`].total) setMaxVote(voteData[`voteItem-${i + 1}`].total);
      }
    }
  }, [voteData]);

  if (!group) return null;

  return (
    <div className={styles[isGroupPage ? 'chatting-wrapper' : 'chatting-wrapper2']}>
      {
        voteData
          ? (
            <div className={styles['vote-card']}>
              <div className={styles['vote-name']}>{`[${voteData.voteName}]`}</div>
              <div className={styles['vote-content']}>{`"${voteData.voteContent}"`}</div>
              {
                !amIVoteMember
                  ? (
                    <div className={styles['vote-items-wrapper']}>
                      {
                        [...Array(voteData.totalVoteItems).keys()].map((v, i) => {
                          return (
                            <button type="button" key={String(i)} onClick={handleVote(i + 1)}>{voteData[`voteItem-${i + 1}`].item}</button>
                          );
                        })
                      }
                    </div>
                  )
                  : (
                    <div className={styles['vote-items-wrapper']}>
                      {
                        [...Array(voteData.totalVoteItems).keys()].map((v, i) => {
                          const { item, total } = voteData[`voteItem-${i + 1}`];
                          return (
                            <div key={String(i)} className={styles['vote-result-col']}>
                              <div className={styles['label-row']}>
                                <div>{`${i + 1}. ${item}`}</div>
                                <div className={styles['icon-wrapper']}>
                                  <img src="/icon/people.png" alt="people" />
                                  <div>{total}</div>
                                </div>
                              </div>
                              <div className={total === maxVote ? styles['vote-max'] : styles['vote-normal']} style={{ width: `${288 * (total / maxVote)}px` }} />
                            </div>
                          );
                        })
                      }
                    </div>
                  )
              }
              {
                groupOwner === uid
                  ? <button type="button" className={styles['vote-complete']} onClick={handleVoteDelete}>투표 삭제하기</button>
                  : null
              }
            </div>
          )
          : null
      }
      <div className={styles['chatting-label']}>채팅</div>
      <div className={styles['chatting-list']} ref={scrollRef}>
        {
          chattingList.map((chat, i) => {
            return (
              <div key={String(i)}>{`${chat.displayName}: ${chat.comment}`}</div>
            );
          })
        }
      </div>
      <textarea
        className={styles['chatting-input']}
        placeholder="댓글을 입력해주세요"
        value={comment}
        onChange={({ target: { value } }) => setComment(value)}
        onKeyDown={handleKeyDownComment}
      />
      <button type="button" className={styles['chatting-btn']} onClick={addComment}>댓글 작성</button>
      {
        isGroupPage
          ? null
          : (
            <button type="button" className={styles['chatting-btn']} onClick={() => router.push(`/${group}`)}>그룹으로 돌아가기</button>
          )
      }
    </div>
  );
};

export default Chatting;
