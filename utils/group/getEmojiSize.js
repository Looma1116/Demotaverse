/* eslint-disable no-restricted-properties */
const getEmojiSize = (zoom = 15) => {
  const baseSize = 24;
  return baseSize * Math.pow(2, zoom - 18);
};

export default getEmojiSize;
