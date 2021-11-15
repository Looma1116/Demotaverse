/* eslint-disable react/prop-types */
import React, { useRef, useState } from 'react';

import styles from 'components/dropdown/styles.module.scss';
import getEmojiByCategory from 'utils/getEmojiByCategory';

const Dropdown = ({
  value,
  setter,
  valueSets,
  placeholder,
  defaultBackgroundColor = 'white',
  defaultTextColor = 'black',
  border = false,
  borderColor,
}) => {
  const ref = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const open = () => {
    ref.current.style.maxHeight = '230px';
    setDropdownOpen(true);
  };

  const close = (v) => () => {
    ref.current.style.maxHeight = '0px';
    setDropdownOpen(false);
    setter(v);
  };

  const borderStyle = border ? { border: `solid 1px ${borderColor}` } : {};

  return (
    <div className={styles['dropdown-wrapper']} style={borderStyle}>
      <button
        type="button"
        className={styles['dropdown-default']}
        onClick={dropdownOpen ? close(value) : open}
        style={{ backgroundColor: defaultBackgroundColor }}
      >
        <div style={{ color: defaultTextColor }}>{value || placeholder}</div>
        <img alt="arrow" src={`/icon/arrow-${dropdownOpen ? 'top' : 'down'}-grey-1.png`} />
      </button>
      <div className={styles['dropdown-list-wrapper']} ref={ref} style={{ ...borderStyle, width: border ? 'calc(100%+2px)' : '100%', left: border ? '-1px' : '0px' }}>
        {
          valueSets.map((v, i) => (
            <button
              type="button"
              className={styles['dropdown-item']}
              key={String(i)}
              onClick={close(v)}
            >
              <div>{`${v} ${getEmojiByCategory(v)}`}</div>
            </button>
          ))
        }
      </div>
    </div>
  );
};

export default Dropdown;
