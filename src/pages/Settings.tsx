import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  Moon, 
  Sun, 
  Volume2, 
  Save, 
  Trash2, 
  Shield, 
  HelpCircle,
  Eye,
  EyeOff,
  Bell,
  Cpu,
  Database
} from 'lucide-react';
import { useAppState } from '../App';
import { cn } from '../lib/utils';

export default function Settings() {
  const { data, setData } = useAppState();
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const toggleTheme = () => {
    setData({
      ...data,
      settings: { ...data.settings, theme: data.settings.theme === 'light' ? 'dark' : 'light' }
    });
  };

  const handleUpdateSetting = (key: string, value: any) => {
    setData({
      ...data,
      settings: { ...data.settings, [key]: value }
    });
  };

  const resetData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác.')) {
      localStorage.removeItem('qr_grade_pro_data');
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold">Cài đặt hệ thống</h2>
        <p className="text-slate-500">Tùy chỉnh trải nghiệm và cấu hình AI của bạn</p>
      </div>

      <section className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg">
              <Key size={20} />
            </div>
            <h3 className="font-bold text-lg">Cấu hình Gemini AI</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">API Key</label>
                  {!data.settings.apiKey && (
                    <span className="text-[10px] font-bold text-red-500 animate-pulse">Lấy API key để sử dụng app</span>
                  )}
               </div>
               <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"} 
                    value={data.settings.apiKey || ''}
                    onChange={(e) => handleUpdateSetting('apiKey', e.target.value)}
                    placeholder="Nhập Gemini API Key của bạn..." 
                    className={cn(
                      "w-full pl-4 pr-12 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                      !data.settings.apiKey ? "border-red-200 dark:border-red-900/30" : "border-slate-200 dark:border-slate-800"
                    )}
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
               <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400">API Key được lưu an toàn trên trình duyệt.</p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Lấy key tại đây &rarr;
                  </a>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model AI</label>
               <select 
                  value={data.settings.selectedModel}
                  onChange={(e) => handleUpdateSetting('selectedModel', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium"
               >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Default)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
               </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Sun size={18} className="text-slate-400" />
                Giao diện & Âm thanh
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Chế độ tối</p>
                      <p className="text-[10px] text-slate-400">Sử dụng tông màu ban đêm</p>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors relative",
                        data.settings.theme === 'dark' ? "bg-primary" : "bg-slate-200"
                      )}
                    >
                       <div className={cn(
                         "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                         data.settings.theme === 'dark' ? "translate-x-6" : "translate-x-0"
                       )}></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Âm thanh</p>
                      <p className="text-[10px] text-slate-400">Hiệu ứng khi quét thành công</p>
                    </div>
                    <button 
                      onClick={() => handleUpdateSetting('soundEnabled', !data.settings.soundEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors relative",
                        data.settings.soundEnabled ? "bg-primary" : "bg-slate-200"
                      )}
                    >
                       <div className={cn(
                         "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                         data.settings.soundEnabled ? "translate-x-6" : "translate-x-0"
                       )}></div>
                    </button>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Database size={18} className="text-slate-400" />
                Dữ liệu & Bảo mật
              </h3>
              
              <div className="space-y-4">
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border border-transparent hover:border-slate-100">
                    <div>
                      <p className="text-sm font-medium">Sao lưu dữ liệu (JSON)</p>
                      <p className="text-[10px] text-slate-400">Xuất file để khôi phục sau này</p>
                    </div>
                    <Save size={18} className="text-slate-400" />
                 </button>

                 <button 
                  onClick={resetData}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left text-red-500"
                 >
                    <div>
                      <p className="text-sm font-medium">Xóa trắng dữ liệu</p>
                      <p className="text-[10px] text-red-400">Xóa tất cả môn học và bài thi</p>
                    </div>
                    <Trash2 size={18} />
                 </button>
              </div>
           </div>
        </div>

        <div className="p-8 rounded-2xl bg-linear-to-br from-[#4A90E2] to-[#FF9500] text-white">
           <div className="flex gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md h-fit">
                 <Shield size={24} />
              </div>
              <div>
                 <h4 className="text-xl font-bold mb-1">Dành cho Nhà trường</h4>
                 <p className="text-white/80 text-sm mb-4">Bạn muốn triển khai QR Grade Pro cho toàn trường? Chúng tôi có giải pháp quản lý tập trung và bảo mật cao hơn.</p>
                 <button className="px-6 py-2 bg-white text-primary font-bold rounded-xl hover:scale-105 transition-transform active:scale-95">
                    Liên hệ ngay
                 </button>
              </div>
           </div>
        </div>
      </section>

      <footer className="py-8 text-center space-y-2">
         <p className="text-xs text-slate-400">QR Grade Pro v1.0.0 • Made with ❤️ for Teachers</p>
         <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-medium">
            <a href="#" className="hover:text-primary">Điều khoản</a>
            <a href="#" className="hover:text-primary">Bảo mật</a>
            <a href="#" className="hover:text-primary">Trợ giúp</a>
         </div>
      </footer>
    </motion.div>
  );
}
