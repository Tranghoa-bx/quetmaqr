import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'motion/react';
import { 
  Camera, 
  QrCode,
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  Info,
  ChevronLeft,
  Settings as SettingsIcon,
  Play,
  RotateCcw,
  BrainCircuit,
  Sparkles,
  Loader2,
  FileText,
  UserCheck,
  Target,
  TrendingUp,
  Check
} from 'lucide-react';
import { useAppState } from '../App';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Session, QuestionResult, Student, Question } from '../types';
import { callGeminiAI } from '../services/geminiService';

export default function Scanner() {
  const { data, setData } = useAppState();
  const [scanMode, setScanMode] = useState<'selection' | 'qr' | 'sheet'>('selection');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(data.subjects[0]?.id || '');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [lastResult, setLastResult] = useState<{ student: string, score: number, total: number } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [pendingResults, setPendingResults] = useState<QuestionResult[]>([]);
  const [isAIGrading, setIsAIGrading] = useState<string | null>(null);
  const [isProcessingSheet, setIsProcessingSheet] = useState(false);
  const [scannedIds, setScannedIds] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedClassId, setSelectedClassId] = useState(data.classes[0]?.id || '');

  const availableTests = data.tests.filter(t => t.subjectId === selectedSubjectId);
  const classStudents = data.students.filter(s => s.classId === selectedClassId);

  useEffect(() => {
    if (availableTests.length > 0 && !selectedTestId) {
      setSelectedTestId(availableTests[0].id);
    }
  }, [availableTests, selectedTestId]);

  useEffect(() => {
    if (isScanning && (scanMode === 'qr' || scanMode === 'sheet')) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning, scanMode]);

  function onScanSuccess(decodedText: string) {
    if (scanMode === 'qr') {
      try {
        const student = data.students.find(s => s.id === decodedText);
        if (!student) {
          alert("Không tìm thấy học sinh với mã định danh này!");
          return;
        }
        
        setScannedStudent(student);
        setScannedIds(prev => new Set(prev).add(student.id));
        
        // Initialize results
        const testQuestions = data.questions.filter(q => q.testId === selectedTestId);
        const initialResults: QuestionResult[] = testQuestions.map(q => {
          const isStandardType = q.type === 'single' || q.type === 'true_false' || q.type === 'multiple';
          // Simulate some answers for demo
          const isCorrect = isStandardType ? Math.random() > 0.3 : false;
          return {
            questionId: q.id,
            isCorrect,
            score: isCorrect ? (q.points || 10) : 0,
            studentAnswer: isStandardType ? (q.correctAnswer || 'A') : '',
            feedback: ''
          };
        });
        setPendingResults(initialResults);
        setShowConfirmation(true); // Show choice instead of immediate results

        if (scannerRef.current) {
          scannerRef.current.pause(); // Pause camera while confirming
        }
      } catch (e) {
        console.error("Format QR không hợp lệ", e);
      }
    } else if (scanMode === 'sheet') {
      // Simulate processing an answer sheet
      setIsProcessingSheet(true);
      setIsScanning(false);
      
      setTimeout(() => {
        const randomStudent = data.students[Math.floor(Math.random() * data.students.length)];
        setScannedStudent(randomStudent);
        
        const testQuestions = data.questions.filter(q => q.testId === selectedTestId);
        const autoResults: QuestionResult[] = testQuestions.map(q => ({
          questionId: q.id,
          isCorrect: Math.random() > 0.2,
          score: Math.random() > 0.2 ? (q.points || 10) : 0,
          studentAnswer: 'Quét tự động',
          feedback: 'Trích xuất từ phiếu OMR'
        }));
        
        setPendingResults(autoResults);
        setIsProcessingSheet(false);
      }, 2000);

      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    }
  }

  const handleAIEvaluate = async (qId: string) => {
    setIsAIGrading(qId);
    try {
      const question = data.questions.find(q => q.id === qId);
      const prompt = `Bạn là giám khảo. Đây là câu hỏi: "${question?.content}" (Loại: ${question?.type}). 
      Đáp án gợi ý: "${question?.correctAnswer}". 
      Hãy mô phỏng việc chấm điểm 1 bài làm học sinh (0-10 điểm). 
      Trả về JSON: { "score": number, "feedback": "nhận xét ngắn", "studentAnswer": "nội dung bài làm giả lập" }`;
      
      const response = await callGeminiAI(prompt, data.settings.selectedModel);
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        setPendingResults(prev => prev.map(r => r.questionId === qId ? {
          ...r,
          score: result.score,
          isCorrect: result.score >= 5,
          studentAnswer: result.studentAnswer,
          feedback: result.feedback
        } : r));
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi chấm điểm AI');
    } finally {
      setIsAIGrading(null);
    }
  };

  const saveResults = () => {
    if (!scannedStudent) return;
    
    const totalPoints = pendingResults.reduce((acc, curr) => acc + curr.score, 0);
    const maxPoints = data.questions.filter(q => q.testId === selectedTestId).reduce((acc, curr) => acc + (curr.points || 10), 0);
    const scorePercentage = (totalPoints / (maxPoints || 1)) * 100;

    const newSession: Session = {
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      testId: selectedTestId,
      studentId: scannedStudent.id,
      score: Math.round(scorePercentage),
      totalQuestions: pendingResults.length,
      correctAnswers: pendingResults.filter(r => r.isCorrect).length,
      results: pendingResults,
      timeSpent: 600,
      date: new Date().toLocaleDateString('vi-VN')
    };

    setLastResult({
      student: scannedStudent.name,
      score: Math.round(scorePercentage),
      total: pendingResults.length
    });

    setData({
      ...data,
      sessions: [newSession, ...data.sessions],
      progress: {
        ...data.progress,
        totalAttempts: data.progress.totalAttempts + 1,
        averageScore: Math.round(((data.progress.averageScore * data.progress.totalAttempts) + scorePercentage) / (data.progress.totalAttempts + 1))
      }
    });

    setScannedStudent(null);
    setPendingResults([]);
    setScanMode('selection');
  };

  function onScanFailure(error: any) {
    // Too many logs if we log error every frame
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Máy quét thông minh</h2>
            <p className="text-slate-500">Chấm điểm nhanh bằng Camera & AI</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {scanMode !== 'selection' && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
               <div className="flex items-center gap-4 min-w-max">
                  {classStudents.map(student => (
                    <div 
                      key={student.id} 
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0",
                        scannedIds.has(student.id) 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 font-bold" 
                          : "bg-slate-50 border-slate-100 text-slate-400"
                      )}
                    >
                      {scannedIds.has(student.id) && <Check size={14} />}
                      <span className="text-xs">{student.name}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          <div className="p-1.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[450px] shadow-xl flex items-center justify-center">
            
            {showConfirmation && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Đã nhận diện: {scannedStudent?.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">Hệ thống đã ghi nhận kết quả tạm thời.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setShowConfirmation(false);
                        setIsScanning(false);
                      }}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                      Xem kết quả ngay
                    </button>
                    <button 
                      onClick={() => {
                        setShowConfirmation(false);
                        if (scannerRef.current) {
                          scannerRef.current.resume();
                        }
                        saveResults();
                        setIsScanning(true);
                      }}
                      className="w-full py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                    >
                      Tiếp tục quét tiếp
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {scanMode === 'selection' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-8 text-center">
                 <button 
                  onClick={() => { setScanMode('qr'); setIsScanning(true); }}
                  className="group p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-4"
                 >
                    <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                       <QrCode size={48} />
                    </div>
                    <div>
                       <h4 className="text-lg font-bold">Quét mã học sinh</h4>
                       <p className="text-xs text-slate-400 mt-1">Dùng để nhận diện và chấm điểm linh hoạt (Tự luận + Trắc nghiệm)</p>
                    </div>
                 </button>

                 <button 
                  onClick={() => { setScanMode('sheet'); setIsScanning(true); }}
                  className="group p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-4"
                 >
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                       <FileText size={48} />
                    </div>
                    <div>
                       <h4 className="text-lg font-bold">Quét phiếu bài tập</h4>
                       <p className="text-xs text-slate-400 mt-1">Dùng cho phiếu trắc nghiệm tô chì, hệ thống tự động nhận diện đáp án</p>
                    </div>
                 </button>
              </div>
            ) : isScanning ? (
              <div className="w-full h-full flex flex-col">
                <div className="p-4 bg-slate-900/10 dark:bg-slate-100/10 backdrop-blur-md absolute top-4 left-4 right-4 z-10 flex justify-between items-center rounded-2xl">
                   <div className="flex items-center gap-2">
                      {scanMode === 'qr' ? <QrCode size={18} /> : <FileText size={18} />}
                      <span className="text-xs font-bold uppercase tracking-widest">{scanMode === 'qr' ? 'Nhận diện QR' : 'Quét Phiếu OMR'}</span>
                   </div>
                   <button onClick={() => { setIsScanning(false); setScanMode('selection'); }} className="text-xs font-bold text-red-500 hover:underline">Huỷ</button>
                </div>
                <div id="reader" className="w-full flex-1"></div>
              </div>
            ) : isProcessingSheet ? (
              <div className="flex flex-col items-center gap-4 text-center p-12">
                 <Loader2 size={64} className="animate-spin text-emerald-500" />
                 <div>
                    <h4 className="text-xl font-bold">Đang phân tích phiếu...</h4>
                    <p className="text-slate-500">Hệ thống đang trích xuất khoanh vùng đáp án</p>
                 </div>
              </div>
            ) : scannedStudent ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full p-8 flex flex-col bg-white dark:bg-slate-900"
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black">
                         {scannedStudent.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-xl font-bold">{scannedStudent.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-400">{scannedStudent.id}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                               Lớp {data.classes.find(c => c.id === scannedStudent.classId)?.name || 'N/A'}
                            </span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold">
                      <UserCheck size={16} />
                      ĐÃ NHẬN DIỆN
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                   {data.questions.filter(q => q.testId === selectedTestId).map((q, idx) => {
                      const result = pendingResults.find(r => r.questionId === q.id);
                      return (
                        <div key={q.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all space-y-3">
                           <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Câu {idx + 1} • {q.type.replace('_',' ')}</span>
                                 <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">{q.content}</p>
                                 
                                 {q.mediaUrl && q.mediaType === 'image' && (
                                   <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                      <img src={q.mediaUrl} alt="Question media" className="w-full h-auto max-h-64 object-cover" />
                                   </div>
                                 )}
                                 
                                 {q.mediaUrl && q.mediaType === 'video' && (
                                   <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                      <video src={q.mediaUrl} controls className="w-full h-auto max-h-64" />
                                   </div>
                                 )}

                                 <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Đáp án đúng:</p>
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{q.correctAnswer}</p>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                 <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <span className="px-2 text-[10px] font-bold text-slate-400">ĐIỂM</span>
                                    <input 
                                      type="number" 
                                      max={10}
                                      value={result?.score || 0}
                                      onChange={(e) => {
                                         const val = parseInt(e.target.value);
                                         setPendingResults(prev => prev.map(r => r.questionId === q.id ? { ...r, score: val, isCorrect: val >= 5 } : r));
                                      }}
                                      className="w-14 p-2 text-center bg-slate-50 dark:bg-slate-800 border-none font-black text-primary text-sm focus:ring-0"
                                    />
                                    <span className="px-2 text-[10px] font-bold text-slate-400">/10</span>
                                 </div>
                                 {(q.type === 'essay' || q.type === 'short') && (
                                    <button 
                                      onClick={() => handleAIEvaluate(q.id)}
                                      disabled={isAIGrading === q.id}
                                      className="p-1 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                       {isAIGrading === q.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                       AI CHẤM
                                    </button>
                                 )}
                              </div>
                           </div>
                           
                           {result?.feedback && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-2 italic ring-1 ring-primary/10">
                                 <BrainCircuit size={14} className="text-primary shrink-0" />
                                 <span>{result.feedback}</span>
                              </div>
                           )}
                        </div>
                      );
                   })}
                </div>

                <div className="mt-8 flex gap-4">
                   <button 
                     onClick={() => { setScannedStudent(null); setIsScanning(true); }}
                     className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                   >
                      <RotateCcw size={18} /> Huỷ & Quét lại
                   </button>
                   <button 
                     onClick={saveResults}
                     className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                   >
                      <CheckCircle2 size={18} /> Lưu kết quả & Hoàn tất
                   </button>
                </div>
              </motion.div>
            ) : lastResult ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-12 space-y-8"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <CheckCircle2 size={56} />
                </div>
                <div>
                   <h3 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100">{lastResult.score}%</h3>
                   <p className="text-slate-500">Kết quả cho <span className="font-bold text-slate-900 dark:text-slate-100">{lastResult.student}</span></p>
                </div>
                
                <div className="flex items-center justify-center gap-8 py-6 border-y border-slate-100 dark:border-slate-800">
                   <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số câu đúng</div>
                      <div className="text-xl font-bold">{(lastResult.score / 10).toFixed(0)} / {lastResult.total}</div>
                   </div>
                   <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
                   <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Xếp loại</div>
                      <div className="text-xl font-bold text-emerald-500">{lastResult.score >= 80 ? 'GIỎI' : lastResult.score >= 50 ? 'ĐẠT' : 'YẾU'}</div>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { setLastResult(null); setScanMode('selection'); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                  >
                    Quay lại menu chính
                  </button>
                  <button 
                    onClick={() => { setLastResult(null); setIsScanning(true); }}
                    className="w-full py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Tiếp tục quét lượt mới
                  </button>
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl">
                   <Target size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đã quét</p>
                   <p className="text-lg font-bold">{data.sessions.length}</p>
                </div>
             </div>
             <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm TB</p>
                   <p className="text-lg font-bold">{Math.round(data.progress.averageScore)}%</p>
                </div>
             </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2">
               <SettingsIcon size={18} className="text-primary" />
               Cài đặt phiên quét
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lớp học</label>
                <select 
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/80 font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/40 transition-all text-sm"
                >
                  {data.classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môn học chọn lọc</label>
                <select 
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTestId('');
                  }}
                  className="w-full p-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/80 font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/40 transition-all text-sm"
                >
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bộ câu hỏi (Test)</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableTests.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTestId(t.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left transition-all text-xs flex flex-col gap-1",
                        selectedTestId === t.id 
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" 
                          : "border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <span>{t.title}</span>
                      <span className="text-[10px] opacity-60 font-medium">{t.questionsCount} câu hỏi • {t.createdAt}</span>
                    </button>
                  ))}
                  {availableTests.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic py-4 text-center">Chưa có bài tập nào cho môn này.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                 <Sparkles size={18} className="text-blue-400" />
                 Mẹo chuyên gia
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">Đảm bảo ánh sáng tốt khi quét phiếu. Hệ thống OMR của chúng tôi hoạt động tốt nhất khi camera đặt vuông góc với mặt giấy.</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
