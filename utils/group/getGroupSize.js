/* eslint-disable no-restricted-properties */
const getGroupSize = (totalParticipants = 1, zoom = 15) => {
  const baseSize = 60;
  const mutiple = Math.sqrt(totalParticipants);
  return baseSize * mutiple * Math.pow(2, zoom - 15);
};

export default getGroupSize;
