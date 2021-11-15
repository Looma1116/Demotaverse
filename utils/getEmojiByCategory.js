import presetCategory from 'config/presetCategory';

const getEmojiByCategory = (category) => {
  switch (category) {
    case presetCategory[0]:
      return '🌳';
    case presetCategory[1]:
      return '💰';
    case presetCategory[2]:
      return '⚖️';
    case presetCategory[3]:
      return '💦';
    case presetCategory[4]:
      return '📡';
    case presetCategory[5]:
      return '🙏';
    case presetCategory[6]:
      return '🐶';
    case presetCategory[7]:
      return '🎎';
    case presetCategory[8]:
      return '🏠';
    case presetCategory[9]:
      return '🎓';
    case presetCategory[10]:
      return '🩺';
    case presetCategory[11]:
      return '😀';
    case presetCategory[12]:
      return '🌏';
    default:
      return '';
  }
};

export default getEmojiByCategory;
