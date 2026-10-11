# 모델·약관·개인정보 검토 (2026-10-11)

## 모델 비교

| 모델 | 공식 카탈로그 | 무료 플랜/결제 | 선택 판단 |
|---|---|---|---|
| `@cf/qwen/qwen3-30b-a3b-fp8` | 제공 확인, 다국어·명령 이해, 32,768 문맥 | 무료 할당 대상, 결제 필수 모델 목록에 없음 | 비용 여유가 큰 기본 후보. 한국어 가사 첨삭의 우수성은 아직 실측 안 함 |
| `@cf/zai-org/glm-4.7-flash` | 제공 확인, 다국어, 131,072 문맥 | 공식 변경 공지에서 Free 이용 가능 명시 | 대안 후보. Qwen보다 공개 단가가 조금 높음. 한국어 품질·속도 비교는 미실시 |
| `@cf/qwen/qwen3.8-27b` | 제공 확인 | 공개 단가가 Qwen3보다 높음 | 학급 무료 사용량 여유 때문에 기본 제외. 한국어 품질 비교는 미실시 |
| `@cf/zai-org/glm-5.2` / GLM-5.3 계열 | 제공 확인 | 결제 수단/Paid 또는 유료 크레딧 필수 | API 비용 0원 우선 조건에서 제외 |

Qwen 선택은 **잠정 선택**입니다. 모델이 다국어라는 설명만으로 한국어 첨삭의 품질을 보장하지 않습니다. 같은 가사로 원문 의도 보존, 자연스러운 한국어, 불필요한 수정, 역사 환각, JSON 성공률, 대기 시간을 확인해야 합니다. 무료 대체 제공업체를 무작정 추가하지 않았으며 약관 확인을 우회하지 않습니다.

Qwen 개별 모델 문서에는 `response_format`이 있으나, Cloudflare JSON Mode 지원 목록에는 Qwen3가 명시되어 있지 않습니다. 문서의 지원 범위가 완전히 일치하지 않으므로 실제 바인딩 호출로 확인해야 합니다. 코드에서 JSON schema 요청과 서버 검증을 사용합니다. 실패는 한국어 오류로 표시하며, 사용자 모르게 다른 모델로 바꾸거나 재호출하지 않습니다.

## 초등학생 대상 이용 판정

**확인되지 않음. 교사 전용 테스트로 제한.**

Qwen 원본 모델은 Apache-2.0 라이선스이며 그 라이선스에는 서비스 이용자의 최소 연령 규정이 없지만, 이는 Cloudflare 서비스를 통한 아동 대상 운영의 승인을 뜻하지 않습니다.

Cloudflare 개인정보처리방침에는 자체 Websites/Services가 18세 미만을 대상으로 하지 않는다는 설명이 있습니다. 동시에 고객이 운영하는 웹사이트/API 자체는 고객의 정책 및 법규 준수 책임으로 구분합니다. 이 구분만으로 한국 초6 대상 Workers AI 입력 처리까지 명시적으로 허용됐다고 단정할 수 없습니다. Self-Serve 계약의 Customer Content 및 End User 조항, Developer Platform 약관, Workers AI 데이터 정책을 검토했으나 본 서비스의 아동 사용에 대한 명확한 승인 근거는 확보하지 못했습니다.

따라서 UI의 ‘교사 테스트’ 표시와 서버 코드 보호를 유지하고 **학생에게 코드를 배포하지 않습니다**. 교사가 직접 작성한 비개인 가사로만 시험합니다. 학생 운영 전에는 Cloudflare 측에서 고객의 13세 미만 교육용 앱/한국 학생 데이터 처리 범위를 확인하고 학교 절차를 검토해야 합니다. 교사 코드만으로 성인 여부를 입증하거나 완전한 접근 통제를 제공하지 않습니다.

## 데이터 흐름

- 브라우저 localStorage: 가사 원본, 수정 내용, 분석 결과, 현재 단계. 명시적 삭제 또는 해당 브라우저 데이터 삭제 전까지 기기에 남음.
- Cloudflare Workers AI: 가사, 줄 번호, 역사 기준 자료, 첨삭 지시가 분석할 때 전송됨. API 키는 브라우저에 없으며 Worker `AI` 바인딩 사용.
- 서버 저장: 가사와 결과는 저장하지 않음. SQLite Durable Object에는 날짜별 호출 횟수, 예약 Neurons, 날짜와 교사 secret으로 HMAC 처리한 IP 식별자, 요청 수, 짧은 동시 요청 lease만 저장. 날짜가 바뀐 첫 요청 때 이전 상태 대체. 원본 IP를 직접 저장하지 않지만 접속 메타데이터를 완전히 익명이라 주장하지 않음.
- 교사 세션: HMAC 서명된 HttpOnly/Secure/SameSite cookie, 4시간 유효. 코드 자체는 localStorage에 저장하지 않음.
- Cloudflare 서비스 메타데이터: IP 등 서비스 제공 및 보안 목적으로 처리될 수 있음. Cloudflare 측 네트워크 로그까지 전혀 수집되지 않는다고 주장하지 않음.
- Workers observability는 기본 비활성화. 앱에 가사/AI 응답 console 로깅 없음. AI Gateway 로그·저장소·외부 분석 도구 없음.

Cloudflare Workers AI 문서는 명시적 동의 없이 Customer Content를 모델 학습 또는 Cloudflare/제3자 서비스 개선에 사용하지 않는다고 설명합니다. 이 설명을 무조건적인 데이터 무보관 보장으로 확대 해석하지 않습니다. 저장 서비스에 내용을 넣지 않으며 접속 메타데이터는 별도 정책에 따릅니다.

공용 기기에서는 완료 후 가사를 복사하고 ‘처음부터 다시 시작하기’를 사용합니다. 연락처·이메일·주민번호 형태는 서버에서 차단하지만 이름이나 개인 사연을 완벽히 탐지할 수는 없습니다.

## 출처

공식 자료를 2026-10-11 확인했습니다. 가격/모델/약관은 변경될 수 있으므로 수업 전에 다시 확인합니다.

1. [Workers AI 가격 및 무료 한도](https://developers.cloudflare.com/workers-ai/platform/pricing/)
2. [Qwen3 모델](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/)
3. [GLM-4.7-Flash 모델](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/)
4. [일부 모델 Paid 변경 공지](https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/)
5. [Qwen3.8-27B 모델](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/)
6. [JSON Mode 및 지원 범위](https://developers.cloudflare.com/workers-ai/features/json-mode/)
7. [Workers AI 데이터 정책](https://developers.cloudflare.com/workers-ai/platform/data-usage/)
8. [Cloudflare Self-Serve 계약](https://www.cloudflare.com/terms/)
9. [Developer Platform 약관](https://www.cloudflare.com/service-specific-terms-developer-platform/)
10. [Cloudflare 개인정보처리방침](https://www.cloudflare.com/privacypolicy/)
11. [Qwen 원본 모델 라이선스](https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE)
12. [한국관광공사 — 항일의 땅, 해방의 섬, 완도 소안도](https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=8d15c5fb-7cc8-4aab-88a8-38e8936d9ed0) — 역사 기준의 일반 사실만 요약. 원문·사진을 복제하지 않음.
