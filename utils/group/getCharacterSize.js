/* eslint-disable no-restricted-properties */
const getCharacterSize = (zoom = 15) => {
  const baseSize = 64;
  return baseSize * Math.pow(2, zoom - 18);
};

export default getCharacterSize;
