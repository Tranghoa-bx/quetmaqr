import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  Settings as SettingsIcon, 
  BarChart3, 
  PlusCircle,
  MessageSquare,
  AlertCircle,
  Users
} from 'lucide-react';

import { AppData, Subject, Question, Session } from './types';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Scanner from './pages/Scanner';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import AITutor from './pages/AITutor';
import Students from './pages/Students';
import Navbar from './components/Navbar';

// Initial Data
const INITIAL_DATA: AppData = {
  subjects: [
    { id: '1', name: 'Toán học', icon: 'calculator', testsCount: 2 },
    { id: '2', name: 'Ngữ văn', icon: 'book', testsCount: 1 },
    { id: '3', name: 'Tiếng Anh', icon: 'languages', testsCount: 1 },
  ],
  tests: [
    { id: 't1', subjectId: '1', title: 'Kiểm tra 15p - Đạo hàm', description: 'Kiểm tra cơ bản về đạo hàm', questionsCount: 10, createdAt: '2024-05-10' },
    { id: 't2', subjectId: '1', title: 'Giữa kỳ I - Toán 10', description: 'Bao gồm Đại số và Hình học', questionsCount: 20, createdAt: '2024-05-12' },
  ],
  classes: [
    { id: 'c1', name: '10A1' },
    { id: 'c2', name: '10A2' }
  ],
  students: [
    { id: 'HS001', name: 'Nguyễn Văn A', classId: 'c1' },
    { id: 'HS002', name: 'Trần Thị B', classId: 'c1' },
    { id: 'HS003', name: 'Lê Văn C', classId: 'c2' }
  ],
  questions: Array.from({ length: 10 }, (_, i) => ({
    id: `q${i + 1}`,
    testId: 't1',
    content: `Câu hỏi số ${i + 1}`,
    type: 'single',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
    explanation: 'Giải thích chi tiết cho câu hỏi.',
    difficulty: 'medium',
    mediaUrl: i === 0 ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800' : undefined,
    mediaType: i === 0 ? 'image' : undefined
  })),
  sessions: [],
  progress: {
    totalAttempts: 0,
    averageScore: 0,
    streakDays: 0,
    weakTopics: []
  },
  settings: {
    theme: 'light',
    soundEnabled: true,
    autoSave: true,
    selectedModel: 'gemini-2.0-flash'
  }
};

const AppContext = createContext<{
  data: AppData;
  setData: (data: AppData) => void;
} | null>(null);

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within Provider');
  return context;
};

export default function App() {
  const [data, setDataState] = useState<AppData>(() => {
    const saved = localStorage.getItem('qr_grade_pro_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const setData = (newData: AppData) => {
    setDataState(newData);
    localStorage.setItem('qr_grade_pro_data', JSON.stringify(newData));
  };

  useEffect(() => {
    if (data.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.theme]);

  return (
    <AppContext.Provider value={{ data, setData }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/students" element={<Students />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-tutor" element={<AITutor />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

