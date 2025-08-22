import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, BookOpen } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { QuizData } from "../QuizApp"

type Props = {
  onTopicSelected: (topic: string, quizData: QuizData) => void
}

const suggestedTopics = [
  "World History", "Science & Nature", "Technology", "Literature", 
  "Geography", "Movies & TV", "Sports", "Art & Culture"
]

export const TopicSelection = ({ onTopicSelected }: Props) => {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateQuiz = async (selectedTopic: string) => {
    if (!selectedTopic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Choose any topic you'd like to be quizzed on!",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { topic: selectedTopic.trim() }
      })

      if (error) throw error

      onTopicSelected(selectedTopic.trim(), data)
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast({
        title: "Failed to generate quiz",
        description: "Please try again with a different topic.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl shadow-quiz hover:shadow-quiz-hover transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-quiz-gradient rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-quiz-gradient bg-clip-text text-transparent">
          QuizMaster
        </CardTitle>
        <CardDescription className="text-lg">
          Challenge yourself with AI-generated questions on any topic
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            Choose your topic
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter any topic (e.g., Ancient Rome, JavaScript, Cooking...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && generateQuiz(topic)}
              className="flex-1 h-12 text-lg"
              disabled={isLoading}
            />
            <Button 
              onClick={() => generateQuiz(topic)}
              disabled={isLoading}
              className="h-12 px-8 bg-quiz-gradient hover:bg-quiz-gradient-light shadow-quiz"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Start Quiz'
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground text-center">
            Or choose from popular topics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {suggestedTopics.map((suggestedTopic) => (
              <Button
                key={suggestedTopic}
                variant="outline"
                onClick={() => generateQuiz(suggestedTopic)}
                disabled={isLoading}
                className="h-auto py-3 text-center text-sm hover:bg-quiz-gradient hover:text-white hover:border-transparent transition-all duration-200"
              >
                {suggestedTopic}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}