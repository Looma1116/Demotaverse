/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';

import ReactLoading from 'react-loading';

import styles from 'components/loadingButton/styles.module.scss';

const LoadingButton = ({
  label,
  loading,
  onClick,
}) => {
  return (
    <button type="button" className={styles.container} onClick={onClick}>
      <div className={styles.space} />
      {label}
      {loading ? <ReactLoading width={24} height={24} type="spin" /> : <div className={styles.space} />}
    </button>
  );
};

LoadingButton.propTypes = {
  label: PropTypes.string,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

LoadingButton.defaultProps = {
  label: '',
  loading: false,
  onClick: undefined,
};

export default LoadingButton;
