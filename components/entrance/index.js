/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
import React, { useState } from 'react';

import {
  getAuth, signInAnonymously, updateProfile,
} from 'firebase/auth';

import { getFirestore, setDoc, doc } from 'firebase/firestore';

import Layout from 'components/layout';
import Input from 'components/input';
import LoadingButton from 'components/loadingButton';

import styles from 'components/entrance/styles.module.scss';

const Entrance = () => {
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');

  const handleNickname = ({ target: { value } }) => {
    setNickname(value);
  };

  const handleSubmit = async () => {
    if (nickname.length < 2) return alert('2글자 이상 입력해주세요');
    const auth = getAuth();
    await signInAnonymously(auth);
    const db = getFirestore();
    await Promise.all([
      updateProfile(auth.currentUser, { displayName: nickname }),
      setDoc(doc(db, 'users', auth.currentUser.uid), {
        joinGroup: '',
      }),
    ]);
  };

  return (
    <Layout title="Demotaverse | 입장하기">
      <div className={styles.container}>
        <img src="/img/logo.png" alt="logo" />
        <div className={styles['input-wrapper']}>
          <Input placeholder="닉네임을 입력해주세요" value={nickname} onChange={handleNickname} />
        </div>
        <LoadingButton label="입장하기" loading={loading} onClick={handleSubmit} />
      </div>
    </Layout>
  );
};

export default Entrance;
