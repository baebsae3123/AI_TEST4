import express from 'express';
import axios from 'axios'; // HTTP 요청을 위한 라이브러리 (fetch를 사용해도 됩니다)

const router = express.Router();

// Spotify 개발자 대시보드에서 발급받은 값
const CLIENT_ID = '9db57e1bf99e47bca36e3e0a0ac91f82';
const CLIENT_SECRET = '8074bd829840413295d84e81adb1465d';

// Client ID와 Secret을 Base64 인코딩
const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// /api/spotify-search 라우트 수정
router.get("/spotify-search", async (req, res) => {
    // 1. 사용자로부터 검색어(query)를 받습니다. (예: /spotify-search?q=Love+Story)
    const searchQuery = req.query.q;

    if (!searchQuery) {
        return res.status(400).json({ error: "검색어(q)를 입력해주세요." });
    }

    try {
        // === 1단계: 액세스 토큰 요청 ===
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        const accessToken = tokenResponse.data.access_token;

        // === 2단계: 음악 정보 검색 요청 ===
        const searchResponse = await axios.get(
            'https://api.spotify.com/v1/search',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    q: searchQuery,
                    type: 'track', // 노래만 검색
                    limit: 5
                }
            }
        );

        // 3. 클라이언트에게 결과 반환
        res.json({ 
            query: searchQuery,
            results: searchResponse.data.tracks.items
        });

    } catch (error) {
        console.error("Spotify API 호출 오류:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Spotify 검색 중 오류가 발생했습니다." });
    }
});

export default router;