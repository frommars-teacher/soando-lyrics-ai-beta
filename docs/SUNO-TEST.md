# Suno 테스트 사이트

운영 사이트와 다른 Worker `soando-lyrics-suno-test`와 `suno-prompt-test` 브랜치를 사용합니다. 가사 완성 후 목소리와 분위기를 고르고 영어 설명을 만듭니다. 반주·빠르기는 선택 사항입니다.

가사는 Suno Custom의 Lyrics에, 영어 설명은 Styles에 각각 복사합니다. Exclude용 문구도 제공합니다. 가사 원문은 번역하거나 태그를 삽입하지 않습니다. 정확한 가사·순서 유지, 추가·생략·변경·번역 금지, 애드립 금지, 표시 없는 반복 금지 지시를 항상 포함합니다. 이는 생성 모델에 보내는 요청이며 완성곡을 들어 확인해야 합니다.

프롬프트는 브라우저에서 선택지 문장을 조합하므로 새 AI API나 Suno API 키가 필요하지 않습니다. 노래 자동 생성·Suno 자동 전송은 하지 않습니다.

기존 첨삭과 사진 인식은 COACH Service Binding으로 운영 서비스의 `/api/status`, `/api/analyze`, `/api/transcribe`, `/api/queue`만 호출합니다. 같은 계정의 모델·사용량·혼잡 한도를 공유합니다. 관리·사용량 API는 전달하지 않으며 비밀 키를 복제하지 않습니다. 별도 주소의 브라우저 저장소는 운영 주소와 분리됩니다.

자동 검증 44개 통과: 기존 흐름, 전체 보컬·분위기 조합, 필수 선택, 원문 보존, 복사, 선택 변경, 최신 편집 반영, 새로고침 복원, 프롬프트 생성 시 AI 호출 없음, 프록시 경로 제한. 데스크톱과 390px 모바일 화면 점검 완료. 실제 Suno 음악 생성은 별도입니다.

- [Suno Custom 안내](https://help.suno.com/en/articles/3726721)
- [Suno Exclude 안내](https://help.suno.com/en/articles/3161921)
- [Cloudflare Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
