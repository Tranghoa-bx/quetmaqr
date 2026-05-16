import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Calendar,
  Download,
  Filter,
  Users,
  Search,
  BookOpen,
  PieChart
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAppState } from '../App';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const { data } = useAppState();
  const [filterClass, setFilterClass] = useState('all');
  const [filterTest, setFilterTest] = useState('all');
  const [filterTime, setFilterTime] = useState('all');

  const filteredSessions = useMemo(() => {
    return data.sessions.filter(s => {
      const student = data.students.find(st => st.id === s.studentId);
      const matchesClass = filterClass === 'all' || student?.classId === filterClass;
      const matchesTest = filterTest === 'all' || s.testId === filterTest;
      
      // Basic time filtering logic
      if (filterTime === '7' || filterTime === '30') {
        const sessionDate = new Date(s.date.split('/').reverse().join('-')); // Adjust format
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > parseInt(filterTime)) return false;
      }

      return matchesClass && matchesTest;
    });
  }, [data.sessions, filterClass, filterTest, filterTime, data.students]);

  const exportToExcel = () => {
    const list = filteredSessions.map(s => ({
      'Ngày': s.date,
      'Học sinh': data.students.find(st => st.id === s.studentId)?.name || 'N/A',
      'Môn học': data.subjects.find(sub => sub.id === s.subjectId)?.name || 'N/A',
      'Điểm số': s.score,
      'Số câu đúng': s.correctAnswers,
      'Tổng câu': s.totalQuestions
    }));
    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ket Qua");
    XLSX.writeFile(wb, `Thong_Ke_${new Date().getTime()}.xlsx`);
  };

  // Calculate question breakdown
  const totalQuestions = 10;
  const questionStats = Array.from({ length: totalQuestions }, (_, i) => {
    const qId = `q${i + 1}`;
    const allResults = filteredSessions.flatMap(s => s.results).filter(r => r.questionId === qId);
    const correctCount = allResults.filter(r => r.isCorrect).length;
    return {
      id: qId,
      correctRate: allResults.length > 0 ? (correctCount / allResults.length) * 100 : 0
    };
  });

  const lineData = {
    labels: filteredSessions.map(s => s.date).reverse(),
    datasets: [
      {
        label: 'Điểm trung bình',
        data: filteredSessions.map(s => s.score).reverse(),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barData = {
    labels: data.subjects.map(s => s.name),
    datasets: [
      {
        label: 'Số bài thi',
        data: data.subjects.map(s => filteredSessions.filter(ss => ss.subjectId === s.id).length),
        backgroundColor: '#FF9500',
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: ['Giỏi', 'Khá', 'Trung bình', 'Yếu'],
    datasets: [
      {
        data: [
          filteredSessions.filter(s => s.score >= 80).length,
          filteredSessions.filter(s => s.score >= 65 && s.score < 80).length,
          filteredSessions.filter(s => s.score >= 50 && s.score < 65).length,
          filteredSessions.filter(s => s.score < 50).length,
        ],
        backgroundColor: ['#10b981', '#4A90E2', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const overallAvgScore = filteredSessions.length > 0 
    ? Math.round(filteredSessions.reduce((acc, curr) => acc + curr.score, 0) / filteredSessions.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <PieChart size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-bold">Thống kê & Báo cáo</h2>
              <p className="text-slate-500 text-sm">Phân tích chi tiết năng lực học tập theo tiêu chí</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả lớp</option>
            {data.classes.map(c => <option key={c.id} value={c.id}>Lớp {c.name}</option>)}
          </select>

          <select 
            value={filterTest}
            onChange={(e) => setFilterTest(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 max-w-[200px]"
          >
            <option value="all">Tất cả bài tập</option>
            {data.tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>

          <select 
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Toàn bộ thời gian</option>
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
          </select>

          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
             <Download size={16} />
             Xuất Excel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Điểm trung bình</span>
            <div className="text-3xl font-black text-primary">{overallAvgScore}%</div>
            <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
               <TrendingUp size={10} /> +2.5% so với tuần trước
            </div>
         </div>
         <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Tổng lượt làm bài</span>
            <div className="text-3xl font-black">{filteredSessions.length}</div>
            <div className="text-[10px] text-slate-400 font-bold">Lượt quét QR học sinh</div>
         </div>
         <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Tỷ lệ đạt</span>
            <div className="text-3xl font-black text-emerald-500">
               {filteredSessions.length > 0 
                ? Math.round((filteredSessions.filter(s => s.score >= 50).length / filteredSessions.length) * 100)
                : 0}%
            </div>
            <div className="text-[10px] text-slate-400 font-bold">Số câu đúng {'>'} 50%</div>
         </div>
         <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Mã quét hoạt động</span>
            <div className="text-3xl font-black text-blue-500">
               {new Set(filteredSessions.map(s => s.studentId)).size}
            </div>
            <div className="text-[10px] text-slate-400 font-bold">Học sinh tham gia thi</div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
                      <TrendingUp size={20} />
                   </div>
                   <h4 className="font-bold">Biểu đồ tiến độ</h4>
                </div>
                <div className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-400 font-bold uppercase tracking-wider">Line Chart</div>
            </div>
            <div className="h-72">
               <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </div>
         </div>

         <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
                      <Award size={20} />
                   </div>
                   <h4 className="font-bold">Phân loại học lực</h4>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
               <div className="h-64 mt-[-20px]">
                  <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%' }} />
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <div className="text-2xl font-black">{overallAvgScore}%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Avg<br/>Grade</div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold uppercase tracking-tight">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Giỏi</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Khá</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Trung bình</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Yếu</div>
            </div>
         </div>
      </div>

      <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <header className="flex items-center justify-between mb-8">
           <div>
              <h3 className="font-bold text-lg">Phân tích tỷ lệ đúng theo từng câu hỏi</h3>
              <p className="text-xs text-slate-400 mt-1">Giúp giáo viên đánh giá độ khó thực tế của từng câu trong đề thi</p>
           </div>
           <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {'<'}40%</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 40-70%</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {'>'}70%</span>
           </div>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
           {questionStats.map(q => (
             <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2 border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-all group">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight group-hover:text-primary">Câu {q.id.replace('q','')}</p>
                <div className="text-lg font-black" style={{ color: q.correctRate > 70 ? '#10b981' : q.correctRate > 40 ? '#4A90E2' : '#ef4444' }}>
                   {Math.round(q.correctRate)}%
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-current transition-all duration-500" style={{ width: `${q.correctRate}%`, color: q.correctRate > 70 ? '#10b981' : q.correctRate > 40 ? '#4A90E2' : '#ef4444' }}></div>
                </div>
             </div>
           ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg">
                <Users size={18} />
             </div>
             <h3 className="font-bold">Lịch sử bài thi chi tiết</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <Search size={14} />
            {filteredSessions.length} Kết quả
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Môn học</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">Bài tập</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kết quả</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tỷ lệ (%)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredSessions.slice(0, 50).map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                          {data.students.find(st => st.id === s.studentId)?.name.split(' ').pop()?.charAt(0)}
                       </div>
                       <span className="font-bold text-slate-700 dark:text-slate-200">
                          {data.students.find(st => st.id === s.studentId)?.name || 'N/A'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="text-sm font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                        {data.subjects.find(sub => sub.id === s.subjectId)?.name}
                     </span>
                  </td>
                  <td className="px-6 py-5 truncate max-w-[150px] text-xs font-bold text-slate-400 italic">
                    {data.tests.find(t => t.id === s.testId)?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-5 text-center font-black text-slate-700 dark:text-slate-200">
                     {s.correctAnswers}/{s.totalQuestions}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden min-w-[60px]">
                        <div className={cn("h-full rounded-full transition-all duration-700", s.score >= 80 ? "bg-emerald-500" : s.score >= 50 ? "bg-blue-500" : "bg-red-500")} style={{ width: `${s.score}%` }}></div>
                      </div>
                      <span className="text-xs font-black w-8">{s.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[10px] text-slate-400 font-bold whitespace-nowrap">{s.date}</td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => alert(`Chi tiết bài làm:\n${s.results.map((r, i) => {
                        const question = data.questions.find(q => q.id === r.questionId);
                        return `Câu ${i+1} (${question?.type || '?' }): ${r.score}đ - ${r.isCorrect ? "✅" : "❌"}\n${r.feedback ? `  └ AI: ${r.feedback}\n` : ''}`;
                      }).join("\n")}`)}
                      className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm",
                        s.score >= 50 ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-red-500 text-white shadow-red-500/20"
                      )}
                    >
                      {s.score >= 50 ? 'Đạt' : 'Yếu'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                 <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic font-medium">Chưa có dữ liệu thống kê phù hợp với bộ lọc hiện tại.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
