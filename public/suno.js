export const MUSIC_OPTIONS={
 vocal:[
  {id:'clear',label:'맑고 또렷하게',hint:'가사가 잘 들리는 목소리',en:'clear, natural lead vocals with crisp Korean diction'},
  {id:'warm',label:'따뜻하고 부드럽게',hint:'다정하게 마음을 전해요',en:'warm, gentle lead vocals with a soft, sincere delivery'},
  {id:'strong',label:'힘 있고 씩씩하게',hint:'자신 있게 용기를 전해요',en:'strong, confident lead vocals with clear articulation'},
  {id:'soft',label:'잔잔하고 섬세하게',hint:'조용히 이야기를 들려줘요',en:'intimate, delicate lead vocals, softly sung with clear words'},
  {id:'bright',label:'밝고 가볍게',hint:'웃으며 부르는 듯한 목소리',en:'bright, light lead vocals with a fresh, friendly tone'},
  {id:'together',label:'여럿이 함께',hint:'같은 가사를 함께 불러요',en:'a small vocal group singing the written lyrics in unison, with no extra backing-vocal words'}
 ],
 mood:[
  {id:'joyful',label:'밝고 신나게',hint:'몸이 살짝 들썩이는 노래',en:'bright, joyful and playful',tempo:'an upbeat, steady rhythm'},
  {id:'cozy',label:'따뜻하고 포근하게',hint:'고마운 마음을 안아 주듯',en:'warm, comforting and heartfelt',tempo:'a relaxed, moderate tempo'},
  {id:'moving',label:'뭉클하고 진지하게',hint:'마음에 오래 남는 노래',en:'moving, sincere and reflective',tempo:'a gentle, unhurried tempo'},
  {id:'hopeful',label:'희망차고 벅차게',hint:'내일을 향해 힘이 나요',en:'hopeful, uplifting and inspiring',tempo:'a steady mid-tempo pulse'},
  {id:'calm',label:'차분하고 편안하게',hint:'내 이야기에 귀 기울이듯',en:'calm, peaceful and thoughtful',tempo:'a calm, slow tempo'},
  {id:'brave',label:'굳세고 당당하게',hint:'함께 나아가는 마음으로',en:'brave, resolute and encouraging',tempo:'a firm, steady mid-tempo rhythm'}
 ],
 genre:[
  {id:'acoustic',label:'기타가 들리는 팝',en:'acoustic pop with acoustic guitar, light percussion and warm bass'},
  {id:'piano',label:'피아노 발라드',en:'a piano-led pop ballad with gentle, spacious accompaniment'},
  {id:'pop',label:'경쾌한 팝',en:'melodic pop with clean keyboards, bass and light drums'},
  {id:'band',label:'밴드 느낌',en:'melodic pop rock with clean electric guitar, bass and drums'}
 ],
 tempo:[
  {id:'auto',label:'분위기에 맞게',en:''},
  {id:'slow',label:'느리게',en:'a slow, unhurried tempo'},
  {id:'medium',label:'보통 빠르기로',en:'a steady, moderate tempo'},
  {id:'fast',label:'빠르고 경쾌하게',en:'a brisk, upbeat tempo'}
 ]
};
const find=(group,id)=>MUSIC_OPTIONS[group].find(option=>option.id===id);
export function normalizeMusic(settings={}){
 if(!settings||typeof settings!=='object')settings={};
 return {vocal:find('vocal',settings.vocal)?.id||'',mood:find('mood',settings.mood)?.id||'',genre:find('genre',settings.genre)?.id||'acoustic',tempo:find('tempo',settings.tempo)?.id||'auto'};
}
export const LYRIC_RULES='Sing only the supplied lyrics, exactly as written and in the original order. Do not add, rewrite, omit or translate any lyrics. No ad-libs, vocal fillers or spoken introductions. Do not repeat any line or section unless explicitly indicated in the supplied lyrics. End after the final written line.';
export const EXCLUDED_ELEMENTS='ad-libs, extra lyrics, improvised words, wordless vocals, humming, spoken introductions, unmarked repeated lines or sections';
export function buildSunoPrompt(lyrics,settings){
 if(typeof lyrics!=='string'||!lyrics.trim())throw new Error('먼저 최종 가사를 확인해 주세요.');
 const normalized=normalizeMusic(settings),vocal=find('vocal',normalized.vocal),mood=find('mood',normalized.mood);
 if(!vocal||!mood)throw new Error('목소리와 노래 분위기를 하나씩 골라 주세요.');
 const genre=find('genre',normalized.genre),tempo=find('tempo',normalized.tempo);
 const style=`A Korean-language song: ${genre.en}. ${vocal.en}. ${mood.en} mood; ${tempo.en||mood.tempo}. Keep the words clearly audible over the accompaniment. ${LYRIC_RULES}`;
 return {lyrics,style,exclude:EXCLUDED_ELEMENTS,summary:[vocal.label,mood.label,genre.label,tempo.label],settings:normalized};
}
