/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';

import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

import 'styles/globals.scss';

const Demotaverse = ({ Component, pageProps }) => {
  if (getApps.length === 0) {
    initializeApp({
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId,
      measurementId: process.env.measurementId,
    });

    if (typeof window !== 'undefined') {
      getAnalytics();
    }
  }

  return <Component {...pageProps} />;
};

export default Demotaverse;
