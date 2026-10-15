# 앨범 작업실 디자인

초등 6학년 대상. 큰 제목, 선명한 코발트와 노란색, 실제 앨범 커버처럼 보이는 섬/음악 일러스트로 작사 활동의 정체성을 드러낸다. 입력은 마음과 가사 두 공간으로 나누고, 작은 화면에서는 순서대로 배치한다. 기능과 AI 판단 로직은 유지한다.

## 이미지
- 생성: built-in image_gen 도구 (imagegen 스킬), CLI/API fallback 사용 안 함.
- 프로젝트 파일: `public/album-island.webp` (1000×1000, 377,362 bytes).
- 원본: `C:/Users/admin/.codex/generated_images/01a13f6e-4bae-71d0-88ab-91326003de17/exec-6c341f33-a7c4-4056-8bfc-8889e95a5fb1.png`.
- 원본 보존 후 웹 전송을 위한 크기/형식 최적화만 적용. 상징적 앨범 그림이며 실제 소안도의 지도/역사 복원도가 아님.

## 최종 생성 프롬프트
Use case: illustration-story. Asset type: square album-cover artwork for a Korean sixth-grade classroom lyric-writing web app about Soando island and remembering people who stood together. Create a polished, joyful indie music album cover illustration, appealing to ages 11–13, sophisticated hand-cut paper collage and bold gouache screenprint texture, not toddler cartoon and not generic AI 3D art. A lush small Korean coastal island rises from rhythmic turquoise ocean waves that flow into oversized blue musical staffs and notes. A winding warm ivory path links a few small coral-roof village houses, trees, a school-like simple building; small paper boats and a sun suggest hope and solidarity. Dramatic asymmetric editorial composition with strong shapes, cobalt blue, vivid turquoise, butter yellow, coral red, forest green and warm ivory. Subtle organic ink texture, crisp handmade edges, playful negative space, good visual legibility at small sizes. No humans, no faces, no text, no lettering, no logos, no watermark, no UI or mockup frame. Artwork fills square edge to edge, not a floating sticker. This is metaphorical album artwork, not a geographic map or historical reconstruction.


## 배경과 입력판 이미지 (2026-10-15)
사용자 요청으로 내장 image_gen 도구에서 두 자산을 별도로 생성. CLI fallback은 사용하지 않았다. 원본은 보존하고 프로젝트에 WebP로 크기/형식만 최적화해 저장했다. 학생의 입력 글자와 버튼은 실제 HTML이며, 이미지는 장식과 질감으로만 사용한다. 페이지 조회 시 AI 호출이 발생하지 않는다.

- `public/sea-paper-background.webp`: 1536×1024, 111,194 bytes. 원본 `C:/Users/admin/.codex/generated_images/01a13f6e-4bae-71d0-88ab-91326003de17/exec-1f4c1f41-d6e9-4bd5-a0aa-073b89a6fb1b.png`.
- `public/song-paper-panel.webp`: 1120×1400, 196,882 bytes, 바깥 투명도 유지. 원본 `C:/Users/admin/.codex/generated_images/01a13f6e-4bae-71d0-88ab-91326003de17/exec-af80c69b-f0c3-491a-9c6c-095c621a74c4.png`.
- 입력판은 CSS border-image의 nine-slice 방식으로 모서리 크기를 유지하면서 긴 글과 모바일에 대응한다. 입력칸 내부에는 같은 종이의 중앙 질감만 사용한다.

### 배경 최종 프롬프트
Use case: illustration-story. Asset type: very wide desktop WEBSITE BACKGROUND texture, landscape 3:2, for a Korean age-12 songwriting classroom called an island album studio. Make a beautiful subtle illustrated paper backdrop, pastel pale icy blue and warm ivory handmade paper, with delicate tactile watercolor and cut-paper texture. The center 75 percent is almost blank pale blue ivory with extremely low contrast, reserved for readable real HTML content. Only in the far outer margins and bottom corners, airy hand-painted sea waves, tiny paper boats, sparse coral pencil strokes, a few soft cobalt musical-note doodles and butter-yellow paper scraps. Refined independent youth magazine art direction, artistic but calm, joyful and not childish. No central scene, no islands in the center, no people, no words, no letters, no border box, no UI, no buttons. Flat overhead paper texture, no 3D. Keep decoration light and pushed to edges, 85 percent visually quiet, avoid dark patches. This should enhance a web page with real forms overlaid, not compete with text.

### 입력판 최종 프롬프트
Use case: productivity-visual. Asset type: a single reusable blank paper FORM PANEL background for a sixth-grade songwriting web application, portrait 4:5. One beautiful rectangular sheet of warm ivory handmade watercolor paper, viewed perfectly flat from above with almost straight softly torn deckle edges. The paper fills 95 percent of the canvas, thin transparent outer margin. Its central 85 percent is extremely clean pale ivory, subtle fine paper fibers only, no marks, no writing, no lines, no folds through center: real editable HTML text will be placed here. One small semi-transparent butter-yellow washi tape strip attached at the TOP LEFT EDGE, and a small pale dusty-blue tape strip at TOP RIGHT EDGE, kept in top 5 percent. At the very bottom right edge only, a tiny hand-drawn coral star and soft blue pencil squiggle, occupying less than 6 percent of area. Gently irregular handmade edges, slight believable paper-layer shadow only at edge. Refined indie school art notebook, inviting to 12-year-olds, not toddler craft. No text, no lettering, no UI controls, no photos, no illustrations in writing area, no notebook spiral, no pencil object. True transparent background outside the sheet; ivory paper itself opaque. Simple beautifully crafted paper asset, with quiet center supporting long paragraphs of dark text.
