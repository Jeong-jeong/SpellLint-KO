const getPreprocessedWord = (word: string) => {
  if (word.trim().length === 0) {
    return '';
  }

  return word.replace(/[^가-힣]/g, '');
};

export default getPreprocessedWord;