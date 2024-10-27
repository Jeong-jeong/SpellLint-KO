const checkBeginsWithKorean = (line: string) => line.match(/([가-힣]+[^\n]*[.!?]?)/g);

export default checkBeginsWithKorean;