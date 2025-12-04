"use client"

interface IntroScreenProps {
  onStart: () => void
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
          MediaMatch
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
          당신의 취향을 분석하여
          <br />
          맞춤 콘텐츠를 추천해 드립니다
        </p>

        <p className="text-base text-gray-400 mb-12">
          영화와 음악에 대한 간단한 질문에 답해주세요.
          <br />
          우리의 AI가 당신을 위한 완벽한 추천을 준비했습니다.
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          테스트 시작
        </button>

        {/* Footer text */}
        <p className="text-gray-500 text-sm mt-12">약 2분 소요 | 5개 질문</p>
      </div>
    </div>
  )
}
