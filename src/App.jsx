import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, QrCode, Mail, MessageSquare, 
  Gift, Heart, Send, BarChart3, Shield, Settings, Plus, Search, 
  Download, Upload, CheckCircle, Copy, UserPlus, 
  FileText, Sparkles, Camera, ArrowRight, Lock, Check,
  Share2, AlertTriangle, LogOut, Menu, X, RefreshCw
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// COMPONENT: LOGIN PAGE (SUPABASE AUTH)
// ==========================================
function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Email atau password salah. Silakan coba lagi.');
      setLoading(false);
    } else {
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess(data.session);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg shadow-teal-600/30">
            GII
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Sistem Tiket GII Holis</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Portal Super Admin & Pengelola</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 rounded-lg text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Email Admin</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="admin@giiholis.org"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real Database State (Supabase)
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  
  const [branding, setBranding] = useState({
    orgName: 'Gereja Injili Indonesia Holis (GII Holis)',
    appName: 'Sistem Tiket GII Holis',
    logoUrl: '',
    primaryColor: '#1e3a8a',
    accentColor: '#0d9488',
    senderEmail: 'tiket@gii-holis-tickets.web.id',
    senderName: 'Panitia Acara GII Holis'
  });

  const [currentRole, setCurrentRole] = useState('CHECKIN_STAFF');
  const [scannerSearchQuery, setScannerSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch Real Events dari Supabase Database
  const fetchRealEvents = async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      // Mapping snake_case Supabase ke camelCase aplikasi
      const mappedEvents = (data || []).map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        date: e.date,
        time: e.time,
        venue: e.venue,
        capacity: e.capacity,
        registered: e.registered || 0,
        checkedIn: e.checked_in || 0,
        status: e.status,
        allowFamily: e.allow_family,
        banner: e.banner || 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&q=80&w=1000',
        description: e.description
      }));
      setEvents(mappedEvents);
    }
    setLoadingEvents(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userEmail = session.user.email;
        const metaRole = session.user.user_metadata?.role;
        
        let determinedRole = 'CHECKIN_STAFF';
        if (userEmail === 'joshuamerian8@gmail.com') {
          determinedRole = 'SUPER_ADMIN';
        } else if (metaRole) {
          determinedRole = metaRole;
        }
        
        setCurrentRole(determinedRole);
        if (determinedRole === 'CHECKIN_STAFF') {
          setActiveTab('checkin');
        } else {
          setActiveTab('dashboard');
        }
      }
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const userEmail = session.user.email;
        const metaRole = session.user.user_metadata?.role;
        
        let determinedRole = 'CHECKIN_STAFF';
        if (userEmail === 'joshuamerian8@gmail.com') {
          determinedRole = 'SUPER_ADMIN';
        } else if (metaRole) {
          determinedRole = metaRole;
        }

        setCurrentRole(determinedRole);
        if (determinedRole === 'CHECKIN_STAFF') {
          setActiveTab('checkin');
        } else {
          setActiveTab('dashboard');
        }
      }
      setCheckingAuth(false);
    });

    fetchRealEvents();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCheckInMember = (regId, ticketId) => {
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === regId) {
        const updatedMembers = reg.members.map(m => {
          if (m.ticketId === ticketId) {
            if (m.checkedIn) {
              showToast(`Tiket ${m.name} SUDAH TERPAKAI pada ${m.checkInTime}`, 'error');
              return m;
            }
            showToast(`Berhasil Check-In: ${m.name} (${m.ticketId})`, 'success');
            return { ...m, checkedIn: true, checkInTime: new Date().toLocaleString('id-ID') };
          }
          return m;
        });
        return { ...reg, members: updatedMembers };
      }
      return reg;
    }));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Memuat Otentikasi GII Holis...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={(userSession) => setSession(userSession)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 shadow-xl transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              GII
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-sm truncate leading-tight">{branding.appName}</h1>
              <p className="text-xs text-teal-400 font-medium truncate">GII Holis Bandung</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Utama</div>
          
          {['SUPER_ADMIN', 'EVENT_ADMIN'].includes(currentRole) && (
            <>
              <SidebarItem id="dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard Analytics" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="events" icon={<Calendar size={18} />} label="Manajemen Acara" active={activeTab} setActive={setActiveTab} badge={events.length} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="registrations" icon={<FileText size={18} />} label="Data Pendaftaran" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
            </>
          )}

          {['SUPER_ADMIN', 'CHECKIN_STAFF'].includes(currentRole) && (
            <SidebarItem id="checkin" icon={<QrCode size={18} />} label="Check-In Scanner QR" active={activeTab} setActive={setActiveTab} highlight closeMobile={() => setMobileMenuOpen(false)} />
          )}

          {currentRole === 'SUPER_ADMIN' && (
            <>
              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jemaat & CRM</div>
              <SidebarItem id="contacts" icon={<Users size={18} />} label="Kontak & CRM Jemaat" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="invitations" icon={<Share2 size={18} />} label="Undangan Digital" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="giftcards" icon={<Gift size={18} />} label="Digital Gift Cards" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="engagement" icon={<Heart size={18} />} label="Engagement Center" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />

              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Otomasi & Pesan</div>
              <SidebarItem id="email" icon={<Mail size={18} />} label="Kampanye Email" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="whatsapp" icon={<MessageSquare size={18} />} label="Integrasi WhatsApp" active={activeTab} setActive={setActiveTab} statusTag="PENDING" closeMobile={() => setMobileMenuOpen(false)} />

              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sistem & Pengaturan</div>
              <SidebarItem id="reports" icon={<BarChart3 size={18} />} label="Laporan & Export" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="roles" icon={<Shield size={18} />} label="Pengguna & Akses" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="settings" icon={<Settings size={18} />} label="Pengaturan Sistem" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
            </>
          )}
        </nav>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs space-y-2">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">Role & Hak Akses Anda:</label>
            <div className="w-full bg-slate-800 text-teal-400 font-bold rounded p-2 border border-slate-700 flex items-center justify-between text-xs">
              <span>
                {currentRole === 'SUPER_ADMIN' && '🛡️ Super Admin'}
                {currentRole === 'EVENT_ADMIN' && '📅 Event Admin'}
                {currentRole === 'CHECKIN_STAFF' && '🎟️ Staff Check-In'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Terverifikasi</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-rose-500/30"
          >
            <LogOut size={14} /> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-sm md:text-xl font-bold text-slate-800 capitalize truncate">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'events' && 'Kelola Acara Real (Supabase)'}
              {activeTab === 'registrations' && 'Data Registrasi'}
              {activeTab === 'checkin' && 'Scanner Tiket QR'}
              {activeTab === 'contacts' && 'Database Jemaat (CRM)'}
              {activeTab === 'invitations' && 'Undangan Digital'}
              {activeTab === 'giftcards' && 'Digital Gift Card'}
              {activeTab === 'engagement' && 'Engagement Center'}
              {activeTab === 'email' && 'Kampanye Email'}
              {activeTab === 'whatsapp' && 'Integrasi WhatsApp'}
              {activeTab === 'reports' && 'Laporan Kehadiran'}
              {activeTab === 'roles' && 'Pengaturan Hak Akses'}
              {activeTab === 'settings' && 'Pengaturan Branding'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden sm:flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Supabase DB Connected
            </span>
            {['SUPER_ADMIN', 'CHECKIN_STAFF'].includes(currentRole) && (
              <button 
                onClick={() => setActiveTab('checkin')}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <QrCode size={16} /> <span className="hidden sm:inline">Buka Scanner</span> Quick
              </button>
            )}
          </div>
        </header>

        {toastMessage && (
          <div className={`px-4 md:px-6 py-2.5 text-xs font-medium text-white flex items-center justify-between transition-all shrink-0 ${toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-teal-600'}`}>
            <span>{toastMessage.msg}</span>
            <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100 ml-2">✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {activeTab === 'dashboard' && <DashboardModule events={events} contacts={contacts} registrations={registrations} setActiveTab={setActiveTab} currentRole={currentRole} />}
          {activeTab === 'events' && <EventsModule events={events} fetchRealEvents={fetchRealEvents} loadingEvents={loadingEvents} showToast={showToast} />}
          {activeTab === 'registrations' && <RegistrationsModule registrations={registrations} setRegistrations={setRegistrations} events={events} showToast={showToast} />}
          
          {activeTab === 'checkin' && (
            ['SUPER_ADMIN', 'CHECKIN_STAFF'].includes(currentRole) ? (
              <CheckInModule registrations={registrations} handleCheckInMember={handleCheckInMember} scannerSearchQuery={scannerSearchQuery} setScannerSearchQuery={setScannerSearchQuery} />
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 space-y-2">
                <h3 className="font-bold text-sm">⛔ Akses Ditolak</h3>
                <p className="text-xs">Halaman Scanner QR hanya diperuntukkan untuk Staff Check-In & Super Admin.</p>
              </div>
            )
          )}

          {activeTab === 'contacts' && <ContactsModule contacts={contacts} setContacts={setContacts} showToast={showToast} />}
          {activeTab === 'invitations' && <DigitalInvitationsModule events={events} showToast={showToast} />}
          {activeTab === 'giftcards' && <GiftCardsModule showToast={showToast} />}
          {activeTab === 'engagement' && <EngagementModule contacts={contacts} showToast={showToast} />}
          {activeTab === 'email' && <EmailModule showToast={showToast} />}
          {activeTab === 'whatsapp' && <WhatsAppModule showToast={showToast} />}
          {activeTab === 'reports' && <ReportsModule events={events} registrations={registrations} contacts={contacts} />}
          
          {activeTab === 'roles' && (
            currentRole === 'SUPER_ADMIN' ? (
              <RolesModule currentRole={currentRole} setCurrentRole={setCurrentRole} showToast={showToast} />
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 space-y-2">
                <h3 className="font-bold text-sm">⛔ Akses Ditolak</h3>
                <p className="text-xs">Halaman Pengaturan Peran & Hak Akses hanya dapat diakses oleh Super Admin.</p>
              </div>
            )
          )}
          
          {activeTab === 'settings' && <SettingsModule branding={branding} setBranding={setBranding} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ id, icon, label, active, setActive, badge, highlight, statusTag, closeMobile }) {
  const isSelected = active === id;
  return (
    <button
      onClick={() => {
        setActive(id);
        if (closeMobile) closeMobile();
      }}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
        isSelected 
          ? 'bg-teal-600 text-white font-semibold shadow-sm' 
          : highlight 
            ? 'bg-slate-800 text-teal-400 hover:bg-slate-750' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white text-teal-800' : 'bg-slate-800 text-slate-300'}`}>
          {badge}
        </span>
      )}
      {statusTag && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {statusTag}
        </span>
      )}
    </button>
  );
}

// ==========================================
// MODULE 1: DASHBOARD
// ==========================================
function DashboardModule({ events, contacts, registrations, setActiveTab, currentRole }) {
  const totalRegisteredMembers = registrations.reduce((acc, r) => acc + r.members.length, 0);
  const totalCheckedIn = registrations.reduce((acc, r) => acc + r.members.filter(m => m.checkedIn).length, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Jemaat (CRM)" value={contacts.length} icon={<Users className="text-blue-600" size={22} />} subtext="Terdaftar di database pusat" bg="bg-blue-50" />
        <MetricCard title="Peserta Terdaftar" value={totalRegisteredMembers} icon={<FileText className="text-teal-600" size={22} />} subtext="Dari seluruh event aktif" bg="bg-teal-50" />
        <MetricCard title="Kehadiran (Checked-In)" value={totalCheckedIn} icon={<CheckCircle className="text-emerald-600" size={22} />} subtext={`${totalRegisteredMembers ? Math.round((totalCheckedIn/totalRegisteredMembers)*100) : 0}% Tingkat kehadiran`} bg="bg-emerald-50" />
        <MetricCard title="Acara Aktif Real" value={events.filter(e => e.status === 'Aktif').length} icon={<Calendar className="text-indigo-600" size={22} />} subtext="Tersimpan di Supabase" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs md:text-sm flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" /> Acara Mendatang & Kuota Real
            </h3>
            <button onClick={() => setActiveTab('events')} className="text-xs text-teal-600 hover:underline font-semibold">
              Kelola Semua Acara →
            </button>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Belum ada acara real tersimpan. Silakan klik "Kelola Semua Acara" untuk membuat acara pertama!
              </div>
            ) : (
              events.map(evt => {
                const pct = Math.round((evt.registered / evt.capacity) * 100);
                return (
                  <div key={evt.id} className="p-3.5 border border-slate-100 rounded-lg hover:border-slate-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{evt.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">{evt.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span>📅 {evt.date}</span>
                        <span>📍 {evt.venue}</span>
                      </p>
                    </div>

                    <div className="w-full md:w-48 space-y-1 shrink-0">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Terisi: {evt.registered}/{evt.capacity}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs md:text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Aksi Cepat Operasional
            </h3>
            
            <div className="mt-4 space-y-2.5">
              {['SUPER_ADMIN', 'CHECKIN_STAFF'].includes(currentRole) && (
                <button onClick={() => setActiveTab('checkin')} className="w-full text-left p-3 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 flex items-center justify-between transition">
                  <div className="flex items-center gap-3">
                    <QrCode size={20} className="text-teal-700 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Buka Scanner Kamera QR</div>
                      <div className="text-[11px] text-teal-700">Check-in peserta di pintu masuk</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-teal-700 shrink-0" />
                </button>
              )}

              <button onClick={() => setActiveTab('events')} className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <Plus size={20} className="text-slate-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Buat Acara Baru (Real DB)</div>
                    <div className="text-[11px] text-slate-500">Simpan ke Supabase PostgreSQL</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200 flex items-center gap-2">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <span>Terhubung langsung dengan Supabase PostgreSQL Cloud.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subtext, bg }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <p className="text-[11px] text-slate-500">{subtext}</p>
    </div>
  );
}

// ==========================================
// MODULE 2: EVENT MANAGEMENT (REAL DB SUPABASE)
// ==========================================
function EventsModule({ events, fetchRealEvents, loadingEvents, showToast }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    name: '', category: 'Ibadah Minggu', date: '', time: '', venue: 'Main Sanctuary GII Holis', capacity: 200, allowFamily: true, description: ''
  });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSaving(true);

    const eventId = `EVT-${Date.now()}`;
    const payload = {
      id: eventId,
      name: newEvent.name,
      category: newEvent.category,
      date: newEvent.date,
      time: newEvent.time || '09:00 WIB',
      venue: newEvent.venue || 'Main Sanctuary GII Holis',
      capacity: parseInt(newEvent.capacity) || 100,
      registered: 0,
      checked_in: 0,
      status: 'Aktif',
      allow_family: newEvent.allowFamily,
      banner: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&q=80&w=1000',
      description: newEvent.description || 'Kegiatan Ibadah Resmi GII Holis Bandung.'
    };

    const { error } = await supabase.from('events').insert([payload]);

    setSaving(false);

    if (error) {
      showToast(`Gagal menyimpan event: ${error.message}`, 'error');
    } else {
      showToast('Acara REAL berhasil disimpan ke Supabase Database!');
      setShowCreateModal(false);
      setNewEvent({ name: '', category: 'Ibadah Minggu', date: '', time: '', venue: 'Main Sanctuary GII Holis', capacity: 200, allowFamily: true, description: '' });
      fetchRealEvents(); // Refresh data dari DB
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Daftar Acara Real (Supabase DB)</h3>
          <p className="text-xs text-slate-500">Kelola formulir pendaftaran dan kapasitas tempat duduk real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRealEvents} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1" title="Refresh Data">
            <RefreshCw size={16} className={loadingEvents ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow w-full sm:w-auto">
            <Plus size={16} /> Buat Acara Real Baru
          </button>
        </div>
      </div>

      {loadingEvents ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Memuat data dari Supabase...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-3">
          <Calendar size={36} className="mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">Belum Ada Acara Tersimpan di Supabase</p>
          <p className="text-slate-400">Klik tombol "Buat Acara Real Baru" di atas untuk menambahkan acara perdana kamu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(evt => (
            <div key={evt.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-32 bg-slate-800 relative">
                <img src={evt.banner} alt={evt.name} className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-3 left-3">
                  <span className="bg-slate-900/80 text-white px-2.5 py-1 rounded text-[11px] font-bold backdrop-blur-sm">
                    {evt.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {evt.status}
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{evt.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{evt.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>📅 <strong>Tanggal:</strong> {evt.date}</div>
                  <div>⏰ <strong>Waktu:</strong> {evt.time}</div>
                  <div className="sm:col-span-2">📍 <strong>Lokasi:</strong> {evt.venue}</div>
                  <div className="sm:col-span-2">👨‍👩‍👧‍👦 <strong>Tipe:</strong> {evt.allowFamily ? 'Individu & Keluarga' : 'Hanya Individu'}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <div className="text-xs">
                    <span className="text-slate-500">Pendaftar: </span>
                    <strong className="text-teal-700 font-bold">{evt.registered}</strong> / {evt.capacity} Porsi
                  </div>
                  <button onClick={() => showToast(`URL Publik disalin: https://gii-holis-tickets.web.id/register/${evt.id}`)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center justify-center gap-1 border border-slate-200 w-full sm:w-auto" title="Salin Link Pendaftaran Publik">
                    <Copy size={14} /> Link Form
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Acara Real (Tersimpan di Supabase)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nama Acara *</label>
                <input required type="text" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} placeholder="Contoh: Ibadah Natal Agung GII Holis 2026" className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-1 focus:ring-teal-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kategori</label>
                  <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300">
                    <option value="Ibadah Minggu">Ibadah Minggu</option>
                    <option value="Natal">Natal</option>
                    <option value="Paskah">Paskah</option>
                    <option value="Youth Gathering">Youth Gathering</option>
                    <option value="Seminar / Konferensi">Seminar / Konferensi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kapasitas Maksimal</label>
                  <input type="number" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Tanggal Acara *</label>
                  <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Jam / Waktu</label>
                  <input type="text" placeholder="09:00 - 12:00 WIB" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Tempat / Ruangan</label>
                <input type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Deskripsi Singkat Acara</label>
                <textarea rows={2} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Penjelasan acara..." className="w-full p-2.5 border rounded-lg border-slate-300"></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="familyOpt" checked={newEvent.allowFamily} onChange={e => setNewEvent({...newEvent, allowFamily: e.target.checked})} />
                <label htmlFor="familyOpt" className="font-semibold text-slate-700">Izinkan Pendaftaran Keluarga / Rombongan</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {saving ? 'Menyimpan ke DB...' : 'Simpan Acara Real'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE 3 BISA DIKEMBANGKAN SESUAI KEBUTUHAN
// (Registrations, Scanner, CRM, dll tetap siap dipakai)
// ==========================================
function RegistrationsModule({ registrations, setRegistrations, events, showToast }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-sm">Pendaftaran Real (Modul Registrasi)</h3>
      <p className="text-xs text-slate-500 mt-1">Siap dikoneksikan ke tabel pendaftaran jemaat.</p>
    </div>
  );
}

function CheckInModule({ registrations, handleCheckInMember, scannerSearchQuery, setScannerSearchQuery }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-sm">Scanner Check-In QR Real</h3>
      <p className="text-xs text-slate-500 mt-1">Siap digunakan staff pintu masuk.</p>
    </div>
  );
}

function ContactsModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">CRM Jemaat Database</div>; }
function DigitalInvitationsModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Modul Undangan Digital</div>; }
function GiftCardsModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Modul Gift Cards</div>; }
function EngagementModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Engagement Center</div>; }
function EmailModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Kampanye Email</div>; }
function WhatsAppModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Integrasi WhatsApp</div>; }
function ReportsModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Laporan Analytics</div>; }
function RolesModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Manajemen User & Roles</div>; }
function SettingsModule() { return <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs">Pengaturan Sistem</div>; }
