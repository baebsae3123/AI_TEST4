// models/Movie.js

import mongoose from 'mongoose';

// 1. 📋 영화 스키마(Schema) 정의
// 스키마는 데이터베이스의 컬렉션에 들어갈 문서(Document)의 구조와 타입을 명시합니다.
const MovieSchema = new mongoose.Schema({
    // 필수 필드 (데이터 식별)
    id: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    
    // 추천 로직에 사용될 핵심 필드 (장르)
    // 장르는 여러 개일 수 있으므로, String 타입의 배열([String])로 정의합니다.
    genre: { 
        type: [String], 
        required: true 
    }, 
    
    // 추가적인 메타데이터 (선택 사항)
    year: { 
        type: Number 
    },
    director: { 
        type: String 
    },
    // 평점 등을 저장할 수 있습니다.
    rating: { 
        type: Number 
    }
}, {
    // 2. ⚙️ 옵션 설정: 컬렉션 이름 지정
    // 이 스키마가 MongoDB의 어느 컬렉션에 연결될지 명시합니다.
    // MongoDB Atlas의 실제 컬렉션 이름과 일치해야 합니다.
    collection: 'movies' 
});

// 3. 📦 모델 생성 및 export
// 스키마를 사용하여 'Movie'라는 모델을 생성하고 외부에 내보냅니다.
// 이 모델을 통해 DB 쿼리(find, create 등)를 수행할 수 있습니다.
export default mongoose.model('Movie', MovieSchema);