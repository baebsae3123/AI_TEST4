/*
요약: 아래 파일은 간단한 Node.js + Express API입니다.
- 사용자는 한 번에 하나의 질문을 선택하고 응답을 저장할 수 있습니다.
- 총 5개의 질문(응답)이 저장되면 /recommend 엔드포인트로 영화 3개, 음악 3개를 추천합니다.

실행 방법 (터미널):
1) Node.js가 설치되어 있어야 합니다.
2) 프로젝트 폴더에서: npm init -y
3) 필요한 패키지 설치: npm install express cors body-parser
4) 서버 실행: node server.js

설명: 코드 내부 주석은 모두 한국어로 되어 있으며, 주요 동작부 옆에 추가 설명을 달았습니다.
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ---------- 예시 질문 목록 ----------
// 각 질문은 id와 텍스트, 그리고 내부적으로 추천 태그를 가집니다.
// 태그는 사용자의 선택을 기반으로 추천을 매칭할 때 사용됩니다.
const QUESTIONS = [
  {
    id: 1,
    text: '평소 즐겨보는 영화 장르를 최대 3개까지 선택해주세요.',
    type: 'multi', // 복수 선택
    tags: ['액션', '코미디', '로맨스', '드라마', 'SF·판타지', '스릴러·공포', '애니메이션', '다큐멘터리']
  },
  {
    id: 2,
    text: '영화를 볼 때 주로 기대하는 감정이나 목적을 선택해주세요.',
    type: 'multi', // 기획 의도에 따라 1~2개 선택 허용
    tags: [
      '스트레스 해소',
      '무거운 여운',
      '스릴·긴장감',
      '설렘·따뜻함'
    ]
  },
  {
    id: 3,
    text: '선호하는 영화 제작 스타일을 선택해주세요.',
    type: 'single',
    tags: [
      '블록버스터',
      '예술적 연출',
      '현실 기반 잔잔한 스토리',
      '실험적 연출'
    ]
  },
  {
    id: 4,
    text: '주로 선호하는 영화 제작 국가·문화권을 선택해주세요.',
    type: 'single',
    tags: [
      '한국', '미국', '유럽', '일본', '중국·홍콩', '기타 아시아', '상관 없음'
    ]
  },
  {
    id: 5,
    text: '피하고 싶은 영화 장르가 있다면 선택해주세요.',
    type: 'multi',
    tags: ['액션', '코미디', '로맨스', '드라마', 'SF·판타지', '스릴러·공포', '다큐멘터리', '없음']
  }
];

// ---------- 간단한 아이템 DB (영화 & 음악) ----------
// 각 항목은 태그 배열을 가지고 있으며, 선택한 태그와 매칭하여 추천합니다.
const MOVIES = [
  { id: 'm1', title: '인셉션', tags: ['SF', '스릴러', '시각효과', '스토리'] },
  { id: 'm2', title: '라라랜드', tags: ['로맨스', '음악', '감성'] },
  { id: 'm3', title: '기생충', tags: ['사회', '스토리', '블랙코미디'] },
  { id: 'm4', title: '어벤져스: 엔드게임', tags: ['액션', '시각효과', '긴장감'] },
  { id: 'm5', title: '인터스텔라', tags: ['SF', '감성', '스토리'] },
  { id: 'm6', title: '그랜드 부다페스트 호텔', tags: ['코미디', '시각효과', '배우'] }
];

const MUSIC = [
  { id: 's1', title: 'River Flows in You - Yiruma', tags: ['잔잔', '휴식', '클래식'] },
  { id: 's2', title: 'Blinding Lights - The Weeknd', tags: ['신나는', '힙한'] },
  { id: 's3', title: 'Bohemian Rhapsody - Queen', tags: ['드라마틱', '음악', '배우'] },
  { id: 's4', title: 'Shape of You - Ed Sheeran', tags: ['밝음', '신나는', '로맨스'] },
  { id: 's5', title: 'Stay With Me - Sam Smith', tags: ['감성', '잔잔'] },
  { id: 's6', title: 'Eye of the Tiger - Survivor', tags: ['운동', '신나는'] }
];

// ---------- 임시 저장소: 사용자가 선택한 질문/응답을 저장합니다 ----------
// 실제 서비스라면 DB에 저장해야 하지만, 이 예제는 메모리 기반입니다.
let selections = [];

// GET /questions
// 질문 목록을 반환합니다. (프론트엔드가 질문을 하나씩 보여주고 선택하도록 사용)
app.get('/questions', (req, res) => {
  // 간단히 질문 id와 텍스트만 보내도 충분합니다.
  const list = QUESTIONS.map(q => ({ id: q.id, text: q.text, tags: q.tags }));
  res.json({ success: true, questions: list });
});

// POST /select
// 바디: { questionId: number, chosenTag: string }
// 사용자가 한 질문에 대해 하나의 태그(응답)를 선택하면 저장합니다.
app.post('/select', (req, res) => {
  const { questionId, chosenTag } = req.body;
  if (!questionId || !chosenTag) {
    return res.status(400).json({ success: false, message: 'questionId와 chosenTag를 모두 보내야 합니다.' });
  }

  // 선택한 질문이 유효한지 확인
  const q = QUESTIONS.find(x => x.id === questionId);
  if (!q) return res.status(404).json({ success: false, message: '유효하지 않은 questionId입니다.' });

  // 태그가 질문에 포함되어 있는지 확인(선택 제약)
  if (!q.tags.includes(chosenTag)) {
    return res.status(400).json({ success: false, message: '선택한 태그가 질문의 후보에 없습니다.' });
  }

  // 최대 5개까지만 저장하도록 제한
  if (selections.length >= 5) {
    return res.status(400).json({ success: false, message: '이미 5개의 선택이 완료되었습니다. /recommend 호출을 사용하세요.' });
  }

  selections.push({ questionId, chosenTag });
  res.json({ success: true, selections });
});

// GET /selections
// 현재까지 저장된 선택을 확인합니다.
app.get('/selections', (req, res) => {
  res.json({ success: true, count: selections.length, selections });
});

// POST /reset
// 테스트 용도로 선택을 초기화합니다.
app.post('/reset', (req, res) => {
  selections = [];
  res.json({ success: true, message: '선택이 초기화되었습니다.' });
});

// POST /recommend
// 선택이 5개가 되었을 때 추천을 생성합니다. (선택이 5개 미만이면 에러 반환)
app.post('/recommend', (req, res) => {
  if (selections.length < 5) {
    return res.status(400).json({ success: false, message: '선택이 5개가 되어야 추천을 생성할 수 있습니다.' });
  }

  // 선택된 태그들의 빈도 계산
  const tagCounts = {};
  selections.forEach(s => {
    tagCounts[s.chosenTag] = (tagCounts[s.chosenTag] || 0) + 1;
  });

  // 태그 점수 계산 함수: 항목의 태그와 사용자 태그 매칭된 갯수를 점수로 사용
  function scoreItem(itemTags) {
    let score = 0;
    itemTags.forEach(t => { if (tagCounts[t]) score += tagCounts[t]; });
    return score;
  }

  // 영화 점수 매긴 후 상위 3개 선택
  const movieCandidates = MOVIES.map(m => ({ ...m, score: scoreItem(m.tags) }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 3);

  // 음악 점수 매긴 후 상위 3개 선택
  const musicCandidates = MUSIC.map(s => ({ ...s, score: scoreItem(s.tags) }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 3);

  // 추천 결과와 선택 초기화(옵션)
  const result = {
    movies: movieCandidates.map(m => ({ id: m.id, title: m.title, score: m.score })),
    music: musicCandidates.map(s => ({ id: s.id, title: s.title, score: s.score }))
  };

  // 서비스 정책에 따라 선택을 초기화할지 여부 결정 가능. 여기서는 초기화하지 않음.
  // selections = [];

  res.json({ success: true, selectionsCount: selections.length, result });
});

// 간단한 헬스체크
app.get('/', (req, res) => {
  res.send('추천 API가 실행 중입니다. /questions로 질문을 가져오세요.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
