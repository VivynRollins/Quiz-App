import { useState } from "react"
import { TopicSelection } from "./quiz/TopicSelection"
import { Quiz } from "./quiz/Quiz"
import { QuizResults } from "./quiz/QuizResults"

export type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: number
}

export type QuizData = {
  questions: QuizQuestion[]
}

type GameState = 'topic-selection' | 'quiz' | 'results'

export const QuizApp = () => {
  const [gameState, setGameState] = useState<GameState>('topic-selection')
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [currentTopic, setCurrentTopic] = useState<string>("")

  const handleTopicSelected = (topic: string, data: QuizData) => {
    setCurrentTopic(topic)
    setQuizData(data)
    setGameState('quiz')
  }

  const handleQuizCompleted = (answers: number[]) => {
    setUserAnswers(answers)
    setGameState('results')
  }

  const handlePlayAgain = () => {
    setGameState('topic-selection')
    setQuizData(null)
    setUserAnswers([])
    setCurrentTopic("")
  }

  return (
    <div className="min-h-screen bg-quiz-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {gameState === 'topic-selection' && (
          <TopicSelection onTopicSelected={handleTopicSelected} />
        )}
        
        {gameState === 'quiz' && quizData && (
          <Quiz 
            quizData={quizData} 
            onQuizCompleted={handleQuizCompleted}
            topic={currentTopic}
          />
        )}
        
        {gameState === 'results' && quizData && (
          <QuizResults 
            quizData={quizData}
            userAnswers={userAnswers}
            onPlayAgain={handlePlayAgain}
            topic={currentTopic}
          />
        )}
      </div>
    </div>
  )
}