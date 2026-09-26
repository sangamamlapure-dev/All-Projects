import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Menu, User, Sparkles, AlertTriangle, CheckCircle2,
  ChevronRight, X, Edit3, Check, Settings as SettingsIcon
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { alerts, zones, reports, lastUpdated, setSelectedZoneId, userProfile, updateUserProfile } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setNameInput(userProfile.name);
  }, [userProfile.name]);

  const unresolved = alerts.filter(a => !a.resolved);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdated) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Click outside to close search and profile dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
        setEditingName(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredZones = searchQuery.trim()
    ? zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredAlerts = searchQuery.trim()
    ? alerts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredReports = searchQuery.trim()
    ? reports.filter(r => r.waterBody.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const totalResults = filteredZones.length + filteredAlerts.length + filteredReports.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
      {/* Mobile menu trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar navigation"
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-48 sm:w-72 md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search zones, telemetry, alerts, reports..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-slate-100/90 border border-slate-200/80 focus:border-cyan-500 focus:bg-white focus:outline-none transition-all text-slate-700 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-full sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Search Results ({totalResults})</span>
                <span className="text-[10px] text-slate-400">Press ESC to dismiss</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {totalResults === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No results found matching "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {filteredZones.length > 0 && (
                      <div className="p-2">
                        <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Monitoring Zones</p>
                        {filteredZones.map(z => (
                          <button
                            key={z.id}
                            onClick={() => {
                              setSelectedZoneId(z.id);
                              setShowSearchResults(false);
                              navigate('/map');
                            }}
                            className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-cyan-50 group transition-colors"
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-800 group-hover:text-cyan-700">{z.name}</p>
                              <p className="text-[10px] text-slate-400">pH {z.reading.ph} • TDS {z.reading.tds} ppm • {z.status.toUpperCase()}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-600" />
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredAlerts.length > 0 && (
                      <div className="p-2">
                        <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Alerts</p>
                        {filteredAlerts.slice(0, 3).map(a => (
                          <button
                            key={a.id}
                            onClick={() => {
                              setShowSearchResults(false);
                              navigate('/alerts');
                            }}
                            className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group transition-colors"
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-800">{a.title}</p>
                              <p className="text-[10px] text-slate-400">{a.location} • {a.value}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              a.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {a.severity}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredReports.length > 0 && (
                      <div className="p-2">
                        <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Reports</p>
                        {filteredReports.slice(0, 2).map(r => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setShowSearchResults(false);
                              navigate('/reports');
                            }}
                            className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group transition-colors"
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-800">{r.waterBody}</p>
                              <p className="text-[10px] text-slate-400">Report ID: {r.id} ({r.date})</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Real-time Ticker */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 text-[11px] font-medium text-slate-600 border border-slate-200/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Updated {secondsAgo}s ago</span>
        </div>


        {/* Notifications Icon with active dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Toggle notifications dropdown"
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unresolved.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unresolved.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs tracking-wide">Live IoT Alerts ({unresolved.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/alerts');
                    }}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {unresolved.slice(0, 5).map(a => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/alerts');
                      }}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          a.severity === 'CRITICAL' ? 'bg-red-500 ring-4 ring-red-100' :
                          a.severity === 'WARNING' ? 'bg-amber-500 ring-4 ring-amber-100' :
                          'bg-blue-500 ring-4 ring-blue-100'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{a.location} • <span className="font-mono text-slate-700">{a.value}</span></p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(a.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {unresolved.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-80" />
                      All clear — no unresolved alerts
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/alerts');
                    }}
                    className="w-full py-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
                  >
                    Manage & Resolve Alerts &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dynamic User Profile */}
        <div ref={profileRef} className="relative pl-2 sm:pl-3 border-l border-slate-200">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User Profile"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block max-w-[140px] truncate">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                {userProfile.name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {userProfile.role}
              </p>
            </div>
          </button>

          {/* User Profile Dropdown / Quick Name Editor */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-sm shadow-md">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{userProfile.name}</p>
                    <p className="text-[11px] text-cyan-300 font-medium truncate">{userProfile.role}</p>
                    <p className="text-[10px] text-slate-400 truncate">{userProfile.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Change Display Name:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          updateUserProfile({ name: nameInput.trim() || 'User' });
                          setShowProfileMenu(false);
                        }
                      }}
                      placeholder="Enter any user name..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-semibold text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => {
                        updateUserProfile({ name: nameInput.trim() || 'User' });
                        setShowProfileMenu(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Quick Preset Roles:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Dr. R. Sharma', 'Sangam Amlapure', 'Environmental Officer', 'Administrator', 'Research Analyst'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          setNameInput(preset);
                          updateUserProfile({ name: preset });
                        }}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                          userProfile.name === preset
                            ? 'bg-cyan-50 border-cyan-300 text-cyan-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {userProfile.department}
                  </span>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-800"
                  >
                    <SettingsIcon className="w-3 h-3" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
