import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Users, 
  GraduationCap,
  Download,
  Upload,
  Trash2,
  Edit,
  MoreVertical,
  QrCode as QrIcon
} from 'lucide-react';
import { useAppState } from '../App';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export default function Students() {
  const { data, setData } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const filteredStudents = data.students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const exportStudentList = () => {
    const list = data.students.map(s => ({
      'Mã QR': s.id,
      'Họ và Tên': s.name,
      'Lớp': data.classes.find(c => c.id === s.classId)?.name || ''
    }));
    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sach Hoc Sinh");
    XLSX.writeFile(wb, "Danh_Sach_Hoc_Sinh.xlsx");
  };

  const importStudentList = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const items = XLSX.utils.sheet_to_json(ws);
      
      // Mock validation and mapping
      console.log('Imported:', items);
      alert('Đã nhập danh sách thành công (Demo)');
    };
    reader.readAsBinaryString(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Danh sách học sinh</h2>
          <p className="text-slate-500">Quản lý lớp học và cấp mã QR định danh</p>
        </div>
        <div className="flex gap-2">
           <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload size={16} />
              Nhập Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={importStudentList} />
           </label>
           <button 
            onClick={exportStudentList}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
           >
              <Download size={16} />
              Xuất danh sách
           </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="space-y-4">
           <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <GraduationCap size={18} className="text-primary" />
                 Lớp học
              </h3>
              <div className="space-y-1">
                 <button 
                  onClick={() => setSelectedClass('all')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    selectedClass === 'all' ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                 >
                    Tất cả lớp
                 </button>
                 {data.classes.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedClass(c.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group",
                        selectedClass === c.id ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                       <span>Lớp {c.name}</span>
                       <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          {data.students.filter(s => s.classId === c.id).length}
                       </span>
                    </button>
                 ))}
                 <button 
                  onClick={() => {
                    const name = prompt('Nhập tên lớp mới (ví dụ: 12A3):');
                    if (name) {
                      const newClass = { id: `c${Date.now()}`, name };
                      setData({ ...data, classes: [...data.classes, newClass] });
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-4 text-sm font-bold text-primary hover:underline transition-all"
                 >
                    <Plus size={16} />
                    Thêm lớp mới
                 </button>
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
              <h4 className="font-bold">Mẹo nhanh</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Bạn có thể in mã định danh QR cho cả lớp bằng cách nhấn "Xuất danh sách" và sử dụng tính năng in hàng loạt.</p>
              <div className="flex -space-x-2 overflow-hidden">
                {[1,2,3,4].map(i => (
                  <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {i}
                  </div>
                ))}
              </div>
           </div>
        </aside>

        <div className="lg:col-span-3 space-y-4">
           <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc mã QR..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                <Plus size={18} />
                <span className="hidden sm:inline">Thêm học sinh</span>
              </button>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mã QR</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và Tên</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">{s.id}</code>
                          <button title="Xem mã QR" className="p-1 text-slate-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                            <QrIcon size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                         {data.classes.find(c => c.id === s.classId)?.name}
                      </td>
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Hoạt động
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                              <Edit size={16} />
                           </button>
                           <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Không tìm thấy học sinh nào.</td>
                     </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
