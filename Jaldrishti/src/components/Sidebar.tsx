import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Map,
  Sailboat,
  FlaskConical,
  Bell,
  History,
  FileText,
  Settings as SettingsIcon,
  Droplets,
  Wifi,
  Presentation as PresentationIcon,
  Award,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/live', label: 'Live Monitoring', icon: Activity },
  { to: '/map', label: 'Water Quality Map', icon: Map },
  { to: '/boat', label: 'Boat Monitoring', icon: Sailboat },
  { to: '/treatment', label: 'Treatment / Purification', icon: FlaskConical },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
  { to: '/historical', label: 'Historical Data', icon: History },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { alerts, boat } = useData();
  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-slate-900 text-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">JalDrishti</h1>
              <p className="text-[10px] text-cyan-400 font-medium tracking-wide">Smart Water Monitoring</p>
            </div>
          </div>

          {/* Official Tagline */}
          <div className="mt-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <p className="text-[10px] text-slate-300 italic font-medium leading-tight text-center">
              &ldquo;Smart Monitoring. Cleaner Water. Safer Communities.&rdquo;
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-l-3 border-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && unresolvedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/80 text-white">
                    {unresolvedCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Presentation Link */}
        <div className="px-3 pt-2 pb-2">
          <NavLink
            to="/presentation"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>System Presentation</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-black">16 SLIDES</span>
          </NavLink>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white">System Status</p>
                <span className="text-[10px] font-bold text-emerald-400">ONLINE</span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <Wifi className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span>Boat: {boat.status} ({boat.battery}%)</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
