// server.js (MongoDB 연동 완전 예제 - 최종 통합판)

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors"; 

// 외부 라우터 (경로가 올바른지 확인 필요: './MusicApi.js', './MovieApi.js')
import apiRoutes from './MusicApi.js';
import movieApiRoutes from './MovieApi.js';

dotenv.config();
const app = express();
const MONGO_URI = process.env.MONGO_URI;
// 환경 변수 설정 (개발/운영 구분)
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ===================================
// ===== 유틸리티: 비동기 에러 핸들러 =====
// ===================================
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ===================================
// ===== MongoDB 모델 정의 (생략됨) =====
// ===================================
const movieSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true },
    title: String,
    genre: String,
    releaseDate: Date,
    popularity: Number
});

const musicSchema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true },
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

// 모델 재정의 방지 (핫 리로드 대비)
const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
const Music = mongoose.models.Music || mongoose.model("Music", musicSchema);
const Selection = mongoose.models.Selection || mongoose.model("Selection", selectionSchema);


// ===================================
// ===== 미들웨어 및 정적 파일 설정 =====
// ===================================

// --- 1. CORS 설정 강화 ---
const allowedOrigins = [
    // 로컬 환경 (개발용)
    'http://localhost:3000', 
    'http://localhost:4000',
    // Render/Vercel 배포 주소 허용
    'https://*.onrender.com', // Render 도메인 허용
    'https://*.vercel.app'    // Vercel 도메인 허용
    // 💡 실제 프론트엔드 URL을 여기에 명시적으로 추가하는 것이 가장 안전합니다.
    // 예: 'https://my-frontend-app.onrender.com'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
                return regex.test(origin);
            }
            return origin === pattern;
        })) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// --- 2. 요청 로그 미들웨어 추가 (추가된 부분) ---
app.use((req, res, next) => {
    // Render 로그에 요청 정보 출력
    console.log(`📡 [API Request] Method: ${req.method} | Path: ${req.url} | Time: ${new Date().toISOString()}`);
    next();
});
// ---------------------------------------------

// --- 3. 정적 파일 경로 주석 처리 ---
// 프론트엔드를 별도 배포하므로, 이 코드는 경로 오류 방지를 위해 주석 처리합니다.
/*
app.use(express.static(path.resolve(process.cwd(), "HumanMovieProject-main")));
*/


// ===================================
// ===== 질문 API (동일) =====
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
// ===== select1~3, recommend, selections API (동일) =====
// ===================================
app.get("/select1", asyncMiddleware(async (req, res) => {
    const topMovies = await Movie.find().sort({ popularity: -1 }).limit(5);
    res.json({ message: "인기 영화 추천", data: topMovies });
}));

app.get("/select2", asyncMiddleware(async (req, res) => {
    const recentMovies = await Movie.find().sort({ releaseDate: -1 }).limit(5);
    res.json({ message: "최근 개봉작 추천", data: recentMovies });
}));

app.get("/select3", asyncMiddleware(async (req, res) => {
    const { genre } = req.query;
    const query = genre ? { genre } : {};
    const genreMovies = await Movie.find(query).limit(5);
    res.json({ message: "장르별 추천", data: genreMovies });
}));

app.post("/recommend", asyncMiddleware(async (req, res) => {
    const selectedIds = Array.isArray(req.body?.selectedIds) ? req.body.selectedIds : [];
    const validObjectIds = selectedIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));

    if (validObjectIds.length === 0) {
        const movies = await Movie.find().sort({ popularity: -1 }).limit(3);
        const musics = await Music.find().sort({ popularity: -1 }).limit(3);
        return res.json({
            message: "선택된 ID가 없어 인기 콘텐츠 Top 3를 추천합니다.",
            data: { selected: { movies: [], musics: [] }, recommended: { movies, musics } }
        });
    }

    const selectedMovies = await Movie.find({ _id: { $in: validObjectIds } });
    const selectedMusics = await Music.find({ _id: { $in: validObjectIds } });
    const recommendedMovies = await Movie.find({ _id: { $nin: validObjectIds } })
        .sort({ popularity: -1 }).limit(3);
    const recommendedMusics = await Music.find({ _id: { $nin: validObjectIds } })
        .sort({ popularity: -1 }).limit(3);

    const selection = new Selection({ userId: "testUser", selectedIds });
    await selection.save();

    res.json({
        message: "선택 기반 추천 콘텐츠 리스트",
        data: { selected: { movies: selectedMovies, musics: selectedMusics }, recommended: { movies: recommendedMovies, musics: recommendedMusics } }
    });
}));

app.get("/selections", asyncMiddleware(async (req, res) => {
    const records = await Selection.find().sort({ createdAt: -1 }).limit(10);
    res.json({ message: "선택 기록 조회", data: records });
}));

// ===================================
// ===== 외부 라우터 연결 (동일) =====
// ===================================
app.use('/MusicApi', apiRoutes);
app.use('/MovieApi', movieApiRoutes);


// ===================================
// ===== 중앙 집중식 에러 핸들러 (동일) =====
// ===================================
app.use((err, req, res, next) => {
    console.error('💥 서버 요청 처리 중 에러 발생:', err.stack);
    const status = err.status || 500;
    res.status(status).json({
        message: "내부 서버 오류 발생",
        error: !IS_PRODUCTION ? err.message : 'Internal Server Error'
    });
});

// ===================================
// ===== 서버 시작 + Render 포트 대응 (동일) =====
// ===================================
async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully.");

        const port = process.env.PORT || 4000;

        app.listen(port, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`➡️ Local: http://localhost:${port}`);
            console.log(`➡️ Render: 자동 URL에서 접속`);
        });

    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

main();