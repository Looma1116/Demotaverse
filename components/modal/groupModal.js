/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import { useRouter } from 'next/router';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import styles from 'components/modal/styles.module.scss';
import closeGroupModal from 'utils/modal/closeGroupModal';
import getEmojiByCategory from 'utils/getEmojiByCategory';

const GroupModal = ({
  id,
  groupName,
  totalParticipants,
  groupSlogun,
  groupIntro,
  groupPageURL,
  category,
  center = { lat: 0, lng: 0 },
  joinGroup,
}) => {
  const router = useRouter();

  const handleCancle = () => {
    router.replace('/');
    closeGroupModal();
  };

  const handleParticipate = () => {
    if (joinGroup !== '' && joinGroup !== id) {
      if (window.confirm('기존에 가입했던 그룹이 자동 탈퇴됩니다\n정말로 가입하시겠습니까?')) {
        router.push(`/${id}`);
      }
    } else {
      router.push(`/${id}`);
    }
  };

  const handleWindowOpne = () => {
    window.open(groupPageURL.includes('://') ? groupPageURL : `http://${groupPageURL}`);
  };

  return (
    <div className={styles['group-modal-bg']} id="group-modal">
      <div className={styles['modal-card-t1']}>
        <div className={styles['title-row']}>
          <div className={styles.title}>{`${groupName} ${getEmojiByCategory(category)}`}</div>
          <div className={styles['icon-row']}>
            <img src="/icon/people.png" alt="people" />
            <div className={styles['total-people']}>{totalParticipants}</div>
            <CopyToClipboard text={`https://demotaverse.vercel.app/?lat=${center.lat}&lng=${center.lng}&tg=${id}`}>
              <button type="button" onClick={() => alert('주소가 클립보드에 복사되었습니다!')}>
                <img src="/icon/share.png" alt="share" />
              </button>
            </CopyToClipboard>
          </div>
        </div>
        <div className={styles.slogun}>{groupSlogun}</div>
        <div className={styles.introduction}>{groupIntro}</div>
        {
          groupPageURL
            ? <button className={styles.link} type="button" onClick={handleWindowOpne}>{groupPageURL}</button>
            : null
        }
        <div className={styles['btn-row']}>
          <button type="button" className={styles['cancel-btn']} onClick={handleCancle}>취소</button>
          <button type="button" className={styles['join-btn']} onClick={handleParticipate}>그룹참여하기</button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
