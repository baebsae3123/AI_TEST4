// MovieApi.js

import express from 'express';
// ✅ Mongoose 모델을 임포트합니다. (경로 확인 필수: models/Movie.js)
import MovieModel from './models/Movie.js'; 

const router = express.Router();

// =========================================================
// 1. 📁 DB 쿼리를 수행하는 비동기 함수
// =========================================================

/**
 * 데이터베이스에서 특정 장르들 중 하나라도 포함하는 영화 데이터를 가져옵니다.
 * @param {string[]} genres - 검색할 영화 장르 배열 (예: ['SF', '액션'])
 * @returns {Promise<Array>} - 영화 객체 배열 (최대 50개)
 */
async function fetchMoviesByGenresFromDB(genres) {
    try {
        // Mongoose 쿼리: 'genre' 필드가 입력된 'genres' 배열 요소 중 하나라도 포함하는 영화를 찾습니다.
        // $in 연산자를 사용하여 OR 조건으로 여러 장르를 동시에 검색합니다.
        const result = await MovieModel.find({ 
            genre: { $in: genres } 
        })
        .limit(50) // 너무 많은 데이터를 가져오는 것을 방지
        .exec();
        
        return result;

    } catch (error) {
        console.error("Mongoose 쿼리 중 오류 발생:", error);
        // DB 연결 또는 쿼리 오류 발생 시 throw
        throw new Error("DB 쿼리 실패: 데이터베이스 연결 또는 쿼리 오류"); 
    }
}

// =========================================================
// 2. 🎬 영화 추천 라우트 (GET 요청 처리 로직)
// =========================================================

/**
 * 🎥 설문조사 기반 영화 추천 라우트
 * GET /analyze-and-recommend?genres=SF,액션,드라마
 */
router.get("/analyze-and-recommend", async (req, res) => {
    // 1. 쿼리 파라미터에서 'genres' 문자열을 받습니다.
    const genresString = req.query.genres;

    if (!genresString) {
        return res.status(400).json({ 
            error: "추천을 위한 장르 목록을 쉼표(,)로 구분하여 'genres' 쿼리 파라미터에 포함해주세요.",
            example: "/analyze-and-recommend?genres=SF,액션,드라마"
        });
    }

    // 2. 쉼표 구분 문자열을 배열로 변환하고 공백을 제거합니다.
    const preferredGenres = genresString.split(',').map(g => g.trim());

    if (preferredGenres.length === 0) {
        return res.status(400).json({ 
            error: "유효한 장르가 감지되지 않았습니다. 장르를 쉼표로 구분했는지 확인해주세요."
        });
    }

    try {
        // 3. DB 쿼리 함수를 호출하여 영화 목록을 가져옵니다.
        const filteredMovies = await fetchMoviesByGenresFromDB(preferredGenres);

        if (filteredMovies.length === 0) {
            // DB에 해당 장르의 영화가 없을 경우 404 반환
            return res.status(404).json({
                error: `선택하신 장르 [${preferredGenres.join(', ')}]에 해당하는 영화를 데이터베이스에서 찾을 수 없습니다.`,
            });
        }

        // 4. 무작위 추천 로직 (5개 선택)
        // 실제 추천 시스템은 평점이나 사용자 이력을 고려하지만, 여기서는 무작위 셔플을 사용합니다.
        const shuffledMovies = filteredMovies.sort(() => 0.5 - Math.random());
        const recommendedMovies = shuffledMovies.slice(0, 5); // 상위 5개 선택

        // 5. 결과 반환
        res.json({
            preference_input: preferredGenres,
            recommendation_count: recommendedMovies.length,
            recommendations: recommendedMovies
        });

    } catch (error) {
        // DB 쿼리 함수에서 발생한 오류를 잡아 500 에러로 응답
        console.error("영화 추천 API 오류:", error.message);
        res.status(500).json({ 
            error: "데이터베이스 처리 중 오류가 발생했습니다. 서버 로그를 확인하세요." 
        });
    }
});

export default router;