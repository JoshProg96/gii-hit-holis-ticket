import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, QrCode, Mail, MessageSquare, 
  Gift, Heart, Send, BarChart3, Shield, Settings, Plus, Search, 
  Download, Upload, CheckCircle, Copy, UserPlus, 
  FileText, Sparkles, Camera, ArrowRight, Lock, Check,
  Share2, AlertTriangle, LogOut
} from 'lucide-react';
import { supabase } from './supabaseClient'; // Integrasi Supabase Client

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
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg shadow-teal-600/30">
            GII
          </div>
          <h2 className="text-2xl font-bold text-white">Sistem Tiket GII Holis</h2>
          <p className="text-slate-400 text-sm mt-1">Portal Super Admin & Pengelola</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 rounded-lg text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
// INITIAL CENTRAL DATABASE
// ==========================================
const INITIAL_EVENTS = [
  {
    id: 'EVT-2026-001',
    name: 'Ibadah Natal GII Holis 2026',
    category: 'Natal',
    date: '2026-12-25',
    time: '09:00 - 12:00 WIB',
    venue: 'Main Sanctuary GII Holis, Bandung',
    capacity: 500,
    registered: 342,
    checkedIn: 0,
    status: 'Aktif',
    allowFamily: true,
    banner: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&q=80&w=1000',
    description: 'Perayaan Ibadah Natal Agung GII Holis 2026 dengan tema "Terang di Tengah Kegelapan". Sukacita bersama keluarga!',
    customFields: [
      { id: 'f1', label: 'Wilayah Rayon / Komunitas', type: 'dropdown', options: ['Holis Barat', 'Holis Timur', 'Cijerah', 'Kopo', 'Lainnya'], required: true },
      { id: 'f2', label: 'Butuh Konseling / Perlawatan', type: 'checkbox', required: false }
    ]
  },
  {
    id: 'EVT-2027-002',
    name: 'Retreat Pemuda Youth GII Holis 2027',
    category: 'Youth Gathering',
    date: '2027-03-15',
    time: '08:00 WIB (3 Hari 2 Malam)',
    venue: 'Lembang Pastoral Center',
    capacity: 120,
    registered: 89,
    checkedIn: 0,
    status: 'Aktif',
    allowFamily: false,
    banner: 'https://images.unsplash.com/photo-1526976668916-ece7e4e8566a?auto=format&fit=crop&q=80&w=1000',
    description: 'Retreat tahunan pemuda-pemudi GII Holis. Temukan tujuan dan panggilan hidupmu!',
    customFields: [
      { id: 'f3', label: 'Ukuran Kaos', type: 'dropdown', options: ['S', 'M', 'L', 'XL', 'XXL'], required: true }
    ]
  }
];

const INITIAL_CONTACTS = [
  { id: 'CON-001', name: 'Budi Santoso', email: 'budi.santoso@example.com', phone: '081234567890', dob: '1985-11-12', church: 'GII Holis', Rayon: 'Holis Barat', totalEvents: 5 },
  { id: 'CON-002', name: 'Siti Rahmawati', email: 'siti.rahma@example.com', phone: '081776543210', dob: '1992-05-20', church: 'GII Holis', Rayon: 'Cijerah', totalEvents: 3 },
  { id: 'CON-003', name: 'Daniel Wijaya', email: 'daniel.w@example.com', phone: '085611223344', dob: '2001-08-14', church: 'GII Holis', Rayon: 'Kopo', totalEvents: 8 },
  { id: 'CON-004', name: 'Grace Tanujaya', email: 'grace.tan@example.com', phone: '081988776655', dob: '1990-11-09', church: 'GII Holis', Rayon: 'Holis Timur', totalEvents: 2 }
];

const INITIAL_REGISTRATIONS = [
  {
    id: 'REG-9081',
    eventId: 'EVT-2026-001',
    eventName: 'Ibadah Natal GII Holis 2026',
    primaryContact: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    phone: '081234567890',
    type: 'Keluarga',
    membersCount: 3,
    registrationDate: '2026-11-01 10:15',
    members: [
      { ticketId: 'TKT-9081-1', name: 'Budi Santoso', category: 'Dewasa', qrCode: 'QR-GII-9081-1', checkedIn: false, checkInTime: null },
      { ticketId: 'TKT-9081-2', name: 'Maria Santoso', category: 'Dewasa', qrCode: 'QR-GII-9081-2', checkedIn: false, checkInTime: null },
      { ticketId: 'TKT-9081-3', name: 'Kevin Santoso', category: 'Anak (Sekolah Minggu)', qrCode: 'QR-GII-9081-3', checkedIn: true, checkInTime: '2026-12-25 08:30' }
    ]
  },
  {
    id: 'REG-9082',
    eventId: 'EVT-2026-001',
    eventName: 'Ibadah Natal GII Holis 2026',
    primaryContact: 'Grace Tanujaya',
    email: 'grace.tan@example.com',
    phone: '081988776655',
    type: 'Individu',
    membersCount: 1,
    registrationDate: '2026-11-04 14:20',
    members: [
      { ticketId: 'TKT-9082-1', name: 'Grace Tanujaya', category: 'Dewasa', qrCode: 'QR-GII-9082-1', checkedIn: false, checkInTime: null }
    ]
  }
];

export default function App() {
  // Session & Auth State
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Database States
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATIONS);
  
  // Branding & Settings State
  const [branding, setBranding] = useState({
    orgName: 'Gereja Injili Indonesia Holis (GII Holis)',
    appName: 'Sistem Tiket GII Holis',
    logoUrl: '',
    primaryColor: '#1e3a8a',
    accentColor: '#0d9488',
    senderEmail: 'tiket@gii-holis-tickets.web.id',
    senderName: 'Panitia Acara GII Holis'
  });

  // User Role State (Default ke CHECKIN_STAFF jika metadata tidak ditemukan)
  const [currentRole, setCurrentRole] = useState('CHECKIN_STAFF');

  // Scanner & Toast
  const [scannerSearchQuery, setScannerSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Check Supabase Auth Session & Set Role Dynamically
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userEmail = session.user.email;
        const metaRole = session.user.user_metadata?.role;
        
        // Akun Utama Otomatis Super Admin & Pengguna Lain Sesuai Metadata Supabase
        if (userEmail === 'joshuamerian8@gmail.com') {
          setCurrentRole('SUPER_ADMIN');
        } else {
          setCurrentRole(metaRole || 'CHECKIN_STAFF');
        }
      }
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const userEmail = session.user.email;
        const metaRole = session.user.user_metadata?.role;
        
        if (userEmail === 'joshuamerian8@gmail.com') {
          setCurrentRole('SUPER_ADMIN');
        } else {
          setCurrentRole(metaRole || 'CHECKIN_STAFF');
        }
      }
      setCheckingAuth(false);
    });

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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 shadow-xl z-20">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            GII
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-sm truncate leading-tight">{branding.appName}</h1>
            <p className="text-xs text-teal-400 font-medium truncate">GII Holis Bandung</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Utama</div>
          
          {/* Menu Khusus Admin (Super Admin & Event Admin) */}
          {['SUPER_ADMIN', 'EVENT_ADMIN'].includes(currentRole) && (
            <>
              <SidebarItem id="dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard Analytics" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="events" icon={<Calendar size={18} />} label="Manajemen Acara" active={activeTab} setActive={setActiveTab} badge={events.length} />
              <SidebarItem id="registrations" icon={<FileText size={18} />} label="Data Pendaftaran" active={activeTab} setActive={setActiveTab} />
            </>
          )}

          {/* Menu Check-In Scanner (Dapat Diakses Semua Role) */}
          <SidebarItem id="checkin" icon={<QrCode size={18} />} label="Check-In Scanner QR" active={activeTab} setActive={setActiveTab} highlight />

          {/* Menu Terkunci Khusus Super Admin */}
          {currentRole === 'SUPER_ADMIN' && (
            <>
              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jemaat & CRM</div>
              <SidebarItem id="contacts" icon={<Users size={18} />} label="Kontak & CRM Jemaat" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="invitations" icon={<Share2 size={18} />} label="Undangan Digital" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="giftcards" icon={<Gift size={18} />} label="Digital Gift Cards" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="engagement" icon={<Heart size={18} />} label="Engagement Center" active={activeTab} setActive={setActiveTab} />

              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Otomasi & Pesan</div>
              <SidebarItem id="email" icon={<Mail size={18} />} label="Kampanye Email" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="whatsapp" icon={<MessageSquare size={18} />} label="Integrasi WhatsApp" active={activeTab} setActive={setActiveTab} statusTag="PENDING" />

              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sistem & Pengaturan</div>
              <SidebarItem id="reports" icon={<BarChart3 size={18} />} label="Laporan & Export" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="roles" icon={<Shield size={18} />} label="Pengguna & Akses" active={activeTab} setActive={setActiveTab} />
              <SidebarItem id="settings" icon={<Settings size={18} />} label="Pengaturan Sistem" active={activeTab} setActive={setActiveTab} />
            </>
          )}
        </nav>

        {/* Role Badge Terkunci & Logout */}
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
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'events' && 'Kelola Acara & Form Pendaftaran'}
              {activeTab === 'registrations' && 'Data Registrasi Pendaftar'}
              {activeTab === 'checkin' && 'Scanner Tiket QR & Verifikasi Kehadiran'}
              {activeTab === 'contacts' && 'Database Terpusat Jemaat (CRM)'}
              {activeTab === 'invitations' && 'Pembuat Undangan Digital'}
              {activeTab === 'giftcards' && 'Digital Gift Card & Ucapan'}
              {activeTab === 'engagement' && 'Center Apresiasi & Ulang Tahun'}
              {activeTab === 'email' && 'Otomasi & Template Email'}
              {activeTab === 'whatsapp' && 'Integrasi Meta WhatsApp Cloud API'}
              {activeTab === 'reports' && 'Laporan & Analytics Kehadiran'}
              {activeTab === 'roles' && 'Pengaturan Peran & Hak Akses (RBAC)'}
              {activeTab === 'settings' && 'Pengaturan Branding & Server'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              GII Holis Server Online
            </span>
            <button 
              onClick={() => setActiveTab('checkin')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              <QrCode size={16} /> Buka Scanner Quick
            </button>
          </div>
        </header>

        {toastMessage && (
          <div className={`px-6 py-2.5 text-xs font-medium text-white flex items-center justify-between transition-all ${toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-teal-600'}`}>
            <span>{toastMessage.msg}</span>
            <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100">✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'dashboard' && <DashboardModule events={events} contacts={contacts} registrations={registrations} setActiveTab={setActiveTab} />}
          {activeTab === 'events' && <EventsModule events={events} setEvents={setEvents} showToast={showToast} />}
          {activeTab === 'registrations' && <RegistrationsModule registrations={registrations} setRegistrations={setRegistrations} events={events} showToast={showToast} />}
          {activeTab === 'checkin' && <CheckInModule registrations={registrations} handleCheckInMember={handleCheckInMember} scannerSearchQuery={scannerSearchQuery} setScannerSearchQuery={setScannerSearchQuery} />}
          {activeTab === 'contacts' && <ContactsModule contacts={contacts} setContacts={setContacts} showToast={showToast} />}
          {activeTab === 'invitations' && <DigitalInvitationsModule events={events} showToast={showToast} />}
          {activeTab === 'giftcards' && <GiftCardsModule showToast={showToast} />}
          {activeTab === 'engagement' && <EngagementModule contacts={contacts} showToast={showToast} />}
          {activeTab === 'email' && <EmailModule showToast={showToast} />}
          {activeTab === 'whatsapp' && <WhatsAppModule showToast={showToast} />}
          {activeTab === 'reports' && <ReportsModule events={events} registrations={registrations} contacts={contacts} />}
          {activeTab === 'roles' && <RolesModule currentRole={currentRole} setCurrentRole={setCurrentRole} />}
          {activeTab === 'settings' && <SettingsModule branding={branding} setBranding={setBranding} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ id, icon, label, active, setActive, badge, highlight, statusTag }) {
  const isSelected = active === id;
  return (
    <button
      onClick={() => setActive(id)}
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

// MODULE 1: DASHBOARD
function DashboardModule({ events, contacts, registrations, setActiveTab }) {
  const totalRegisteredMembers = registrations.reduce((acc, r) => acc + r.members.length, 0);
  const totalCheckedIn = registrations.reduce((acc, r) => acc + r.members.filter(m => m.checkedIn).length, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Jemaat (CRM)" value={contacts.length} icon={<Users className="text-blue-600" size={22} />} subtext="Terdaftar di database pusat" bg="bg-blue-50" />
        <MetricCard title="Peserta Terdaftar" value={totalRegisteredMembers} icon={<FileText className="text-teal-600" size={22} />} subtext="Dari seluruh event aktif" bg="bg-teal-50" />
        <MetricCard title="Kehadiran (Checked-In)" value={totalCheckedIn} icon={<CheckCircle className="text-emerald-600" size={22} />} subtext={`${totalRegisteredMembers ? Math.round((totalCheckedIn/totalRegisteredMembers)*100) : 0}% Tingkat kehadiran`} bg="bg-emerald-50" />
        <MetricCard title="Acara Aktif" value={events.filter(e => e.status === 'Aktif').length} icon={<Calendar className="text-indigo-600" size={22} />} subtext="Siap menerima pendaftaran" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" /> Acara Mendatang & Kuota
            </h3>
            <button onClick={() => setActiveTab('events')} className="text-xs text-teal-600 hover:underline font-semibold">
              Kelola Semua Acara →
            </button>
          </div>

          <div className="space-y-3">
            {events.map(evt => {
              const pct = Math.round((evt.registered / evt.capacity) * 100);
              return (
                <div key={evt.id} className="p-3.5 border border-slate-100 rounded-lg hover:border-slate-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{evt.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">{evt.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3">
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
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Aksi Cepat Operasional
            </h3>
            
            <div className="mt-4 space-y-2.5">
              <button onClick={() => setActiveTab('checkin')} className="w-full text-left p-3 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <QrCode size={20} className="text-teal-700" />
                  <div>
                    <div className="font-bold text-xs">Buka Scanner Kamera QR</div>
                    <div className="text-[11px] text-teal-700">Check-in peserta di pintu masuk</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-teal-700" />
              </button>

              <button onClick={() => setActiveTab('events')} className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <Plus size={20} className="text-slate-600" />
                  <div>
                    <div className="font-bold text-xs">Buat Acara Baru</div>
                    <div className="text-[11px] text-slate-500">Konfigurasi form pendaftaran</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>

              <button onClick={() => setActiveTab('contacts')} className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <Upload size={20} className="text-slate-600" />
                  <div>
                    <div className="font-bold text-xs">Import Database Jemaat</div>
                    <div className="text-[11px] text-slate-500">Upload CSV / Excel data jemaat</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200 flex items-center gap-2">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <span>Sistem Tiket GII Holis mematuhi UU Pelindungan Data Pribadi (PDP) No. 27/2022.</span>
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

// MODULE 2: EVENT MANAGEMENT
function EventsModule({ events, setEvents, showToast }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '', category: 'Ibadah Minggu', date: '', time: '', venue: 'Main Sanctuary GII Holis', capacity: 200, allowFamily: true, description: ''
  });

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const created = {
      ...newEvent,
      id: `EVT-${Date.now()}`,
      registered: 0,
      checkedIn: 0,
      status: 'Aktif',
      banner: 'https://images.unsplash.com/photo-1510519138161-584459ef1967?auto=format&fit=crop&q=80&w=1000',
      customFields: []
    };
    setEvents([created, ...events]);
    setShowCreateModal(false);
    showToast('Acara berhasil dibuat dan dipublikasikan!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Daftar Acara & Kegiatan GII Holis</h3>
          <p className="text-xs text-slate-500">Kelola formulir pendaftaran dan kapasitas tempat duduk</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow">
          <Plus size={16} /> Buat Acara Baru
        </button>
      </div>

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

            <div className="p-5 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{evt.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{evt.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>📅 <strong>Tanggal:</strong> {evt.date}</div>
                <div>⏰ <strong>Waktu:</strong> {evt.time}</div>
                <div className="col-span-2">📍 <strong>Lokasi:</strong> {evt.venue}</div>
                <div className="col-span-2">👨‍👩‍👧‍👦 <strong>Tipe Pendaftaran:</strong> {evt.allowFamily ? 'Individu & Keluarga' : 'Hanya Individu'}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs">
                  <span className="text-slate-500">Pendaftar: </span>
                  <strong className="text-teal-700 font-bold">{evt.registered}</strong> / {evt.capacity} Porsi
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast(`URL Publik disalin: https://gii-holis-tickets.web.id/register/${evt.id}`)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200" title="Salin Link Pendaftaran Publik">
                    <Copy size={14} /> Link Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Acara Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nama Acara *</label>
                <input required type="text" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} placeholder="Contoh: Kebaktian Paskah 2027" className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-1 focus:ring-teal-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <input type="number" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: parseInt(e.target.value) || 100})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Tanggal Acara</label>
                  <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Jam / Waktu</label>
                  <input type="text" placeholder="09:00 WIB" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Tempat / Ruangan</label>
                <input type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="familyOpt" checked={newEvent.allowFamily} onChange={e => setNewEvent({...newEvent, allowFamily: e.target.checked})} />
                <label htmlFor="familyOpt" className="font-semibold text-slate-700">Izinkan Pendaftaran Keluarga / Rombongan (Multi-Tiket)</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700">Simpan Acara</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// MODULE 3: REGISTRATIONS
function RegistrationsModule({ registrations, setRegistrations, events, showToast }) {
  const [showRegisterSim, setShowRegisterSim] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  
  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', type: 'Individu',
    familyMembers: [{ name: '', category: 'Dewasa' }]
  });

  const activeEvent = events.find(e => e.id === selectedEventId);

  const handleAddFamilyMember = () => {
    setRegForm({
      ...regForm,
      familyMembers: [...regForm.familyMembers, { name: '', category: 'Dewasa' }]
    });
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    const regId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let membersList = [];
    if (regForm.type === 'Individu') {
      membersList.push({
        ticketId: `TKT-${regId.split('-')[1]}-1`,
        name: regForm.name,
        category: 'Dewasa',
        qrCode: `QR-GII-${regId.split('-')[1]}-1`,
        checkedIn: false,
        checkInTime: null
      });
    } else {
      membersList.push({
        ticketId: `TKT-${regId.split('-')[1]}-1`,
        name: regForm.name,
        category: 'Kepala Keluarga',
        qrCode: `QR-GII-${regId.split('-')[1]}-1`,
        checkedIn: false,
        checkInTime: null
      });
      regForm.familyMembers.forEach((fm, idx) => {
        if (fm.name.trim()) {
          membersList.push({
            ticketId: `TKT-${regId.split('-')[1]}-${idx + 2}`,
            name: fm.name,
            category: fm.category,
            qrCode: `QR-GII-${regId.split('-')[1]}-${idx + 2}`,
            checkedIn: false,
            checkInTime: null
          });
        }
      });
    }

    const newRegRecord = {
      id: regId,
      eventId: selectedEventId,
      eventName: activeEvent?.name || 'Acara GII Holis',
      primaryContact: regForm.name,
      email: regForm.email,
      phone: regForm.phone,
      type: regForm.type,
      membersCount: membersList.length,
      registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      members: membersList
    };

    setRegistrations([newRegRecord, ...registrations]);
    setShowRegisterSim(false);
    showToast(`Pendaftaran Berhasil! ID Registrasi: ${regId}. E-Tiket QR telah dibuat.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Pendaftaran & Tiket Terbit</h3>
          <p className="text-xs text-slate-500">Daftar pendaftar serta generator tiket QR per porsi keluarga</p>
        </div>
        <button onClick={() => setShowRegisterSim(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow">
          <UserPlus size={16} /> Simulasi Form Pendaftaran Jemaat
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">Total {registrations.length} Transaksi Pendaftaran</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">ID Reg</th>
                <th className="p-3">Acara</th>
                <th className="p-3">Pendaftar Utama</th>
                <th className="p-3">Kontak / Email</th>
                <th className="p-3">Tipe</th>
                <th className="p-3 text-center">Anggota / Tiket</th>
                <th className="p-3">Status QR Check-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map(reg => (
                <tr key={reg.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-teal-700">{reg.id}</td>
                  <td className="p-3 font-medium text-slate-800">{reg.eventName}</td>
                  <td className="p-3 font-semibold text-slate-900">{reg.primaryContact}</td>
                  <td className="p-3 text-slate-500">
                    <div>{reg.phone}</div>
                    <div className="text-[10px] text-slate-400">{reg.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reg.type === 'Keluarga' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {reg.type}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold">{reg.membersCount} Orang</td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {reg.members.map(m => (
                        <div key={m.ticketId} className="flex items-center gap-2 text-[11px]">
                          <span className="font-mono text-slate-400">{m.ticketId}:</span>
                          <span className="font-medium text-slate-700">{m.name}</span>
                          {m.checkedIn ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-700 font-bold">✓ Checked</span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-700">Belum</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegisterSim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Formulir Pendaftaran Jemaat (Public Preview)</h3>
                <p className="text-[11px] text-teal-200">GII Holis Event Ticketing Engine</p>
              </div>
              <button onClick={() => setShowRegisterSim(false)} className="text-teal-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Pilih Acara *</label>
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full p-2.5 border rounded-lg border-slate-300 font-medium text-slate-800">
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.date})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Nama Lengkap (Pendaftar Utama) *</label>
                  <input required type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="Contoh: Yohanes Wijaya" className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Nomor WhatsApp / HP *</label>
                  <input required type="text" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="08123456789" className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Email (Untuk Pengiriman Tiket QR)</label>
                <input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="nama@gmail.com" className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>

              {activeEvent?.allowFamily && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Jenis Pendaftaran</label>
                  <div className="flex gap-4 p-2 bg-slate-50 border rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="regType" checked={regForm.type === 'Individu'} onChange={() => setRegForm({...regForm, type: 'Individu'})} />
                      <span>Individu (1 Orang)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="regType" checked={regForm.type === 'Keluarga'} onChange={() => setRegForm({...regForm, type: 'Keluarga'})} />
                      <span className="font-bold text-teal-800">Keluarga / Rombongan (Multi Tiket)</span>
                    </label>
                  </div>
                </div>
              )}

              {regForm.type === 'Keluarga' && (
                <div className="space-y-3 p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-900">Anggota Keluarga Tambahan</span>
                    <button type="button" onClick={handleAddFamilyMember} className="text-xs bg-purple-600 text-white font-semibold px-2.5 py-1 rounded hover:bg-purple-700">
                      + Tambah Anggota
                    </button>
                  </div>

                  {regForm.familyMembers.map((fm, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="text" placeholder={`Nama Anggota ${idx + 1}`} value={fm.name} onChange={e => {
                        const updated = [...regForm.familyMembers];
                        updated[idx].name = e.target.value;
                        setRegForm({...regForm, familyMembers: updated});
                      }} className="flex-1 p-2 border rounded border-slate-300" />
                      <select value={fm.category} onChange={e => {
                        const updated = [...regForm.familyMembers];
                        updated[idx].category = e.target.value;
                        setRegForm({...regForm, familyMembers: updated});
                      }} className="p-2 border rounded border-slate-300">
                        <option value="Dewasa">Dewasa</option>
                        <option value="Anak (Sekolah Minggu)">Anak</option>
                        <option value="Lansia">Lansia</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                🔒 Dengan mendaftar, Anda menyetujui pemrosesan data untuk kebutuhan verifikasi kehadiran ibadah GII Holis sesuai UU PDP No. 27/2022.
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowRegisterSim(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow">Konfirmasi & Terbitkan Tiket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// MODULE 4: CHECK-IN SCANNER
function CheckInModule({ registrations, handleCheckInMember, scannerSearchQuery, setScannerSearchQuery }) {
  const allTickets = registrations.flatMap(r => 
    r.members.map(m => ({
      ...m,
      regId: r.id,
      eventName: r.eventName,
      primaryContact: r.primaryContact,
      phone: r.phone
    }))
  );

  const filteredTickets = allTickets.filter(t => 
    t.name.toLowerCase().includes(scannerSearchQuery.toLowerCase()) ||
    t.ticketId.toLowerCase().includes(scannerSearchQuery.toLowerCase()) ||
    t.qrCode.toLowerCase().includes(scannerSearchQuery.toLowerCase()) ||
    t.phone.includes(scannerSearchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode size={20} className="text-teal-600" /> Scanner QR Tiket Pintu Masuk
            </h3>
            <p className="text-xs text-slate-500">Ketik Kode QR, ID Tiket, atau Nama Jemaat untuk verifikasi kehadiran</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text"
              value={scannerSearchQuery}
              onChange={e => setScannerSearchQuery(e.target.value)}
              placeholder="Scan QR / Cari Nama / ID Tiket..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600/30 flex items-center justify-center text-teal-400 animate-pulse">
              <Camera size={20} />
            </div>
            <div>
              <div className="font-bold text-xs">Kamera Scanner Aktif</div>
              <div className="text-[11px] text-slate-400">Arahkan QR Code Tiket Jemaat ke depan kamera laptop/smartphone</div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (filteredTickets.length > 0) {
                const target = filteredTickets[0];
                handleCheckInMember(target.regId, target.ticketId);
              }
            }}
            className="w-full md:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 font-bold text-xs rounded-lg shadow transition"
          >
            ⚡ Simulasikan Scan QR Pertama
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
          <span>Daftar Tiket Terdaftar ({filteredTickets.length})</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTickets.map(t => (
            <div key={t.ticketId} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-700 text-xs">{t.ticketId}</span>
                  <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">{t.category}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>📌 {t.eventName}</span>
                  <span>👤 Pendaftar: {t.primaryContact} ({t.phone})</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                {t.checkedIn ? (
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle size={14} /> SUDAH CHECK-IN
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.checkInTime}</div>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCheckInMember(t.regId, t.ticketId)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                  >
                    <Check size={14} /> Check-In Sekarang
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MODULE 5: CRM CONTACTS
function ContactsModule({ contacts, setContacts, showToast }) {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Database CRM Jemaat Terpusat</h3>
          <p className="text-xs text-slate-500">Direktori jemaat GII Holis yang digunakan kembali di semua acara</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => showToast('Simulasi Import CSV Data Jemaat Berhasil! (4 Kontak Ditambahkan)')} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5">
            <Upload size={14} /> Import CSV / Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari Jemaat via Nama, Email, Telepon..." 
            className="w-72 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
          />
          <span className="text-xs font-semibold text-slate-500">Total: {contacts.length} Jemaat</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
            <tr>
              <th className="p-3">ID Jemaat</th>
              <th className="p-3">Nama Lengkap</th>
              <th className="p-3">Kontak Email / Phone</th>
              <th className="p-3">Tgl Lahir</th>
              <th className="p-3">Rayon / Wilayah</th>
              <th className="p-3 text-center">Total Ibadah Diikuti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-500">{c.id}</td>
                <td className="p-3 font-bold text-slate-900">{c.name}</td>
                <td className="p-3">
                  <div>{c.phone}</div>
                  <div className="text-[10px] text-slate-400">{c.email}</div>
                </td>
                <td className="p-3">{c.dob}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{c.Rayon}</span></td>
                <td className="p-3 text-center font-bold text-teal-700">{c.totalEvents} Event</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// MODULE 6: DIGITAL INVITATIONS
function DigitalInvitationsModule({ events, showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Pembuat Undangan Digital</h3>
        <p className="text-xs text-slate-500">Kirim undangan gambar/kustom dengan nama personal jemaat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InvitationTemplateCard title="Undangan Natal Agung GII Holis" bg="bg-gradient-to-br from-red-900 to-amber-900" tag="Natal" showToast={showToast} />
        <InvitationTemplateCard title="Undangan Ibadah Paskah 2027" bg="bg-gradient-to-br from-purple-900 to-slate-900" tag="Paskah" showToast={showToast} />
        <InvitationTemplateCard title="Undangan Youth Gathering Lembang" bg="bg-gradient-to-br from-teal-900 to-emerald-900" tag="Youth" showToast={showToast} />
      </div>
    </div>
  );
}

function InvitationTemplateCard({ title, bg, tag, showToast }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div className={`h-40 ${bg} p-4 text-white flex flex-col justify-between relative`}>
        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold w-fit">{tag}</span>
        <div>
          <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Desain Undangan</div>
          <h4 className="font-bold text-sm leading-snug">{title}</h4>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-slate-500">Mendukung variabel personalisasi: <code className="text-teal-700 bg-teal-50 px-1 font-mono">{`{{nama}}`}</code> dan <code className="text-teal-700 bg-teal-50 px-1 font-mono">{`{{acara}}`}</code>.</p>
        <button onClick={() => showToast('Undangan Digital Terkirim ke 50 Jemaat Terpilih!')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-2">
          <Send size={14} /> Kirim Undangan via Email
        </button>
      </div>
    </div>
  );
}

// MODULE 7: DIGITAL GIFT CARDS
function GiftCardsModule({ showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Digital Gift Cards & Kartu Apresiasi</h3>
        <p className="text-xs text-slate-500">Kirim kartu ucapan terima kasih pelayan & ucapan khusus jemaat</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 space-y-1">
          <div className="font-bold">💡 Informasi Digital Gift Card:</div>
          <div>Kartu hadiah bersifat ucapan digital & sertifikat apresiasi non-moneter untuk pelayanan jemaat.</div>
        </div>

        <button onClick={() => showToast('Kampanye Kartu Apresiasi Berhasil Diterbitkan!')} className="bg-teal-600 text-white font-bold text-xs px-4 py-2 rounded-lg">
          + Buat Kampanye Kartu Ucapan Baru
        </button>
      </div>
    </div>
  );
}

// MODULE 8: ENGAGEMENT CENTER
function EngagementModule({ contacts, showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Engagement Center & Otomasi Ulang Tahun</h3>
        <p className="text-xs text-slate-500">Deteksi harian jemaat yang berulang tahun & pengiriman kartu ucapan otomatis</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Otomasi Kartu Ucapan Ulang Tahun (Daily Cron)</h4>
            <p className="text-[11px] text-slate-500">Sistem akan otomatis mendeteksi jemaat yang ulang tahun jam 07:00 WIB</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Sistem Aktif</span>
        </div>

        <button onClick={() => showToast('Trigger Manual: 2 Ucapan Ulang Tahun Berhasil Terkirim Hari Ini!')} className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg">
          ⚡ Jalankan Pengecekan Ulang Tahun Sekarang
        </button>
      </div>
    </div>
  );
}

// MODULE 9: EMAIL CAMPAIGNS
function EmailModule({ showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Otomasi Email Transaksional (Resend API / SMTP)</h3>
        <p className="text-xs text-slate-500">Pengiriman e-Tiket, Pengingat Ibadah H-1, H-3, H-7</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 border rounded">
            <span className="text-slate-500 block">Domain Email Terhubung:</span>
            <strong className="text-slate-800">gii-holis-tickets.web.id</strong>
          </div>
          <div className="p-3 border rounded">
            <span className="text-slate-500 block">Email Pengirim Resmi:</span>
            <strong className="text-slate-800">tiket@gii-holis-tickets.web.id</strong>
          </div>
        </div>

        <button onClick={() => showToast('Email Uji Coba Berhasil Terkirim!')} className="bg-teal-600 text-white font-bold text-xs px-4 py-2 rounded-lg">
          ✉️ Kirim Email Uji Coba (Test Email)
        </button>
      </div>
    </div>
  );
}

// MODULE 10: WHATSAPP INTEGRATION
function WhatsAppModule({ showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Integrasi Meta WhatsApp Cloud API</h3>
        <p className="text-xs text-slate-500">Status konfigurasi pengiriman notifikasi via WhatsApp resmi</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-3 text-amber-900">
          <AlertTriangle size={24} className="text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Status Integrasi: PENDING / DITUNDA (Opsional)</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Integrasi WhatsApp Business API saat ini ditunda sesuai pengaturan awal. Aplikasi tetap berjalan 100% menggunakan notifikasi Email & Tiket QR Web.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// MODULE 11: REPORTS & ANALYTICS
function ReportsModule({ events, registrations, contacts }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Laporan Kehadiran & Analytics</h3>
        <p className="text-xs text-slate-500">Ringkasan data keikutsertaan ibadah GII Holis</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="font-bold text-slate-800 text-xs">Eksportir Ringkasan Data CSV</span>
          <button className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5">
            <Download size={14} /> Download Laporan Excel (.xlsx)
          </button>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <div>• Total Registrasi Aktif: <strong>{registrations.length} Transaksi</strong></div>
          <div>• Total Jemaat CRM: <strong>{contacts.length} Jiwa</strong></div>
        </div>
      </div>
    </div>
  );
}

// MODULE 12: USER ROLES & PRIVACY
function RolesModule({ currentRole, setCurrentRole }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Manajemen Peran (RBAC) & Privasi Data</h3>
        <p className="text-xs text-slate-500">Kepatuhan UU Pelindungan Data Pribadi (UU PDP No. 27/2022)</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 text-xs border-b pb-2">Hirarki Peran Pengguna</h4>
        
        <div className="space-y-2 text-xs">
          <div className="p-3 border rounded bg-slate-50">
            <strong className="text-slate-900">1. Super Admin:</strong> Akses penuh ke seluruh fitur, database, dan pengaturan server.
          </div>
          <div className="p-3 border rounded bg-slate-50">
            <strong className="text-slate-900">2. Event Admin:</strong> Membuat dan mengelola pendaftaran acara & tiket.
          </div>
          <div className="p-3 border rounded bg-slate-50">
            <strong className="text-slate-900">3. Staff Check-In:</strong> Hanya memiliki akses ke Scanner QR & pencarian kehadiran.
          </div>
        </div>
      </div>
    </div>
  );
}

// MODULE 13: SYSTEM SETTINGS & BRANDING
function SettingsModule({ branding, setBranding, showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Pengaturan Organisasi & Branding</h3>
        <p className="text-xs text-slate-500">Sesuaikan nama gereja, logo, dan kredensial email</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1 text-slate-700">Nama Organisasi / Gereja</label>
          <input type="text" value={branding.orgName} onChange={e => setBranding({...branding, orgName: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-slate-700">Nama Aplikasi Web</label>
          <input type="text" value={branding.appName} onChange={e => setBranding({...branding, appName: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 font-bold" />
        </div>

        <button onClick={() => showToast('Pengaturan Branding Berhasil Diperbarui!')} className="bg-teal-600 text-white font-bold px-4 py-2 rounded-lg">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
