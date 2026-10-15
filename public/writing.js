export function isShortDraft(text){
  const lines=text.split('\n').filter(line=>line.trim()).length;
  return text.replace(/\s/g,'').length<60||lines<4;
}
export function expansionHint(){return '조금 더 길게 써 볼까요? 누구의 어떤 모습을 떠올렸는지, 왜 그런 마음이 들었는지 한두 줄 더해 보세요. 네 줄 정도를 출발점으로 삼아도 좋아요.';}
