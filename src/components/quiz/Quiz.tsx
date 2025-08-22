import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ChevronRight, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizData } from "../QuizApp"

type Props = {
  quizData: QuizData
  onQuizCompleted: (answers: number[]) => void
  topic: string
}

export const Quiz = ({ quizData, onQuizCompleted, topic }: Props) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(5).fill(-1))
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext() // Auto-advance when time runs out
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion])

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30)
  }, [currentQuestion])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onQuizCompleted(selectedAnswers)
    }
  }

  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100
  const question = quizData.questions[currentQuestion]
  const isLastQuestion = currentQuestion === quizData.questions.length - 1

  return (
    <Card className="mx-auto max-w-3xl shadow-quiz border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardDescription className="text-lg font-medium">
            {topic}
          </CardDescription>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span className={cn(
              "font-mono font-bold",
              timeLeft <= 10 ? "text-destructive" : "text-foreground"
            )}>
              {timeLeft}s
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <CardTitle className="text-xl mt-4">
          {question.question}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleAnswerSelect(index)}
              className={cn(
                "h-auto p-4 text-left justify-start transition-all duration-200",
                selectedAnswers[currentQuestion] === index
                  ? "bg-quiz-gradient text-white border-transparent shadow-quiz"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {selectedAnswers[currentQuestion] === index ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="flex-1">{option}</span>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedAnswers[currentQuestion] !== -1 ? "Answer selected" : "Select an answer to continue"}
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === -1}
            className="bg-quiz-gradient hover:bg-quiz-gradient-light shadow-quiz"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}