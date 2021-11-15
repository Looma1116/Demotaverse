/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';

import styles from 'components/input/styles.module.scss';

const Input = ({
  value,
  onChange,
  placeholder,
  onKeyDown,
  secure,
  readOnly,
}) => {
  return (
    <input
      className={styles.input}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type={secure ? 'password' : 'email'}
      readOnly={readOnly}
    />
  );
};

Input.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  secure: PropTypes.bool,
  readOnly: PropTypes.bool,
};

Input.defaultProps = {
  placeholder: '',
  value: '',
  onChange: () => {},
  onKeyDown: () => {},
  secure: false,
  readOnly: false,
};

export default Input;
