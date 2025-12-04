"use client"

interface QuestionCardProps {
  question: {
    id: number
    title: string
    type: "single" | "multi"
    maxSelect?: number
    options: string[]
  }
  answer: string | string[]
  onAnswer: (value: string | string[]) => void
}

export default function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  const isSingleSelect = question.type === "single"
  const selectedArray = Array.isArray(answer) ? answer : isSingleSelect ? [] : []
  const selectedValue = isSingleSelect ? (answer as string) : ""

  const handleSelect = (option: string) => {
    if (isSingleSelect) {
      onAnswer(option)
    } else {
      if (selectedArray.includes(option)) {
        onAnswer(selectedArray.filter((item) => item !== option))
      } else {
        if (selectedArray.length < (question.maxSelect || 3)) {
          onAnswer([...selectedArray, option])
        }
      }
    }
  }

  return (
    <div className="bg-surface rounded-xl p-8 border border-border">
      {/* Question Title */}
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
        {question.title}
      </h2>

      {/* Selection Type Indicator */}
      <div className="mb-6 text-sm text-gray-400">
        {isSingleSelect ? <span>✓ 하나를 선택하세요</span> : <span>✓ 최대 {question.maxSelect}개까지 선택 가능</span>}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`p-4 rounded-lg font-medium transition-all duration-300 text-left flex items-center ${
              isSingleSelect
                ? selectedValue === option
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-2 border-indigo-400"
                  : "bg-surface-light border-2 border-border text-gray-300 hover:border-indigo-500"
                : selectedArray.includes(option)
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-2 border-indigo-400"
                  : "bg-surface-light border-2 border-border text-gray-300 hover:border-indigo-500"
            }`}
          >
            {/* Checkbox/Radio Icon */}
            <span className="mr-3 flex-shrink-0">
              {isSingleSelect ? (
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedValue === option ? "bg-indigo-500 border-indigo-400" : "border-gray-500"
                  }`}
                >
                  {selectedValue === option && <span className="w-2 h-2 bg-white rounded-full" />}
                </span>
              ) : (
                <span
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedArray.includes(option) ? "bg-indigo-500 border-indigo-400" : "border-gray-500"
                  }`}
                >
                  {selectedArray.includes(option) && <span className="text-white font-bold">✓</span>}
                </span>
              )}
            </span>
            <span className="flex-grow">{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
