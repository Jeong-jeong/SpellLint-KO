const getPreprocessedWord = (word: string) => word.replace(/[^가-힣]/g, '');

export default getPreprocessedWord;