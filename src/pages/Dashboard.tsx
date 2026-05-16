import { motion } from 'motion/react';
import { 
  Users, 
  BrainCircuit, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Plus,
  Play,
  BookOpen
} from 'lucide-react';
import { useAppState } from '../App';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data } = useAppState();

  const stats = [
    { label: 'Tổng bài chấm', value: data.progress.totalAttempts, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Điểm trung bình', value: `${Math.round(data.progress.averageScore * 10) / 10}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Chuỗi ngày', value: data.progress.streakDays, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Đề xuất AI', value: '4', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Chào buổi sáng, Thầy/Cô 👋</h2>
          <p className="text-slate-500 dark:text-slate-400">Hôm nay bạn muốn chấm điểm hay lên kế hoạch bài giảng?</p>
        </div>
        <div className="flex gap-2">
          <Link to="/scanner" className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform active:scale-95">
            <Play size={18} fill="currentColor" />
            <span>Chấm thi ngay</span>
          </Link>
          <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl glass-card text-center sm:text-left"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0", stat.bg)}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Môn học gần đây</h3>
            <Link to="/subjects" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.subjects.map((subject, i) => (
              <motion.div
                key={subject.id}
                whileHover={{ y: -4 }}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{subject.name}</h4>
                  <p className="text-xs text-slate-500">{subject.testsCount} bài thi</p>
                </div>
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Tăng tốc với AI</h3>
              <p className="text-slate-400 text-sm mb-4 max-w-sm">Tự động tạo câu hỏi trắc nghiệm từ nội dung bài học chỉ trong vài giây với Gemini AI.</p>
              <Link to="/ai-tutor" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors">
                <BrainCircuit size={16} />
                Thử ngay
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-bold">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {data.sessions.length > 0 ? (
              data.sessions.slice(0, 5).map((session, i) => (
                <div key={session.id} className="flex gap-4 items-start">
                  <div className="w-1 bg-slate-200 dark:bg-slate-800 h-full rounded-full shrink-0"></div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs text-slate-400 mb-1">{session.date}</p>
                    <p className="text-sm font-medium">Chấm bài môn {data.subjects.find(s => s.id === session.subjectId)?.name}</p>
                    <p className="text-xs text-slate-500">Điểm số: {session.score}% • {session.correctAnswers}/{session.totalQuestions} câu</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-400">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
