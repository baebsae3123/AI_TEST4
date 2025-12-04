"use client"

import { useState } from "react"
import ProgressBar from "./progress-bar"
import QuestionCard from "./question-card"

interface QuestionnaireScreenProps {
  onComplete: (data: QuizData) => void
}

interface QuizData {
  question1: string[]
  question2: string[]
  question3: string
  question4: string
  question5: string[]
}

const QUESTIONS = [
  {
    id: 1,
    title: "선호 장르/소재",
    type: "multi" as const,
    maxSelect: 3,
    options: ["액션", "코미디", "로맨스", "드라마", "SF·판타지", "스릴러·공포", "애니", "다큐"],
  },
  {
    id: 2,
    title: "감상 목적·정서 성향",
    type: "multi" as const,
    maxSelect: 2,
    options: ["가볍게 웃으며", "깊은 여운", "몰입감 높은 스릴", "설렘·따뜻함"],
  },
  {
    id: 3,
    title: "제작 스타일·형식 선호도",
    type: "single" as const,
    options: ["블록버스터", "독창적·예술적", "일상적·현실", "실험적"],
  },
  {
    id: 4,
    title: "선호 국가·문화권",
    type: "single" as const,
    options: ["한국", "미국", "유럽", "일본", "중국·홍콩", "기타 아시아", "상관 없음"],
  },
  {
    id: 5,
    title: "기피 장르",
    type: "multi" as const,
    options: ["액션", "코미디", "로맨스", "드라마", "SF·판타지", "스릴러·공포", "다큐", "없음"],
  },
]

export default function QuestionnaireScreen({ onComplete }: QuestionnaireScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizData>({
    question1: [],
    question2: [],
    question3: "",
    question4: "",
    question5: [],
  })

  const handleAnswer = (value: string | string[]) => {
    const key = `question${currentQuestion + 1}` as keyof QuizData
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(answers)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const question = QUESTIONS[currentQuestion]
  const currentAnswer = answers[`question${currentQuestion + 1}` as keyof QuizData]

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar current={currentQuestion + 1} total={QUESTIONS.length} />

        {/* Question Card */}
        <div className="mt-12">
          <QuestionCard question={question} answer={currentAnswer} onAnswer={handleAnswer} />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-16">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 border border-gray-600 hover:border-gray-500 hover:text-gray-100"
          >
            이전
          </button>

          <div className="text-gray-400 text-sm">
            {currentQuestion + 1} / {QUESTIONS.length}
          </div>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {currentQuestion === QUESTIONS.length - 1 ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  )
}
