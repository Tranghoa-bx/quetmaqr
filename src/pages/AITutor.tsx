import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  RefreshCcw, 
  Copy, 
  Trash2,
  FilePlus,
  BookOpen,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppState } from '../App';
import { callGeminiAI } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AITutor() {
  const { data } = useAppState();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào Thầy/Cô! Tôi là trợ lý AI Gemini. Tôi có thể giúp bạn soạn câu hỏi trắc nghiệm, giải thích đáp án hoặc phân tích kết quả học tập của học sinh. Bạn cần giúp gì hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callGeminiAI(input, data.settings.selectedModel);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Lỗi: ${error.message}. Vui lòng kiểm tra lại API Key trong phần Cài đặt.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { text: 'Soạn 5 câu trắc nghiệm Toán 10 về đạo hàm', icon: FilePlus },
    { text: 'Giải thích tại sao đáp án C đúng cho câu hỏi này', icon: BookOpen },
    { text: 'Phân tích kết quả học tập của lớp 10A1', icon: BrainCircuit },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
             <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Tutor Panel</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="Xóa hội thoại"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
      >
        {messages.map((m) => (
          <div 
            key={m.id}
            className={cn(
              "flex gap-4 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm",
              m.role === 'assistant' ? "bg-slate-900 text-white" : "bg-primary text-white"
            )}>
              {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              m.role === 'assistant' 
                ? "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200" 
                : "bg-primary text-white"
            )}>
              <div
                className={cn(
                  "prose prose-sm max-w-none",
                  m.role === 'user' ? "prose-invert" : "dark:prose-invert"
                )}
              >
                <ReactMarkdown>
                  {m.content}
                </ReactMarkdown>
              </div>
              <p className={cn(
                "text-[10px] mt-2 opacity-50",
                m.role === 'user' ? "text-right" : "text-left"
              )}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 w-48">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s.text)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 shrink-0"
              >
                <s.icon size={14} />
                {s.text}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            placeholder="Đặt câu hỏi cho AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none outline-none px-2 py-1 text-sm dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2 rounded-xl transition-all",
              input.trim() && !isLoading ? "gradient-bg text-white shadow-md shadow-orange-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
