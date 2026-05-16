import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BookOpen, 
  Target, 
  Clock,
  ChevronRight,
  Filter,
  BrainCircuit,
  Upload,
  X,
  Sparkles,
  Loader2,
  Edit,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';
import { useAppState } from '../App';
import { cn } from '../lib/utils';
import { Test, Question } from '../types';
import { callGeminiAI } from '../services/geminiService';

export default function Subjects() {
  const { data, setData } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSubjectId, setViewingSubjectId] = useState<string | null>(null);
  const [isCreatingAI, setIsCreatingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  const filteredSubjects = data.subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateTest = async () => {
    if (!aiPrompt.trim() || !viewingSubjectId) return;
    setIsGenerating(true);
    try {
      const prompt = `Hãy soạn 10 câu hỏi đa dạng (trắc nghiệm, đúng/sai, trả lời ngắn, tự luận) về đề tài: ${aiPrompt}. 
      Yêu cầu: 
      1. Ngôn ngữ: Tiếng Việt.
      2. Định dạng JSON: { 
        "title": "...", 
        "questions": [{ 
          "content": "...", 
          "type": "single | true_false | short | essay", 
          "options": ["A.", "B.", "C.", "D."], 
          "correctAnswer": "...", 
          "explanation": "..." 
        }] 
      }`;
      
      const response = await callGeminiAI(prompt, data.settings.selectedModel);
      // ... rest of logic
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        const generated = JSON.parse(match[0]);
        const testId = `t${Date.now()}`;
        const newTest: Test = {
          id: testId,
          subjectId: viewingSubjectId,
          title: generated.title || `Bài tập ${aiPrompt}`,
          description: `Đề thi hỗn hợp: ${aiPrompt.substring(0, 50)}...`,
          questionsCount: generated.questions.length,
          createdAt: new Date().toLocaleDateString('vi-VN')
        };

        const newQuestions: Question[] = generated.questions.map((q: any, i: number) => ({
          id: `q-${testId}-${i}`,
          testId: testId,
          content: q.content,
          type: q.type || 'single',
          options: q.options || (q.type === 'true_false' ? ['Đúng', 'Sai'] : undefined),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: 'medium',
          points: 10
        }));

        setData({
          ...data,
          tests: [...data.tests, newTest],
          questions: [...data.questions, ...newQuestions],
          subjects: data.subjects.map(s => s.id === viewingSubjectId ? { ...s, testsCount: s.testsCount + 1 } : s)
        });
        
        setIsCreatingAI(false);
        setAiPrompt('');
        alert('Đã tạo bài tập thành công bằng AI!');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tạo bài tập bằng AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSubject = data.subjects.find(s => s.id === viewingSubjectId);
  const subjectTests = data.tests.filter(t => t.subjectId === viewingSubjectId);

  if (viewingSubjectId && currentSubject) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <header className="flex items-center gap-4">
          <button 
            onClick={() => setViewingSubjectId(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Thư viện bài tập: {currentSubject.name}</h2>
            <p className="text-slate-500">Quản lý các bài kiểm tra cho môn học này</p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => setIsCreatingAI(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all group"
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-primary/10 transition-colors">
              <Sparkles size={32} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Tạo bài tập bằng AI</span>
            <span className="text-[10px] text-center max-w-[180px]">Quét file Word/PDF hoặc nhập chủ đề để AI tự động soạn câu hỏi</span>
          </button>

          {subjectTests.map(test => (
            <div key={test.id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{test.createdAt}</span>
              </div>
              <h3 className="font-bold mb-1">{test.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{test.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400">{test.questionsCount} câu hỏi</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingTestId(test.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button className="text-primary text-xs font-bold hover:underline">Vào thi →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {editingTestId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingTestId(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Chỉnh sửa nội dung & Media</h3>
                  <button 
                    onClick={() => setEditingTestId(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {data.questions.filter(q => q.testId === editingTestId).map((question, idx) => (
                    <div key={question.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-primary uppercase">Câu {idx + 1}</span>
                      </div>
                      <p className="text-sm font-medium">{question.content}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            {question.mediaType === 'video' ? <VideoIcon size={12} /> : <ImageIcon size={12} />}
                            Media URL (Hình ảnh/Video)
                          </label>
                          <input 
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            value={question.mediaUrl || ''}
                            onChange={(e) => {
                              const newQuestions = data.questions.map(q => 
                                q.id === question.id ? { ...q, mediaUrl: e.target.value } : q
                              );
                              setData({ ...data, questions: newQuestions });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Loại Media</label>
                          <select 
                            value={question.mediaType || 'image'}
                            onChange={(e) => {
                              const newQuestions = data.questions.map(q => 
                                q.id === question.id ? { ...q, mediaType: e.target.value as 'image' | 'video' } : q
                              );
                              setData({ ...data, questions: newQuestions });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-primary outline-none"
                          >
                            <option value="image">Hình ảnh</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                      </div>
                      
                      {question.mediaUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-40">
                          {question.mediaType === 'video' ? (
                            <video src={question.mediaUrl} className="w-full h-auto" controls />
                          ) : (
                            <img src={question.mediaUrl} className="w-full h-auto object-cover" alt="Preview" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <button 
                    onClick={() => setEditingTestId(null)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20"
                  >
                    Hoàn tất & Lưu lại
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isCreatingAI && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isGenerating && setIsCreatingAI(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={20} />
                    <h3 className="font-bold text-lg">Soạn bài tập thông minh (AI)</h3>
                  </div>
                  <button 
                    onClick={() => setIsCreatingAI(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nhập chủ đề hoặc nội dung bài học</span>
                      <textarea 
                        rows={4}
                        placeholder="Ví dụ: Đạo hàm hàm số lượng giác lớp 11, hoặc dán nội dung văn bản từ file Word của bạn vào đây..."
                        className="w-full mt-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                    </label>

                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 group cursor-pointer hover:border-primary transition-all">
                       <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto group-hover:bg-primary/10 transition-colors">
                          <Upload size={20} className="text-slate-400 group-hover:text-primary" />
                       </div>
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tải lên file Word/PDF (.docx, .pdf)</p>
                       <p className="text-[10px] text-slate-400">Hệ thống sẽ tự động trích xuất nội dung để tạo câu hỏi</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsCreatingAI(false)}
                      disabled={isGenerating}
                      className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      onClick={handleGenerateTest}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className={cn(
                        "flex-1 px-6 py-3 rounded-xl gradient-bg text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale",
                        isGenerating && "animate-pulse"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Đang soạn...
                        </>
                      ) : (
                        <>
                          <BrainCircuit size={18} />
                          Tạo ngay
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kho bài thi</h2>
          <p className="text-slate-500">Quản lý các môn học và ngân hàng câu hỏi của bạn</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity">
          <Plus size={18} />
          <span>Thêm môn học</span>
        </button>
      </header>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm môn học..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
          <Filter size={20} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, i) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setViewingSubjectId(subject.id)}
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all shadow-sm cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                <BookOpen size={30} />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{subject.name}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium italic">Thư viện bài tập: {subject.testsCount} bài</p>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500">
                <Target size={16} />
                <span className="text-xs font-medium">{subject.testsCount} bài tập lưu trữ</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-600 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2">
              Xem chi tiết
              <ChevronRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
