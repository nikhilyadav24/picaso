// src/App.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, ExternalLink, Github, BookOpen, Code, Lightbulb } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your DSA Learning Assistant. Share a LeetCode problem link and your doubt, and I'll help guide you to the solution without giving it away.",
    },
  ]);
  const [input, setInput] = useState('');
  const [leetCodeUrl, setLeetCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || 
       (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!input.trim() && !leetCodeUrl.trim()) || isLoading) return;
  
    const userMessage = leetCodeUrl 
      ? `I have a doubt about this LeetCode problem: ${leetCodeUrl}\n\n${input}`
      : input;
      
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLeetCodeUrl('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        history: messages
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting to my knowledge base. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const language = code.split('\n')[0].trim();
        const actualCode = language ? code.substring(language.length).trim() : code;
        
        return (
          <div key={index} className="bg-gray-800 dark:bg-gray-900 rounded-md p-3 my-2 overflow-x-auto">
            <pre className="text-green-400 font-mono text-sm">{actualCode}</pre>
          </div>
        );
      }
      
      return <p key={index} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-indigo-600 dark:bg-indigo-800 p-4 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">Picaso- Your coding assistant</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-900 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button> */}
            <a href="https://github.com/nikhilyadav24" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-900 transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-lg shadow ${
                    message.role === 'user' 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white dark:bg-gray-800 dark:text-white'
                  }`}
                >
                  {formatMessage(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-lg shadow bg-white dark:bg-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Feature Box */}
      {/* <div className="bg-indigo-50 dark:bg-gray-800 p-1 border-t border-indigo-100 dark:border-gray-700">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
              <Code className="h-8 w-8 text-indigo-500 mb-2" />
              <h3 className="font-medium text-lg mb-1 dark:text-white">Problem Analysis</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                Share your LeetCode problem and get insights on understanding the problem statement
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
              <Lightbulb className="h-8 w-8 text-indigo-500 mb-2" />
              <h3 className="font-medium text-lg mb-1 dark:text-white">Guided Hints</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                Receive incremental hints that build your intuition without giving away the solution
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col items-center">
              <BookOpen className="h-8 w-8 text-indigo-500 mb-2" />
              <h3 className="font-medium text-lg mb-1 dark:text-white">Learning Focus</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                Understand the underlying concepts and approaches to solve similar problems
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Input form */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-inner">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <input
                type="text"
                value={leetCodeUrl}
                onChange={(e) => setLeetCodeUrl(e.target.value)}
                placeholder="Paste LeetCode URL (optional)"
                className="w-full py-1 px-2 text-sm text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0"
              />
              <ExternalLink className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            
            <div className="flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe your doubt or question about the problem..."
                rows="3"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !leetCodeUrl.trim())}
              className={`inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-white rounded-lg ${
                isLoading || (!input.trim() && !leetCodeUrl.trim())
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200'
              } transition-colors`}
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
