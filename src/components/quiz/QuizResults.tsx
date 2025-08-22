import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RotateCcw, Trophy, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizData } from "../QuizApp"

type Props = {
  quizData: QuizData
  userAnswers: number[]
  onPlayAgain: () => void
  topic: string
}

export const QuizResults = ({ quizData, userAnswers, onPlayAgain, topic }: Props) => {
  const correctAnswers = userAnswers.filter((answer, index) => 
    answer === quizData.questions[index].correctAnswer
  ).length

  const score = Math.round((correctAnswers / quizData.questions.length) * 100)
  
  const getScoreMessage = () => {
    if (score >= 90) return { message: "Outstanding! You're a true expert!", icon: Trophy, color: "text-yellow-500" }
    if (score >= 70) return { message: "Great job! Well done!", icon: Star, color: "text-primary" }
    if (score >= 50) return { message: "Good effort! Keep learning!", icon: CheckCircle, color: "text-success" }
    return { message: "Keep trying! Practice makes perfect!", icon: RotateCcw, color: "text-muted-foreground" }
  }

  const scoreInfo = getScoreMessage()
  const ScoreIcon = scoreInfo.icon

  return (
    <div className="space-y-6">
      <Card className="mx-auto max-w-2xl shadow-quiz border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className={cn("mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center", 
            score >= 70 ? "bg-quiz-gradient" : "bg-muted"
          )}>
            <ScoreIcon className={cn("w-10 h-10", score >= 70 ? "text-white" : scoreInfo.color)} />
          </div>
          
          <CardTitle className="text-3xl font-bold">
            Quiz Complete!
          </CardTitle>
          
          <CardDescription className="text-lg">
            {topic}
          </CardDescription>
          
          <div className="mt-6">
            <div className="text-4xl font-bold bg-quiz-gradient bg-clip-text text-transparent mb-2">
              {score}%
            </div>
            <div className="text-lg text-muted-foreground mb-4">
              {correctAnswers} out of {quizData.questions.length} correct
            </div>
            <div className={cn("text-lg font-medium", scoreInfo.color)}>
              {scoreInfo.message}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Button 
            onClick={onPlayAgain}
            className="w-full h-12 text-lg bg-quiz-gradient hover:bg-quiz-gradient-light shadow-quiz"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Another Topic
          </Button>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-4xl shadow-quiz border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Review Your Answers</CardTitle>
          <CardDescription>
            See how you did on each question
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {quizData.questions.map((question, index) => {
              const userAnswer = userAnswers[index]
              const correctAnswer = question.correctAnswer
              const isCorrect = userAnswer === correctAnswer
              
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-2">
                        Question {index + 1}: {question.question}
                      </div>
                      
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex}
                            className={cn(
                              "px-3 py-2 rounded text-sm",
                              optionIndex === correctAnswer && "bg-success/10 text-success border border-success/20",
                              optionIndex === userAnswer && optionIndex !== correctAnswer && "bg-destructive/10 text-destructive border border-destructive/20",
                              optionIndex !== correctAnswer && optionIndex !== userAnswer && "bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span>{option}</span>
                              {optionIndex === correctAnswer && (
                                <Badge variant="outline" className="text-xs border-success text-success">
                                  Correct
                                </Badge>
                              )}
                              {optionIndex === userAnswer && optionIndex !== correctAnswer && (
                                <Badge variant="outline" className="text-xs border-destructive text-destructive">
                                  Your Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}