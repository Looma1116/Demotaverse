/* eslint-disable max-len */
/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';

import { useRouter } from 'next/router';
import Head from 'next/head';

import FieldNav from 'components/nav/fieldNav';

import styles from 'components/layout/styles.module.scss';
import GroupNav from 'components/nav/groupNav';
import Chatting from 'components/chatting';

const Layout = ({
  title,
  children,
  isLoggedIn,
  groupData,
  voteData,
  chattingList,
  joinGroup,
}) => {
  const router = useRouter();

  const isGroupPage = isLoggedIn && router.pathname !== '/';

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="truee" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      {
        isLoggedIn === null
          ? null
          : isLoggedIn === false
            ? null
            : router.pathname === '/'
              ? <FieldNav joinGroup={joinGroup} />
              : (
                <GroupNav
                  groupData={groupData}
                  hasVote={voteData !== null && voteData !== undefined}
                />
              )
        }
      <div className={isGroupPage ? styles['content-section2'] : styles['content-section']}>
        {children}
      </div>
      {
        isGroupPage ? <Chatting groupOwner={groupData ? groupData.owner : ''} voteData={voteData} chattingList={chattingList} group={router.query.group} /> : null
      }
      {
        isLoggedIn && router.pathname === '/' && joinGroup !== '' ? <Chatting groupOwner={groupData ? groupData.owner : ''} voteData={voteData} chattingList={chattingList} group={joinGroup} /> : null
      }
    </div>
  );
};

Layout.propTypes = {
  title: PropTypes.string,
  isLoggedIn: PropTypes.bool,
};

Layout.defaultProps = {
  title: '',
  isLoggedIn: false,
};

export default Layout;
