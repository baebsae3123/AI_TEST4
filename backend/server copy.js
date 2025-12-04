// server.js (MongoDB 연동 완전 예제 - 최종 수정판)

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

// 라우터는 외부 파일에서 불러오므로 그대로 둡니다.
import apiRoutes from './MusicApi.js';
import movieApiRoutes from './MovieApi.js';

dotenv.config();
const app = express();
const PORT = 4000;
const MONGO_URI = process.env.MONGO_URI;

// ===================================
// ===== 유틸리티: 비동기 에러 핸들러 =====
// ===================================
// 모든 async 라우터 함수를 감싸서 try...catch 블록을 자동으로 적용하는 함수
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ===================================
// ===== MongoDB 모델 정의 및 모델 재정의 방지 =====
// ===================================
const movieSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true }, // id_1 에러 방지를 위한 필드 추가
    title: String,
    genre: String,
    releaseDate: Date,
    popularity: Number
});

const musicSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true }, // id_1 에러 방지를 위한 필드 추가
    title: String,
    artist: String,
    genre: String,
    popularity: Number
});

const selectionSchema = new mongoose.Schema({
    userId: String,
    selectedIds: [String],
    createdAt: { type: Date, default: Date.now }
});

// Mongoose 모델 재정의 방지 (Hot Reloading 환경 대비)
const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
const Music = mongoose.models.Music || mongoose.model("Music", musicSchema);
const Selection = mongoose.models.Selection || mongoose.model("Selection", selectionSchema);

// ===================================
// ===== 미들웨어 및 정적 파일 설정 =====
// ===================================
app.use(cors()); // 프로덕션에서는 { origin: '클라이언트 도메인' } 설정 권장
app.use(express.json());
// process.cwd()는 실행 위치에 따라 달라질 수 있으므로, path.resolve()를 사용하여 안정화
app.use(express.static(path.resolve(process.cwd(), "HumanMovieProject-main")));


// ===================================
// ===== 질문 API (동기 함수) =====
// ===================================
app.get("/questions", (req, res) => {
    const questions = [
        { id: 1, title: "선호 장르/소재", type: "multi", maxSelect: 3, options: ["액션","코미디","로맨스","드라마","SF·판타지","스릴러·공포","애니","다큐"] },
        { id: 2, title: "감상 목적·정서 성향", type: "multi", maxSelect: 2, options: ["가볍게 웃으며","깊은 여운","몰입감 높은 스릴","설렘·따뜻함"] },
        { id: 3, title: "제작 스타일·형식 선호도", type: "single", options: ["블록버스터","독창적·예술적","일상적·현실","실험적"] },
        { id: 4, title: "선호 국가·문화권", type: "single", options: ["한국","미국","유럽","일본","중국·홍콩","기타 아시아","상관 없음"] },
        { id: 5, title: "기피 장르", type: "multi", options: ["액션","코미디","로맨스","드라마","SF·판타지","스릴러·공포","다큐","없음"] }
    ];
    res.json(questions);
});

// ===================================
// ===== select1~3 API (asyncMiddleware 적용) =====
// ===================================

// 인기 영화 추천
app.get("/select1", asyncMiddleware(async (req, res) => {
    const topMovies = await Movie.find().sort({ popularity: -1 }).limit(5);
    res.json({ message: "인기 영화 추천", data: topMovies });
}));

// 최근 개봉작 추천
app.get("/select2", asyncMiddleware(async (req, res) => {
    const recentMovies = await Movie.find().sort({ releaseDate: -1 }).limit(5);
    res.json({ message: "최근 개봉작 추천", data: recentMovies });
}));

// 장르별 추천
app.get("/select3", asyncMiddleware(async (req, res) => {
    const { genre } = req.query;
    const query = genre ? { genre } : {};
    const genreMovies = await Movie.find(query).limit(5);
    res.json({ message: "장르별 추천", data: genreMovies });
}));

// ===================================
// ===== recommend API (가장 복잡한 로직) =====
// ===================================
app.post("/recommend", asyncMiddleware(async (req, res) => {
    
    const selectedIds = Array.isArray(req.body?.selectedIds) ? req.body.selectedIds : [];
    
    // 유효한 ObjectId만 필터링하고 변환
    const validObjectIds = selectedIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));

    // 선택된 ID가 없으면, 인기 Top 3만 반환
    if (validObjectIds.length === 0) {
        const movies = await Movie.find().sort({ popularity: -1 }).limit(3);
        const musics = await Music.find().sort({ popularity: -1 }).limit(3);
        
        return res.json({
            message: "선택된 ID가 없어 인기 콘텐츠 Top 3를 추천합니다.",
            data: {
                selected: { movies: [], musics: [] },
                recommended: { movies, musics }
            }
        });
    }

    // 선택한 영화/음악 조회
    const selectedMovies = await Movie.find({ _id: { $in: validObjectIds } });
    const selectedMusics = await Music.find({ _id: { $in: validObjectIds } });

    // 추천: 선택된 항목을 제외하고 인기순으로 추천
    const recommendedMovies = await Movie.find({ _id: { $nin: validObjectIds } }).sort({ popularity: -1 }).limit(3);
    const recommendedMusics = await Music.find({ _id: { $nin: validObjectIds } }).sort({ popularity: -1 }).limit(3);

    // 선택 기록 저장
    const selection = new Selection({ userId: "testUser", selectedIds });
    await selection.save();

    res.json({
        message: "선택 기반 추천 콘텐츠 리스트",
        data: {
            selected: { movies: selectedMovies, musics: selectedMusics },
            recommended: { movies: recommendedMovies, musics: recommendedMusics }
        }
    });
}));

// ===================================
// ===== selections API (asyncMiddleware 적용) =====
// ===================================
app.get("/selections", asyncMiddleware(async (req, res) => {
    const records = await Selection.find().sort({ createdAt: -1 }).limit(10);
    res.json({ message: "선택 기록 조회", data: records });
}));

// ===================================
// ===== 외부 라우터 연결 =====
// ===================================
app.use('/MusicApi', apiRoutes);
app.use('/MovieApi', movieApiRoutes);

// ===================================
// ===== 중앙 집중식 에러 핸들러 (마지막 미들웨어) =====
// ===================================
app.use((err, req, res, next) => {
    console.error('💥 서버 요청 처리 중 에러 발생:', err.stack);
    // 개발 환경에서는 자세한 에러를, 프로덕션에서는 일반적인 에러 메시지를 보냅니다.
    res.status(500).json({ 
        message: "내부 서버 오류 발생", 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});


// ===================================
// ===== 서버 시작 및 MongoDB 연결 =====
// ===================================
async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully.");
        app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    } catch (err) {                                                     // 여기 아이피주소 설정 http://localhost:400/
                                                                        // http://125.129.177.130
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // 연결 실패 시 프로세스 종료
    }
}

main();