# 소안도의 노래 · Suno 실험실

기존 가사 첨삭에 보컬·분위기 선택과 영어 Suno 프롬프트 생성을 추가한 별도 테스트 사이트입니다.

- 테스트 브랜치: `suno-prompt-test`
- 테스트 Worker: `soando-lyrics-suno-test`
- 가사 완성 → 노래 분위기 정하기 → 보컬·분위기 선택 → 영어 프롬프트 만들기
- 가사는 Suno Custom의 Lyrics에, 영어 설명은 Styles에 각각 복사합니다.
- 프롬프트는 브라우저에서 조합하므로 추가 AI/API 사용량이 없습니다. Suno에서 노래 만들기는 별도입니다.
- 기존 첨삭·사진 인식은 COACH Service Binding을 통해 운영 앱의 학생용 API를 사용하며 같은 사용량 한도를 공유합니다.

`npm ci`, `npm test`로 검증합니다. 배포 설정은 별도 Worker를 가리킵니다. 운영 Worker 이름으로 바꾸지 마세요.

Suno가 지시를 완벽히 따르는 것을 보장하지 않으므로 완성곡을 들어 확인합니다. 기존 운영 문서는 당시 구현의 기록입니다.
