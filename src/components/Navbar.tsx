import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  BarChart3, 
  MessageSquare, 
  Settings as SettingsIcon,
  GraduationCap,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { to: '/subjects', icon: BookOpen, label: 'Môn học' },
    { to: '/students', icon: Users, label: 'Học sinh' },
    { to: '/scanner', icon: QrCode, label: 'Quét thẻ' },
    { to: '/statistics', icon: BarChart3, label: 'Thống kê' },
    { to: '/ai-tutor', icon: MessageSquare, label: 'AI Tutor' },
    { to: '/settings', icon: SettingsIcon, label: 'Cài đặt' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 rounded-xl gradient-bg text-white">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-xl font-bold bg-linear-to-r from-[#4A90E2] to-[#FF9500] bg-clip-text text-transparent">
            QR Grade Pro
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-primary font-medium"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700">
          <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mb-1">Phiên bản Pro</p>
          <p className="text-[10px] text-slate-400">Đã kích hoạt AI Gemini</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-3 flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-slate-400"
              )
            }
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
