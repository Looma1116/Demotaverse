/* eslint-disable no-restricted-properties */
const getCurrentIconSize = (zoom = 15) => {
  const baseSize = 12;
  return baseSize * Math.pow(2, zoom - 18);
};

export default getCurrentIconSize;
