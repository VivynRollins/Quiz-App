import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Generate quiz function called')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { topic } = await req.json()
    console.log('Topic received:', topic)

    if (!topic) {
      console.error('No topic provided')
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the Gemini API key from environment variables
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the prompt for Gemini
    const prompt = `Generate exactly 5 multiple choice questions about "${topic}". 
    Return ONLY a valid JSON object in this exact format:
    {
      "questions": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]
    }
    
    Requirements:
    - Each question should have exactly 4 options
    - correctAnswer should be the index (0-3) of the correct option
    - Make questions challenging but fair
    - Ensure variety in question types
    - Return ONLY the JSON, no additional text`

    console.log('Calling Gemini API...')

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Gemini API error details:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate quiz questions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Gemini API response received')

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      console.error('No generated text found in response')
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generated text:', generatedText)

    // Clean and parse the JSON
    let cleanedText = generatedText.trim()
    
    // Remove any markdown code blocks
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    // Remove any leading/trailing whitespace
    cleanedText = cleanedText.trim()

    try {
      const quizData = JSON.parse(cleanedText)
      console.log('Successfully parsed quiz data')
      
      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz structure')
      }

      return new Response(
        JSON.stringify(quizData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (parseError) {
      console.error('Failed to parse generated JSON:', parseError)
      console.error('Raw generated text:', cleanedText)
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated quiz' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in generate-quiz function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})