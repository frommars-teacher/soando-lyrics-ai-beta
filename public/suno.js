export const MUSIC_OPTIONS={
 vocal:[
  {id:'clear',label:'높고 맑은 목소리',hint:'높은 음역의 또렷한 독창',en:'one high-register solo voice with a pure, clear timbre and precise Korean diction'},
  {id:'low',label:'낮고 묵직한 목소리',hint:'낮은 음역의 깊은 독창',en:'one low-register solo voice with a deep, resonant timbre and precise Korean diction'},
  {id:'husky',label:'살짝 거친 허스키',hint:'숨결과 거친 질감이 들리는 독창',en:'one mid-register solo voice with a lightly raspy, husky timbre and intelligible Korean diction'},
  {id:'child',label:'어린이 한 명의 독창',hint:'우리 나이 친구가 혼자 부르듯',en:'one natural child solo voice, without an exaggerated baby voice, with clear Korean diction'},
  {id:'duet',label:'두 사람이 부르는 듀엣',hint:'높은 목소리와 낮은 목소리가 함께',en:'a high and a low voice singing the supplied lyrics together as a duet, without overlapping different words'},
  {id:'choir',label:'우리 반처럼 여럿이 합창',hint:'여러 어린이의 목소리가 하나로',en:'a small children\'s choir singing the supplied lyrics in unison, with clear Korean diction and no extra backing words'}
 ],
 mood:[
  {id:'remember',label:'조용히 기억하는 노래',hint:'소안도의 이야기에 귀 기울이듯',en:'a reflective song of remembrance, with restrained dynamics, spacious pauses and a simple melody',tempo:'a slow, unhurried pulse'},
  {id:'courage',label:'용기를 외치는 노래',hint:'어려움에도 뜻을 굽히지 않는 힘',en:'a resolute song of courage, with accented beats, a firm rhythm and a rising melody',tempo:'a firm, steady mid-tempo pulse'},
  {id:'solidarity',label:'함께 걷는 노래',hint:'서로 손을 놓지 않는 소안도 사람들',en:'a song of solidarity, with an even walking pulse, connected melodic phrases and a united musical feel',tempo:'a steady walking tempo'},
  {id:'freedom',label:'자유를 맞이하는 노래',hint:'기다리던 자유를 만난 벅찬 순간',en:'a song celebrating freedom, with buoyant rhythms, open harmonies and a bright, expansive musical lift',tempo:'an energetic, upbeat pulse'},
  {id:'thanks',label:'고마움을 전하는 노래',hint:'용기를 지킨 분들께 보내는 편지',en:'a song of gratitude, with gentle accompaniment, flowing phrases and an intimate, letter-like musical feel',tempo:'a relaxed, moderate tempo'},
  {id:'promise',label:'내일을 약속하는 노래',hint:'그 용기를 우리도 이어 가겠다는 다짐',en:'a hopeful song of commitment, beginning simply and building gradually toward a full, uplifting ending',tempo:'a steady mid-tempo pulse'}
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
 const style=`A Korean-language song: ${genre.en}. ${vocal.en}. ${mood.en}; ${tempo.en||mood.tempo}. Express the selected theme through the music, without adding lyrics. Keep the words clearly audible. ${LYRIC_RULES}`;
 return {lyrics,style,exclude:EXCLUDED_ELEMENTS,summary:[vocal.label,mood.label,genre.label,tempo.label],settings:normalized};
}
