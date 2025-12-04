"use client"

import { useState } from "react"
import IntroScreen from "@/components/intro-screen"
import QuestionnaireScreen from "@/components/questionnaire-screen"
import ResultsScreen from "@/components/results-screen"

type Screen = "intro" | "questionnaire" | "results"

interface ContentItem {
  id: string
  title: string
  genre: string
  description: string
  type: "movie" | "music"
  image: string
}

interface QuizData {
  question1: string[]
  question2: string[]
  question3: string
  question4: string
  question5: string[]
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("intro")
  const [quizData, setQuizData] = useState<QuizData>({
    question1: [],
    question2: [],
    question3: "",
    question4: "",
    question5: [],
  })

  const handleStartQuiz = () => {
    setCurrentScreen("questionnaire")
  }

  const handleQuizComplete = (data: QuizData) => {
    setQuizData(data)
    setCurrentScreen("results")
  }

  const handleRestart = () => {
    setCurrentScreen("intro")
    setQuizData({
      question1: [],
      question2: [],
      question3: "",
      question4: "",
      question5: [],
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {currentScreen === "intro" && <IntroScreen onStart={handleStartQuiz} />}
      {currentScreen === "questionnaire" && <QuestionnaireScreen onComplete={handleQuizComplete} />}
      {currentScreen === "results" && <ResultsScreen onRestart={handleRestart} />}
    </main>
  )
}
