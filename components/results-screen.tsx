"use client"

import ContentCard from "./content-card"

interface ResultsScreenProps {
  onRestart: () => void
}

// Dummy data for selected and recommended content
const DUMMY_SELECTED = [
  {
    id: "1",
    title: "인셉션",
    genre: "SF·스릴러",
    description: "꿈 속 세계에서 펼쳐지는 대사건",
    type: "movie" as const,
    image: "/movie-inception.jpg",
  },
  {
    id: "2",
    title: "너의 이름은.",
    genre: "로맨스·판타지",
    description: "시간과 공간을 뛰어넘는 운명의 만남",
    type: "movie" as const,
    image: "/anime-your-name.jpg",
  },
]

const DUMMY_RECOMMENDED = [
  {
    id: "3",
    title: "프리미어 사인",
    genre: "SF·미스터리",
    description: "평행 우주의 미스터리를 풀다",
    type: "movie" as const,
    image: "/movie-primer.jpg",
  },
  {
    id: "4",
    title: "더 존 (The Zone)",
    genre: "SF·심리",
    description: "금지된 영역으로 들어가다",
    type: "movie" as const,
    image: "/movie-stalker.jpg",
  },
  {
    id: "5",
    title: "소년 시대",
    genre: "드라마·성장",
    description: "12년의 삶을 따라가는 감동적 여정",
    type: "movie" as const,
    image: "/movie-boyhood.jpg",
  },
  {
    id: "6",
    title: "블레이드 러너 2049",
    genre: "SF·느와르",
    description: "미래 도시에서 벌어지는 추적",
    type: "movie" as const,
    image: "/movie-blade-runner.jpg",
  },
]

export default function ResultsScreen({ onRestart }: ResultsScreenProps) {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-3">
            당신을 위한 추천
          </h1>
          <p className="text-gray-400">당신의 선택을 바탕으로 정선한 콘텐츠를 찾았습니다.</p>
        </div>

        {/* Your Selection Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-violet-600 rounded mr-3" />
            당신이 선택한 콘텐츠
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DUMMY_SELECTED.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        </section>

        {/* Recommended Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-violet-600 rounded mr-3" />
            당신에게 추천하는 콘텐츠
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DUMMY_RECOMMENDED.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        </section>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-surface-light border-2 border-gray-600 hover:border-indigo-500 text-gray-100 font-semibold rounded-lg transition-all duration-300 hover:bg-surface"
          >
            다시 테스트하기
          </button>
          <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
            모두 저장하기
          </button>
        </div>
      </div>
    </div>
  )
}
