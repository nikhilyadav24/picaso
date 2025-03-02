import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

config();

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5001'], 
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, 'client/dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `You are an expert teaching assistant for Data Structures and Algorithms problems. Your goal is to help students learn and understand DSA concepts by guiding them through problems without directly providing solutions.

When a student shares a LeetCode problem and their doubt:
1. If they include a LeetCode URL, acknowledge it and familiarize yourself with the problem type
2. Ask clarifying questions if their doubt is vague
3. Provide guidance through Socratic questioning
4. Suggest approaches and explain the relevant data structures or algorithms
5. Give incremental hints that build intuition
6. Explain time and space complexity considerations
7. If they're stuck on implementation, provide small code snippets to illustrate concepts, but never complete solutions
8. Encourage the student to think through the problem step-by-step

Remember:
- Your goal is to teach, not solve
- Focus on building the student's problem-solving skills
- Tailor your guidance to their specific doubt
- Use code examples for illustration only, not complete solutions
- Be encouraging and supportive`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    let formattedMessages = [];

    if (history.length <= 1) {  
      formattedMessages.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      });
      
      formattedMessages.push({
        role: 'model',
        parts: [{ text: "I'll help students learn DSA concepts without giving away solutions." }]
      });
    }

    const startIdx = (formattedMessages.length > 0) ? 1 : 0;
    
    for (let i = startIdx; i < history.length; i++) {
      const msg = history[i];
      formattedMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    formattedMessages.push({
      role: 'user',
      parts: [{ text: message }]
    });
    
    try {
      const result = await model.generateContent({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });
      
      const reply = result.response.text();
      res.json({ reply });
      
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ 
        error: 'Failed to generate content',
        details: error.message
      });
    }
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message
    });
  }
});

app.post('/ask-gemini', async (req, res) => {
    try {
        console.log("Received request:", req.body);

        const { url, doubt } = req.body;
        if (!url || !doubt) {
            return res.status(400).json({ error: "Missing required fields: url and doubt" });
        }

        const prompt = `A student needs help with a LeetCode problem: ${url}.

### Student's Doubt:
${doubt}

### Guidelines for your response:
1. **Understanding the Problem:** Provide a brief explanation of what the problem asks.
2. **Common Mistakes & Optimizations:** Highlight common pitfalls and possible optimizations.`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const response = result.response.text();
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: "Failed to process request", details: error.message });
    }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});