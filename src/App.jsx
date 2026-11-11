import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, QrCode, Mail, MessageSquare, 
  Gift, Heart, Send, BarChart3, Shield, Settings, Plus, Search, 
  Download, Upload, CheckCircle, Copy, UserPlus, 
  FileText, Sparkles, Camera, ArrowRight, Lock, Check,
  Share2, AlertTriangle, LogOut, Menu, X, RefreshCw, Ticket, ChevronRight,
  Edit, Trash2, RotateCcw, Sliders, ToggleLeft, ToggleRight, ListPlus
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// HELPER: KIRIM EMAIL VIA VERCEL SERVERLESS FUNCTION
// ==========================================
const sendConfirmationEmail = async ({ toEmail, name, tickets, eventName, eventDate, eventVenue }) => {
  if (!toEmail) return;

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, name, tickets, eventName, eventDate, eventVenue })
    });
    const data = await res.json();
    console.log('Response Email API:', data);
  } catch (err) {
    console.error('Gagal kirim email:', err);
  }
};

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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

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
          <p className="text-slate-400 text-xs md:text-sm mt-1">Portal Super Admin &amp; Pengelola</p>
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
// COMPONENT: PUBLIC FORM REGISTRATION (SUPPORT OPTIONAL EMAIL & OPTIONAL QR)
// ==========================================
function PublicRegisterPage({ eventId, onBackToAdmin }) {
  const [eventData, setEventData] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customAnswers, setCustomAnswers] = useState({});
  const [optionCounts, setOptionCounts] = useState({});
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successRegistration, setSuccessRegistration] = useState(null);

  const [regType, setRegType] = useState('INDIVIDUAL');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    notes: ''
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchEventAndData = async () => {
      setLoadingEvent(true);
      
      const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (event) {
        setEventData(event);
        if (!event.allow_family) setRegType('INDIVIDUAL');
      }

      const { data: fields } = await supabase
        .from('event_form_fields')
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true });

      if (fields) setCustomFields(fields);

      const { data: answersData } = await supabase
        .from('registration_answers')
        .select('answer_value, registration_id, registrations!inner(event_id, registration_members(id))')
        .eq('registrations.event_id', eventId);

      const counts = {};
      if (answersData) {
        answersData.forEach(ans => {
          const ticketCount = ans.registrations?.registration_members?.length || 1;
          const val = ans.answer_value;
          counts[val] = (counts[val] || 0) + ticketCount;
        });
      }
      setOptionCounts(counts);

      setLoadingEvent(false);
    };

    if (eventId) fetchEventAndData();
  }, [eventId]);

  const handlePhoneChange = (e) => {
    let rawInput = e.target.value;
    let digitsOnly = rawInput.replace(/\D/g, '');
    if (digitsOnly.startsWith('62')) digitsOnly = digitsOnly.substring(2);
    else if (digitsOnly.startsWith('0')) digitsOnly = digitsOnly.substring(1);

    setFormData(prev => ({ ...prev, whatsapp: digitsOnly }));

    if (digitsOnly.length > 0 && digitsOnly.length < 8) {
      setPhoneError('Nomor WhatsApp terlalu pendek (min 9-13 digit).');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) {
      setEmailError('Format email tidak valid (contoh: nama@domain.com).');
    } else {
      setEmailError('');
    }
  };

  const handleCustomAnswerChange = (fieldId, value) => {
    setCustomAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleAddMember = () => {
    setMembers([...members, { name: '' }]);
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailEnabled = eventData?.require_email ?? true;

    if (phoneError || (isEmailEnabled && emailError)) {
      alert('Mohon perbaiki data kontak yang belum sesuai.');
      return;
    }

    if (!formData.whatsapp || formData.whatsapp.length < 8) {
      setPhoneError('Mohon masukkan nomor WhatsApp yang valid.');
      return;
    }

    const totalRequestedTickets = regType === 'GROUP' ? members.length + 1 : 1;

    // VALIDASI KUOTA UTAMA ACARA
    if (eventData.capacity && eventData.capacity > 0) {
      if ((eventData.registered + totalRequestedTickets) > eventData.capacity) {
        alert(`⚠️ Pendaftaran Ditolak:\n\nKuota total acara tersisa ${eventData.capacity - eventData.registered} porsi, tidak mencukupi untuk ${totalRequestedTickets} orang.`);
        return;
      }
    }

    // VALIDASI BATASAN KUOTA PER OPSI
    for (const field of customFields) {
      if (field.is_required && !customAnswers[field.id]) {
        alert(`Mohon isi pertanyaan wajib: "${field.label}"`);
        return;
      }

      if (['radio', 'dropdown'].includes(field.field_type) && customAnswers[field.id]) {
        const chosenVal = customAnswers[field.id];
        const fieldOptions = field.options || [];
        const optionObj = fieldOptions.find(o => (typeof o === 'object' ? o.label === chosenVal : o === chosenVal));

        if (optionObj && typeof optionObj === 'object' && optionObj.quota) {
          const currentCount = optionCounts[chosenVal] || 0;
          const maxQuota = parseInt(optionObj.quota);

          if (maxQuota > 0 && (currentCount + totalRequestedTickets) > maxQuota) {
            alert(`⚠️ Kuota Penuh:\n\nPilihan "${chosenVal}" tersisa ${maxQuota - currentCount} porsi, tidak mencukupi untuk ${totalRequestedTickets} orang.\n\nSilakan pilih opsi yang lain.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    const fullFormattedPhone = `+62${formData.whatsapp}`;
    const cleanInputName = formData.name.trim();

    // VALIDASI DUPLIKAT
    const { data: duplicateCheck } = await supabase
      .from('registrations')
      .select('id, name, whatsapp')
      .eq('event_id', eventId)
      .eq('whatsapp', fullFormattedPhone)
      .ilike('name', cleanInputName)
      .maybeSingle();

    if (duplicateCheck) {
      alert(`⚠️ Pendaftaran Ditolak:\n\nNama "${cleanInputName}" dengan Nomor WhatsApp (${fullFormattedPhone}) sudah pernah terdaftar pada acara ini.`);
      setSubmitting(false);
      return;
    }

    const regId = `REG-${Date.now()}`;

    const { error: regError } = await supabase.from('registrations').insert([{
      id: regId,
      event_id: eventId,
      name: cleanInputName,
      whatsapp: fullFormattedPhone,
      email: isEmailEnabled ? formData.email : '',
      notes: formData.notes || ''
    }]);

    if (regError) {
      alert(`Gagal mendaftar: ${regError.message}`);
      setSubmitting(false);
      return;
    }

    // SIMPAN JAWABAN CUSTOM FIELDS
    const answerPayloads = Object.keys(customAnswers).map(fieldId => ({
      registration_id: regId,
      field_id: fieldId,
      answer_value: String(customAnswers[fieldId])
    }));

    if (answerPayloads.length > 0) {
      await supabase.from('registration_answers').insert(answerPayloads);
    }

    let memberPayloads = [
      {
        id: `MEM-${Date.now()}-0`,
        registration_id: regId,
        ticket_id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        name: cleanInputName,
        category: 'Umum'
      }
    ];

    if (regType === 'GROUP') {
      const extraMembers = members
        .filter(m => m.name.trim() !== '')
        .map((m, idx) => ({
          id: `MEM-${Date.now()}-${idx + 1}`,
          registration_id: regId,
          ticket_id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
          name: m.name.trim(),
          category: 'Umum'
        }));

      memberPayloads = [...memberPayloads, ...extraMembers];
    }

    const { error: memError } = await supabase.from('registration_members').insert(memberPayloads);

    if (memError) {
      alert(`Gagal menyimpan data pendaftaran: ${memError.message}`);
      setSubmitting(false);
      return;
    }

    const newRegisteredCount = (eventData.registered || 0) + memberPayloads.length;
    await supabase.from('events').update({ registered: newRegisteredCount }).eq('id', eventId);

    // KIRIM EMAIL BILA DIAKTIFKAN
    if (isEmailEnabled && formData.email) {
      sendConfirmationEmail({
        toEmail: formData.email,
        name: cleanInputName,
        tickets: memberPayloads,
        eventName: eventData.name,
        eventDate: eventData.date,
        eventVenue: eventData.venue
      });
    }

    setSubmitting(false);
    setSuccessRegistration({
      regId,
      event: eventData,
      mainContact: { ...formData, name: cleanInputName, whatsapp: fullFormattedPhone },
      tickets: memberPayloads
    });
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Memuat Formulir Pendaftaran Event...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-2" />
        <h3 className="font-bold text-lg">Acara Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">Link pendaftaran mungkin sudah kadaluarsa atau tidak valid.</p>
        <button onClick={onBackToAdmin} className="mt-4 px-4 py-2 bg-teal-600 text-xs font-bold rounded-lg text-white">Kembali ke Dashboard</button>
      </div>
    );
  }

  const isMainEventFull = eventData.capacity && eventData.capacity > 0 && eventData.registered >= eventData.capacity;
  const isQrEnabled = eventData.enable_qr ?? true;
  const isEmailEnabled = eventData.require_email ?? true;

  if (successRegistration) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
              <CheckCircle size={28} />
            </div>
            <h2 className="font-bold text-lg text-emerald-400">Pendaftaran Berhasil!</h2>
            <p className="text-xs text-slate-400">Terima kasih, pendaftaran Anda untuk kegiatan ini telah tercatat:</p>
            <h3 className="font-bold text-sm text-white bg-slate-800 p-2 rounded-lg border border-slate-700">{successRegistration.event.name}</h3>
            
            {isEmailEnabled && formData.email && (
              <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-[11px] text-teal-300 font-medium">
                📧 Konfirmasi pendaftaran telah dikirimkan ke <strong>{formData.email}</strong>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-xs text-slate-400 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>👤 <strong>Nama Utama:</strong> {successRegistration.mainContact.name} ({successRegistration.mainContact.whatsapp})</div>
              <div>📅 <strong>Tanggal:</strong> {successRegistration.event.date}</div>
              <div>📍 <strong>Lokasi:</strong> {successRegistration.event.venue}</div>
            </div>

            {isQrEnabled ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider text-center">Daftar E-Tiket &amp; Kode QR</h4>
                {successRegistration.tickets.map((tkt, idx) => (
                  <div key={tkt.id} className="bg-white text-slate-900 p-4 rounded-xl shadow border border-slate-200 flex flex-col items-center text-center space-y-2">
                    <div className="w-full flex justify-between items-center text-[10px] text-slate-500 font-bold border-b pb-1">
                      <span>TIKET #{idx + 1}</span>
                      <span className="text-teal-700">Umum</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{tkt.name}</div>
                    
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${tkt.ticket_id}`} 
                      alt="QR Code Tiket" 
                      className="w-36 h-36 border p-1 rounded bg-white shadow-sm"
                    />
                    
                    <div className="font-mono text-xs font-bold text-teal-700 tracking-wider bg-slate-100 px-3 py-1 rounded">
                      {tkt.ticket_id}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-2">
                <div className="text-emerald-400 text-xs font-bold">✓ Data Pendaftaran Tersimpan</div>
                <p className="text-[11px] text-slate-400">
                  Acara ini tidak memerlukan E-Tiket QR Code. Silakan tunjukkan nama/nomor WhatsApp Anda saat hadir di lokasi.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <button onClick={onBackToAdmin} className="text-xs text-teal-400 hover:underline block mx-auto">
              Kembali ke Dashboard Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl text-white space-y-6">
        
        <div className="border-b border-slate-700 pb-4 space-y-3">
          <span className="bg-teal-500/20 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-teal-500/30">
            Form Pendaftaran Jemaat
          </span>
          <h2 className="font-bold text-lg md:text-xl text-white mt-1">{eventData.name}</h2>

          {eventData.description && (
            <div className="text-xs text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line font-normal space-y-2">
              {eventData.description}
            </div>
          )}

          <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
            <span>📅 {eventData.date}</span>
            <span>📍 {eventData.venue}</span>
          </p>
        </div>

        {isMainEventFull ? (
          <div className="bg-rose-500/10 border border-rose-500/50 p-6 rounded-xl text-center space-y-2">
            <AlertTriangle size={36} className="text-rose-400 mx-auto" />
            <h3 className="font-bold text-base text-rose-400">Pendaftaran Ditutup (Sold Out)</h3>
            <p className="text-xs text-slate-300">Kuota pendaftaran untuk acara ini sudah memenuhi batas maksimum ({eventData.capacity} porsi).</p>
          </div>
        ) : (
          <>
            {eventData.allow_family && (
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setRegType('INDIVIDUAL');
                    setMembers([]);
                  }}
                  className={`py-2.5 rounded-lg transition-all ${regType === 'INDIVIDUAL' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  👤 Pendaftaran Individu (1 Orang)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegType('GROUP');
                    if (members.length === 0) setMembers([{ name: '' }]);
                  }}
                  className={`py-2.5 rounded-lg transition-all ${regType === 'GROUP' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  👨‍👩‍👧‍👦 Pendaftaran Keluarga / Rombongan
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              <div className="space-y-3">
                <h4 className="font-bold text-teal-400 text-xs">
                  {regType === 'INDIVIDUAL' ? 'Informasi Data Peserta' : '1. Informasi Kontak Utama'}
                </h4>
                
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Nama Lengkap *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Joshua Merian Limas" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-teal-500" />
                </div>

                <div className={`grid grid-cols-1 ${isEmailEnabled ? 'sm:grid-cols-2' : ''} gap-3`}>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">No. WhatsApp *</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-bold text-teal-400 text-xs select-none">+62</span>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        value={formData.whatsapp}
                        onChange={handlePhoneChange}
                        placeholder="8123456789"
                        className="w-full pl-12 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-teal-500"
                      />
                    </div>
                    {phoneError && <p className="text-rose-400 text-[10px] mt-1 font-medium">{phoneError}</p>}
                  </div>

                  {isEmailEnabled && (
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Email (Untuk Terima Tiket Otomatis) *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        placeholder="nama@email.com"
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-teal-500"
                      />
                      {emailError && <p className="text-rose-400 text-[10px] mt-1 font-medium">{emailError}</p>}
                    </div>
                  )}
                </div>
              </div>

              {customFields.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-700">
                  <h4 className="font-bold text-teal-400 text-xs uppercase tracking-wide">
                    Informasi Pilihan Acara
                  </h4>

                  {customFields.map(field => (
                    <div key={field.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-700 space-y-2">
                      <label className="block text-slate-200 font-semibold text-xs">
                        {field.label} {field.is_required && <span className="text-rose-400">*</span>}
                      </label>

                      {field.placeholder && (
                        <p className="text-[11px] text-slate-400 leading-normal">{field.placeholder}</p>
                      )}

                      {field.field_type === 'text' && (
                        <input 
                          type="text"
                          required={field.is_required}
                          value={customAnswers[field.id] || ''}
                          onChange={e => handleCustomAnswerChange(field.id, e.target.value)}
                          placeholder="Ketik jawaban Anda..."
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-teal-500"
                        />
                      )}

                      {field.field_type === 'date' && (
                        <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900 focus-within:border-teal-500">
                          <input 
                            type="date"
                            required={field.is_required}
                            value={customAnswers[field.id] || ''}
                            onChange={e => handleCustomAnswerChange(field.id, e.target.value)}
                            className="w-full p-2.5 bg-transparent text-white focus:outline-none text-xs appearance-none block"
                          />
                        </div>
                      )}

                      {field.field_type === 'textarea' && (
                        <textarea 
                          rows={3}
                          required={field.is_required}
                          value={customAnswers[field.id] || ''}
                          onChange={e => handleCustomAnswerChange(field.id, e.target.value)}
                          placeholder="Ketik penjelasan..."
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-teal-500"
                        ></textarea>
                      )}

                      {field.field_type === 'radio' && (
                        <div className="space-y-2.5 pt-1">
                          {(field.options || []).map((optItem, oIdx) => {
                            const labelStr = typeof optItem === 'object' ? optItem.label : optItem;
                            const maxQ = typeof optItem === 'object' ? parseInt(optItem.quota || 0) : 0;
                            const countNow = optionCounts[labelStr] || 0;
                            const isOptFull = maxQ > 0 && countNow >= maxQ;

                            return (
                              <label 
                                key={oIdx} 
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                                  isOptFull 
                                    ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed' 
                                    : customAnswers[field.id] === labelStr
                                      ? 'bg-slate-900 border-teal-500 shadow-sm'
                                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                <div className="flex items-center gap-3 pr-2 flex-1">
                                  <input 
                                    type="radio"
                                    disabled={isOptFull}
                                    name={`field_${field.id}`}
                                    value={labelStr}
                                    checked={customAnswers[field.id] === labelStr}
                                    onChange={e => handleCustomAnswerChange(field.id, e.target.value)}
                                    className="w-4 h-4 text-teal-500 focus:ring-teal-500 shrink-0"
                                  />
                                  <span className={`text-xs font-semibold leading-relaxed ${isOptFull ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                    {labelStr}
                                  </span>
                                </div>

                                {maxQ > 0 && (
                                  <div className={`w-24 py-1 px-2 rounded-lg text-center font-mono text-[10px] font-bold shrink-0 ${
                                    isOptFull 
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                      : 'bg-slate-800 text-teal-400 border border-slate-700'
                                  }`}>
                                    {isOptFull ? 'Penuh' : `Kuota : ${maxQ - countNow}`}
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {field.field_type === 'dropdown' && (
                        <select
                          required={field.is_required}
                          value={customAnswers[field.id] || ''}
                          onChange={e => handleCustomAnswerChange(field.id, e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-teal-500"
                        >
                          <option value="">-- Pilih Salah Satu --</option>
                          {(field.options || []).map((optItem, oIdx) => {
                            const labelStr = typeof optItem === 'object' ? optItem.label : optItem;
                            const maxQ = typeof optItem === 'object' ? parseInt(optItem.quota || 0) : 0;
                            const countNow = optionCounts[labelStr] || 0;
                            const isOptFull = maxQ > 0 && countNow >= maxQ;

                            return (
                              <option key={oIdx} value={labelStr} disabled={isOptFull}>
                                {labelStr} {maxQ > 0 ? (isOptFull ? '❌ (Penuh)' : `(Kuota : ${maxQ - countNow})`) : ''}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {regType === 'GROUP' && (
                <div className="space-y-3 pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-teal-400 text-xs">2. Anggota Tambahan yang Diikutkan</h4>
                      <p className="text-[10px] text-slate-400">Pendaftar Utama otomatis terhitung mendapat 1 Tiket.</p>
                    </div>
                    <button type="button" onClick={handleAddMember} className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
                      <Plus size={14} /> Tambah Anggota
                    </button>
                  </div>

                  {members.length === 0 ? (
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-dashed border-slate-700 text-slate-400 text-[11px] text-center">
                      Belum ada anggota tambahan. Klik &quot;+ Tambah Anggota&quot; di atas jika membawa keluarga/teman.
                    </div>
                  ) : (
                    members.map((member, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-teal-400 text-[10px] shrink-0">
                          +{idx + 1}
                        </div>
                        <input required type="text" value={member.name} onChange={e => {
                          const updated = [...members];
                          updated[idx].name = e.target.value;
                          setMembers(updated);
                        }} placeholder={`Nama Anggota Tambahan ${idx + 1}`} className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded text-white text-xs" />

                        <button type="button" onClick={() => handleRemoveMember(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={submitting || !!phoneError || (isEmailEnabled && !!emailError)} className="w-full py-3 bg-teal-600 hover:bg-teal-500 font-bold rounded-lg text-white shadow-lg shadow-teal-600/30 transition disabled:opacity-50">
                  {submitting ? 'Memproses Pendaftaran...' : 'Konfirmasi & Kirim Pendaftaran'}
                </button>
              </div>
            </form>
          </>
        )}
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
  
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [publicEventId, setPublicEventId] = useState(null);
  
  const [branding] = useState({
    orgName: 'Gereja Injili Indonesia Holis (GII Holis)',
    appName: 'Sistem Tiket GII Holis',
  });

  const [currentRole, setCurrentRole] = useState('CHECKIN_STAFF');
  const [toastMessage, setToastMessage] = useState(null);

  const fetchRealEvents = async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
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
        allow_family: e.allow_family ?? true,
        enable_qr: e.enable_qr ?? true,
        require_email: e.require_email ?? true,
        banner: e.banner || 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&q=80&w=1000',
        description: e.description
      }));
      setEvents(mappedEvents);
    }
    setLoadingEvents(false);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/register/')) {
        const id = hash.replace('#/register/', '');
        setPublicEventId(id);
      } else {
        setPublicEventId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

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
      }
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
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
        }
      }
      setCheckingAuth(false);
    });

    fetchRealEvents();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (publicEventId) {
    return <PublicRegisterPage eventId={publicEventId} onBackToAdmin={() => window.location.hash = ''} />;
  }

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
        <div 
          onClick={() => { setActiveTab('dashboard'); if(mobileMenuOpen) setMobileMenuOpen(false); }}
          className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 cursor-pointer hover:bg-slate-900 transition"
          title="Kembali ke Dashboard Overview"
        >
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
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }} 
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
              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jemaat &amp; CRM</div>
              <SidebarItem id="contacts" icon={<Users size={18} />} label="Kontak & CRM Jemaat" active={activeTab} setActive={setActiveTab} statusTag="ONGOING" closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="invitations" icon={<Share2 size={18} />} label="Undangan Digital" active={activeTab} setActive={setActiveTab} statusTag="ONGOING" closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="giftcards" icon={<Gift size={18} />} label="Digital Gift Cards" active={activeTab} setActive={setActiveTab} statusTag="ONGOING" closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="engagement" icon={<Heart size={18} />} label="Engagement Center" active={activeTab} setActive={setActiveTab} statusTag="ONGOING" closeMobile={() => setMobileMenuOpen(false)} />

              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Otomasi &amp; Pesan</div>
              <SidebarItem id="email" icon={<Mail size={18} />} label="Kampanye Email" active={activeTab} setActive={setActiveTab} statusTag="READY" closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="whatsapp" icon={<MessageSquare size={18} />} label="Integrasi WhatsApp" active={activeTab} setActive={setActiveTab} statusTag="PENDING" closeMobile={() => setMobileMenuOpen(false)} />

              <div className="px-3 py-1 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sistem &amp; Pengaturan</div>
              <SidebarItem id="reports" icon={<BarChart3 size={18} />} label="Laporan & Export" active={activeTab} setActive={setActiveTab} statusTag="ONGOING" closeMobile={() => setMobileMenuOpen(false)} />
              <SidebarItem id="roles" icon={<Shield size={18} />} label="Pengguna & Akses" active={activeTab} setActive={setActiveTab} closeMobile={() => setMobileMenuOpen(false)} />
            </>
          )}
        </nav>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs space-y-2">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">Role &amp; Hak Akses Anda:</label>
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
              {activeTab === 'events' && 'Manajemen Acara'}
              {activeTab === 'registrations' && 'Data Pendaftaran Jemaat'}
              {activeTab === 'checkin' && 'Scanner Tiket QR'}
              {activeTab === 'contacts' && 'Kontak & CRM Jemaat'}
              {activeTab === 'invitations' && 'Undangan Digital'}
              {activeTab === 'giftcards' && 'Digital Gift Cards'}
              {activeTab === 'engagement' && 'Engagement Center'}
              {activeTab === 'email' && 'Kampanye Email'}
              {activeTab === 'whatsapp' && 'Integrasi WhatsApp'}
              {activeTab === 'reports' && 'Laporan & Export'}
              {activeTab === 'roles' && 'Pengguna & Akses'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
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
          {activeTab === 'events' && <EventsModule events={events} fetchRealEvents={fetchRealEvents} loadingEvents={loadingEvents} showToast={showToast} setPublicEventId={setPublicEventId} />}
          {activeTab === 'registrations' && <RegistrationsModule events={events} showToast={showToast} />}
          
          {activeTab === 'checkin' && (
            ['SUPER_ADMIN', 'CHECKIN_STAFF'].includes(currentRole) ? (
              <CheckInModule showToast={showToast} />
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 space-y-2">
                <h3 className="font-bold text-sm">⛔ Akses Ditolak</h3>
                <p className="text-xs">Halaman Scanner QR hanya diperuntukkan untuk Staff Check-In &amp; Super Admin.</p>
              </div>
            )
          )}

          {activeTab === 'contacts' && <ContactsModule />}
          {activeTab === 'invitations' && <DigitalInvitationsModule />}
          {activeTab === 'giftcards' && <GiftCardsModule />}
          {activeTab === 'engagement' && <EngagementModule />}
          {activeTab === 'email' && <EmailModule />}
          {activeTab === 'whatsapp' && <WhatsAppModule />}
          {activeTab === 'reports' && <ReportsModule />}
          
          {activeTab === 'roles' && (
            currentRole === 'SUPER_ADMIN' ? (
              <RolesModule currentRole={currentRole} setCurrentRole={setCurrentRole} showToast={showToast} />
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 space-y-2">
                <h3 className="font-bold text-sm">⛔ Akses Ditolak</h3>
                <p className="text-xs">Halaman Pengaturan Peran &amp; Hak Akses hanya dapat diakses oleh Super Admin.</p>
              </div>
            )
          )}
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
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${statusTag === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
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
  const totalRegisteredMembers = registrations.reduce((acc, r) => acc + (r.registration_members ? r.registration_members.length : 0), 0);
  const totalCheckedIn = registrations.reduce((acc, r) => acc + (r.registration_members ? r.registration_members.filter(m => m.checked_in).length : 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Jemaat (CRM)" value={contacts.length} icon={<Users className="text-blue-600" size={22} />} subtext="Terdaftar di database pusat" bg="bg-blue-50" />
        <MetricCard title="Peserta Terdaftar" value={totalRegisteredMembers} icon={<FileText className="text-teal-600" size={22} />} subtext="Dari seluruh event aktif" bg="bg-teal-50" />
        <MetricCard title="Kehadiran (Checked-In)" value={totalCheckedIn} icon={<CheckCircle className="text-emerald-600" size={22} />} subtext={`${totalRegisteredMembers ? Math.round((totalCheckedIn/totalRegisteredMembers)*100) : 0}% Tingkat kehadiran`} bg="bg-emerald-50" />
        <MetricCard title="Acara Aktif" value={events.filter(e => e.status === 'Aktif').length} icon={<Calendar className="text-indigo-600" size={22} />} subtext="Tersimpan di database" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs md:text-sm flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" /> Acara Mendatang &amp; Kuota
            </h3>
            {currentRole !== 'CHECKIN_STAFF' && (
              <button onClick={() => setActiveTab('events')} className="text-xs text-teal-600 hover:underline font-semibold">
                Kelola Semua Acara →
              </button>
            )}
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Belum ada acara tersimpan.
              </div>
            ) : (
              events.map(evt => {
                const isUnlimited = evt.capacity === null || evt.capacity === 0;
                const pct = isUnlimited ? 0 : Math.round((evt.registered / evt.capacity) * 100);
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
                        <span>Terisi: {evt.registered} / {isUnlimited ? '∞ Unlimited' : evt.capacity}</span>
                        {!isUnlimited && <span>{pct}%</span>}
                      </div>
                      {!isUnlimited && (
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                        </div>
                      )}
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

              {currentRole !== 'CHECKIN_STAFF' && (
                <button onClick={() => setActiveTab('events')} className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between transition">
                  <div className="flex items-center gap-3">
                    <Plus size={20} className="text-slate-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Buat Acara Baru</div>
                      <div className="text-[11px] text-slate-500">Tambah kegiatan ibadah atau seminar</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 shrink-0" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200 flex items-center gap-2">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <span>Sistem penyimpanan terenkripsi &amp; aman.</span>
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
// MODULE 2: EVENT MANAGEMENT & FORM BUILDER WITH OPTION QUOTAS
// ==========================================
function EventsModule({ events, fetchRealEvents, loadingEvents, showToast, setPublicEventId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);
  
  const [selectedEventForBuilder, setSelectedEventForBuilder] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isEditUnlimited, setIsEditUnlimited] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    name: '', category: 'Ibadah Minggu', date: '', time: '', venue: 'Main Sanctuary GII Holis', capacity: 200, allow_family: true, enable_qr: true, require_email: true, description: ''
  });

  const [editEventData, setEditEventData] = useState({
    id: '', name: '', category: 'Ibadah Minggu', date: '', time: '', venue: 'Main Sanctuary GII Holis', capacity: 200, allow_family: true, enable_qr: true, require_email: true, description: ''
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
      capacity: isUnlimited ? null : (parseInt(newEvent.capacity) || 100),
      registered: 0,
      checked_in: 0,
      status: 'Aktif',
      allow_family: newEvent.allow_family,
      enable_qr: newEvent.enable_qr,
      require_email: newEvent.require_email,
      description: newEvent.description || 'Kegiatan Ibadah Resmi GII Holis Bandung.'
    };

    const { error } = await supabase.from('events').insert([payload]);

    setSaving(false);

    if (error) {
      showToast(`Gagal menyimpan event: ${error.message}`, 'error');
    } else {
      showToast('Acara berhasil disimpan!');
      setShowCreateModal(false);
      setNewEvent({ name: '', category: 'Ibadah Minggu', date: '', time: '', venue: 'Main Sanctuary GII Holis', capacity: 200, allow_family: true, enable_qr: true, require_email: true, description: '' });
      setIsUnlimited(false);
      fetchRealEvents();
    }
  };

  const handleOpenEdit = (evt) => {
    setEditEventData({
      id: evt.id,
      name: evt.name,
      category: evt.category,
      date: evt.date,
      time: evt.time,
      venue: evt.venue,
      capacity: evt.capacity || 200,
      allow_family: evt.allow_family ?? evt.allowFamily,
      enable_qr: evt.enable_qr ?? evt.enableQr ?? true,
      require_email: evt.require_email ?? evt.requireEmail ?? true,
      description: evt.description || ''
    });
    setIsEditUnlimited(evt.capacity === null || evt.capacity === 0);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: editEventData.name,
      category: editEventData.category,
      date: editEventData.date,
      time: editEventData.time,
      venue: editEventData.venue,
      capacity: isEditUnlimited ? null : (parseInt(editEventData.capacity) || 100),
      allow_family: editEventData.allow_family,
      enable_qr: editEventData.enable_qr,
      require_email: editEventData.require_email,
      description: editEventData.description
    };

    const { error } = await supabase.from('events').update(payload).eq('id', editEventData.id);

    setSaving(false);

    if (error) {
      showToast(`Gagal memperbarui acara: ${error.message}`, 'error');
    } else {
      showToast(`Acara "${editEventData.name}" berhasil diperbarui!`);
      setShowEditModal(false);
      fetchRealEvents();
    }
  };

  const handleResetRegistrants = async (eventId, eventName) => {
    if (!window.confirm(`⚠️ KONFIRMASI RESET PENDAFTAR:\n\nApakah Anda yakin ingin menghapus SELURUH pendaftar & E-Tiket untuk acara "${eventName}"?\n\nAngka kuota pendaftar akan kembali menjadi 0. Acara tidak akan dihapus.`)) {
      return;
    }

    setSaving(true);

    const { error: deleteError } = await supabase
      .from('registrations')
      .delete()
      .eq('event_id', eventId);

    if (deleteError) {
      showToast(`Gagal mereset data pendaftar: ${deleteError.message}`, 'error');
      setSaving(false);
      return;
    }

    const { error: resetError } = await supabase
      .from('events')
      .update({ registered: 0, checked_in: 0 })
      .eq('id', eventId);

    setSaving(false);

    if (resetError) {
      showToast(`Gagal mereset hitungan kuota: ${resetError.message}`, 'error');
    } else {
      showToast(`Seluruh pendaftar "${eventName}" berhasil dihapus & kuota kembali ke 0!`);
      fetchRealEvents();
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`🚨 PERHATIAN PENUH HAPUS ACARA:\n\nApakah Anda yakin ingin menghapus ACARA "${eventName}" secara permanen?\n\nSemua pendaftar, E-Tiket, dan histori acara ini akan HILANG dari database!`)) {
      return;
    }

    setSaving(true);
    await supabase.from('registrations').delete().eq('event_id', eventId);
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    setSaving(false);

    if (error) {
      showToast(`Gagal menghapus acara: ${error.message}`, 'error');
    } else {
      showToast(`Acara "${eventName}" berhasil dihapus permanen!`);
      fetchRealEvents();
    }
  };

  // ==========================================
  // DYNAMIC FORM BUILDER HANDLERS (SUPPORT OPTION QUOTA)
  // ==========================================
  const handleOpenFormBuilder = async (evt) => {
    setSelectedEventForBuilder(evt);
    setLoadingFields(true);
    setShowFormBuilderModal(true);

    const { data, error } = await supabase
      .from('event_form_fields')
      .select('*')
      .eq('event_id', evt.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error("Gagal ambil form fields:", error);
      setFormFields([]);
    } else {
      const normalizedData = (data || []).map(field => {
        let parsedOpts = field.options || [];
        if (typeof parsedOpts === 'string') {
          try { parsedOpts = JSON.parse(parsedOpts); } catch (e) { parsedOpts = []; }
        }
        
        const formattedOpts = parsedOpts.map(opt => {
          if (typeof opt === 'object' && opt !== null) {
            return { label: opt.label || '', quota: opt.quota || '' };
          }
          return { label: String(opt), quota: '' };
        });

        return { ...field, options: formattedOpts };
      });

      setFormFields(normalizedData);
    }
    setLoadingFields(false);
  };

  const handleAddField = () => {
    const newField = {
      id: `temp_${Date.now()}`,
      event_id: selectedEventForBuilder.id,
      label: 'Pertanyaan Tanpa Judul',
      field_type: 'text',
      options: [{ label: 'Opsi 1', quota: '' }, { label: 'Opsi 2', quota: '' }],
      placeholder: '',
      is_required: false,
      order_index: formFields.length + 1,
      isNew: true
    };
    setFormFields([...formFields, newField]);
  };

  const handleUpdateFieldLocal = (index, key, val) => {
    const updated = [...formFields];
    updated[index][key] = val;
    setFormFields(updated);
  };

  const handleAddOptionLocal = (fieldIndex) => {
    const updated = [...formFields];
    const currentOpts = updated[fieldIndex].options || [];
    updated[fieldIndex].options = [...currentOpts, { label: `Opsi ${currentOpts.length + 1}`, quota: '' }];
    setFormFields(updated);
  };

  const handleRemoveOptionLocal = (fieldIndex, optIndex) => {
    const updated = [...formFields];
    updated[fieldIndex].options = updated[fieldIndex].options.filter((_, i) => i !== optIndex);
    setFormFields(updated);
  };

  const handleUpdateOptionLabelLocal = (fieldIndex, optIndex, val) => {
    const updated = [...formFields];
    updated[fieldIndex].options[optIndex].label = val;
    setFormFields(updated);
  };

  const handleUpdateOptionQuotaLocal = (fieldIndex, optIndex, val) => {
    const updated = [...formFields];
    updated[fieldIndex].options[optIndex].quota = val;
    setFormFields(updated);
  };

  const handleRemoveFieldLocal = async (field, index) => {
    if (!field.isNew) {
      const { error } = await supabase.from('event_form_fields').delete().eq('id', field.id);
      if (error) {
        showToast(`Gagal menghapus pertanyaan: ${error.message}`, 'error');
        return;
      }
    }
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSaveFormFields = async () => {
    setSaving(true);

    for (let i = 0; i < formFields.length; i++) {
      const f = formFields[i];
      const payload = {
        event_id: selectedEventForBuilder.id,
        label: f.label || 'Pertanyaan Tanpa Judul',
        field_type: f.field_type,
        options: f.options || [],
        placeholder: f.placeholder || '',
        is_required: f.is_required || false,
        order_index: i + 1
      };

      if (f.isNew || String(f.id).startsWith('temp_')) {
        await supabase.from('event_form_fields').insert([payload]);
      } else {
        await supabase.from('event_form_fields').update(payload).eq('id', f.id);
      }
    }

    setSaving(false);
    showToast(`Formulir dinamis untuk "${selectedEventForBuilder.name}" berhasil disimpan!`);
    setShowFormBuilderModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Daftar Acara</h3>
          <p className="text-xs text-slate-500">Kelola formulir pendaftaran dan kuota fleksibel real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRealEvents} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1" title="Refresh Data">
            <RefreshCw size={16} className={loadingEvents ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow w-full sm:w-auto">
            <Plus size={16} /> Buat Acara Baru
          </button>
        </div>
      </div>

      {loadingEvents ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Memuat data acara...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-3">
          <Calendar size={36} className="mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">Belum Ada Acara</p>
          <p className="text-slate-400">Klik tombol &quot;Buat Acara Baru&quot; di atas untuk menambahkan acara perdana.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(evt => {
            const isUnlim = evt.capacity === null || evt.capacity === 0;
            const registerUrl = `${window.location.origin}/#/register/${evt.id}`;
            const isQrOn = evt.enable_qr ?? evt.enableQr ?? true;
            const isEmailOn = evt.require_email ?? evt.requireEmail ?? true;
            const isFamilyOn = evt.allow_family ?? evt.allowFamily ?? true;

            return (
              <div key={evt.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="h-32 bg-slate-800 relative">
                    <img src={evt.banner} alt={evt.name} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-slate-900/80 text-white px-2.5 py-1 rounded text-[11px] font-bold backdrop-blur-sm">
                        {evt.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {evt.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{evt.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{evt.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleOpenEdit(evt)} 
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Edit Acara Ini"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>📅 <strong>Tanggal:</strong> {evt.date}</div>
                      <div>⏰ <strong>Waktu:</strong> {evt.time}</div>
                      <div className="sm:col-span-2">📍 <strong>Lokasi:</strong> {evt.venue}</div>
                      <div>👨‍👩‍👧‍👦 <strong>Tipe:</strong> {isFamilyOn ? 'Rombongan' : 'Individu'}</div>
                      <div>
                        <strong>Fitur:</strong>{' '}
                        {isQrOn && isEmailOn ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-300">
                            🎟️ E-Tiket QR + Email
                          </span>
                        ) : isQrOn ? (
                          <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded text-[10px] border border-teal-300">
                            🎟️ E-Tiket QR Code Only
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                            📝 Tanpa QR Code
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-5 pt-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div className="text-xs">
                      <span className="text-slate-500">Pendaftar: </span>
                      <strong className="text-teal-700 font-bold">{evt.registered}</strong> / {isUnlim ? '∞ Unlimited' : `${evt.capacity} Porsi`}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button 
                        onClick={() => handleOpenFormBuilder(evt)} 
                        className="p-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-indigo-200"
                        title="Desain Pertanyaan Form & Batas Kuota Sesi"
                      >
                        <ListPlus size={14} /> Form Builder
                      </button>

                      <button onClick={() => {
                        window.location.hash = `#/register/${evt.id}`;
                      }} className="p-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-teal-200">
                        <Ticket size={14} /> Form
                      </button>

                      <button onClick={() => {
                        navigator.clipboard.writeText(registerUrl);
                        showToast(`URL disalin: ${registerUrl}`);
                      }} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center justify-center gap-1 border border-slate-200" title="Salin Link Pendaftaran Publik">
                        <Copy size={14} /> Link
                      </button>

                      <button 
                        onClick={() => handleResetRegistrants(evt.id, evt.name)} 
                        className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-amber-200"
                        title="Reset/Flush Kuota Pendaftar ke 0"
                      >
                        <RotateCcw size={14} /> Flush
                      </button>

                      <button 
                        onClick={() => handleDeleteEvent(evt.id, evt.name)} 
                        className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-rose-200"
                        title="Hapus Acara Permanen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM BUILDER DENGAN PANDUAN BAWAAN & SETTING KUOTA OPTION */}
      {showFormBuilderModal && selectedEventForBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-300 my-8 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 bg-indigo-900 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] bg-indigo-700 text-indigo-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Editor Formulir &amp; Pembagian Kuota Sesi
                </span>
                <h3 className="font-bold text-sm text-white mt-1">Form Builder: {selectedEventForBuilder.name}</h3>
              </div>
              <button onClick={() => setShowFormBuilderModal(false)} className="text-slate-300 hover:text-white p-1">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {loadingFields ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Memuat struktur pertanyaan...
                </div>
              ) : (
                <>
                  {/* PANDUAN DENGAN INFO INPUTAN OTOMATIS */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm text-xs space-y-2">
                    <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <span>📌 Panduan Pembuatan Form:</span>
                    </div>
                    
                    <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-800 space-y-1">
                      <div className="font-bold text-teal-900">⚡ Inputan Otomatis (Sudah Ada di Sistem):</div>
                      <p>
                        Field <strong>Nama Lengkap</strong>, <strong>No. WhatsApp</strong>, dan <strong>Email</strong> (jika aktif) <span className="font-semibold text-teal-900">sudah otomatis ter-generate oleh sistem</span> di bagian atas form pendaftaran jemaat. Anda <u>TIDAK PERLU</u> membuat pertanyaan Nama / No. WA lagi di sini.
                      </p>
                    </div>

                    <div className="text-slate-600 leading-relaxed text-[11px] space-y-1 pt-1">
                      <div className="font-bold text-slate-800">💡 Pengaturan Batas Kuota:</div>
                      <div>• <strong>Mode A (Kuota Tunggal):</strong> Kosongkan kolom kuota opsi. Pendaftaran dibatasi Kuota Utama acara.</div>
                      <div>• <strong>Mode B (Multi-Sesi / Sub-Kuota):</strong> Isi angka kuota pada kolom <em>Quota</em> di samping opsi (contoh: Kebaktian 1 = 600, Kebaktian 2 = 700).</div>
                    </div>
                  </div>

                  {formFields.length === 0 ? (
                    <div className="p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
                      <p className="font-semibold text-slate-700">Belum ada pertanyaan kustom tambahan.</p>
                      <p>Klik &quot;+ Tambah Pertanyaan Baru&quot; di bawah untuk membuat pilihan seperti Sesi Ibadah, Ukuran Kaos, Tanggal Lahir, dll.</p>
                    </div>
                  ) : (
                    formFields.map((field, idx) => (
                      <div key={field.id} className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4 relative border-l-4 border-l-indigo-600">
                        <div className="flex flex-col sm:flex-row gap-3 items-start justify-between">
                          <input 
                            type="text" 
                            value={field.label}
                            onChange={e => handleUpdateFieldLocal(idx, 'label', e.target.value)}
                            placeholder="Ketik Pertanyaan (Contoh: Mendaftar Ibadah Peresmian / Sesi Kebaktian)"
                            className="w-full sm:flex-1 p-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                          />

                          <select 
                            value={field.field_type}
                            onChange={e => handleUpdateFieldLocal(idx, 'field_type', e.target.value)}
                            className="w-full sm:w-48 p-2.5 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50"
                          >
                            <option value="text">Teks Singkat</option>
                            <option value="textarea">Paragraf / Penjelasan</option>
                            <option value="radio">Pilihan Ganda (Radio)</option>
                            <option value="dropdown">Dropdown Pilihan</option>
                            <option value="date">Tanggal</option>
                          </select>
                        </div>

                        <div>
                          <input 
                            type="text"
                            value={field.placeholder || ''}
                            onChange={e => handleUpdateFieldLocal(idx, 'placeholder', e.target.value)}
                            placeholder="Teks keterangan/panduan di bawah pertanyaan (Opsional)"
                            className="w-full p-2 border border-slate-200 rounded text-[11px] text-slate-600"
                          />
                        </div>

                        {/* EDIT OPSI + LIMIT ANGKA KUOTA OPSI */}
                        {['radio', 'dropdown'].includes(field.field_type) && (
                          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase">
                              Daftar Pilihan Opsi &amp; Batas Kuota Per Opsi (Mode B):
                            </label>
                            
                            {(field.options || []).map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs">⚪</span>
                                <input 
                                  type="text" 
                                  value={opt.label}
                                  onChange={e => handleUpdateOptionLabelLocal(idx, oIdx, e.target.value)}
                                  placeholder={`Nama Opsi (Contoh: Kebaktian ${oIdx + 1})`}
                                  className="flex-1 p-2 border border-slate-300 rounded bg-white text-xs font-medium"
                                />

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[10px] font-bold text-slate-500">Quota:</span>
                                  <input 
                                    type="number" 
                                    value={opt.quota || ''}
                                    onChange={e => handleUpdateOptionQuotaLocal(idx, oIdx, e.target.value)}
                                    placeholder="∞ Unlimited"
                                    className="w-24 p-2 border border-slate-300 rounded bg-white text-xs font-mono font-bold text-indigo-700"
                                  />
                                </div>

                                {(field.options || []).length > 1 && (
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveOptionLocal(idx, oIdx)}
                                    className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}

                            <button 
                              type="button"
                              onClick={() => handleAddOptionLocal(idx)}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-bold pt-1 flex items-center gap-1"
                            >
                              + Tambah Opsi Jawaban
                            </button>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={field.is_required || false}
                              onChange={e => handleUpdateFieldLocal(idx, 'is_required', e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="font-semibold text-slate-700">Wajib Diisi (Required)</span>
                          </label>

                          <button 
                            type="button"
                            onClick={() => handleRemoveFieldLocal(field, idx)}
                            className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Hapus Pertanyaan
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  <button 
                    type="button" 
                    onClick={handleAddField}
                    className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Plus size={16} /> Tambah Pertanyaan Baru
                  </button>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowFormBuilderModal(false)}
                className="px-4 py-2 border rounded-lg text-xs text-slate-600 font-semibold"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={saving}
                onClick={handleSaveFormFields}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan Form...' : 'Simpan Perubahan Formulir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT ACARA BARU (DENGAN SAKELAR QR & EMAIL) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Acara Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nama Acara *</label>
                <input required type="text" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} placeholder="Contoh: Peresmian Gedung Baru GII Hok Im Tong Holis" className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-1 focus:ring-teal-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kategori</label>
                  <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 font-medium">
                    <option value="Ibadah Minggu">Ibadah Minggu</option>
                    <option value="Natal">Natal</option>
                    <option value="Paskah">Paskah</option>
                    <option value="Youth Gathering">Youth Gathering</option>
                    <option value="Seminar / Konferensi">Seminar / Konferensi</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Kapasitas Maksimal</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-teal-700 font-bold">
                      <input 
                        type="checkbox" 
                        checked={isUnlimited} 
                        onChange={e => setIsUnlimited(e.target.checked)}
                      />
                      <span>Tanpa Batas (∞)</span>
                    </label>
                  </div>
                  <input 
                    type="number" 
                    disabled={isUnlimited}
                    value={isUnlimited ? '' : newEvent.capacity} 
                    onChange={e => setNewEvent({...newEvent, capacity: e.target.value})} 
                    placeholder={isUnlimited ? "Kapasitas Tidak Terbatas" : "1300"}
                    className="w-full p-2.5 border rounded-lg border-slate-300 disabled:bg-slate-100 disabled:text-slate-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Tanggal Acara *</label>
                  <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Jam / Waktu</label>
                  <input type="text" placeholder="07.30 - 10.00 WIB" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Tempat / Ruangan</label>
                <input type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Kata-kata Pengantar / Deskripsi Acara</label>
                <textarea rows={3} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Masukkan kata-kata pengantar panjang, ayat Alkitab, atau pengumuman..." className="w-full p-2.5 border rounded-lg border-slate-300 font-sans"></textarea>
              </div>

              {/* SAKELAR FITUR ACARA */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Pengaturan Fitur Acara:</label>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">🎟️ Terbitkan E-Tiket &amp; QR Code</span>
                  <input type="checkbox" checked={newEvent.enable_qr} onChange={e => setNewEvent({...newEvent, enable_qr: e.target.checked})} className="w-4 h-4 text-teal-600 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">✉️ Minta Email &amp; Kirim Otomatis</span>
                  <input type="checkbox" checked={newEvent.require_email} onChange={e => setNewEvent({...newEvent, require_email: e.target.checked})} className="w-4 h-4 text-teal-600 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">👨‍👩‍👧‍👦 Izinkan Pendaftaran Keluarga / Rombongan</span>
                  <input type="checkbox" checked={newEvent.allow_family} onChange={e => setNewEvent({...newEvent, allow_family: e.target.checked})} className="w-4 h-4 text-teal-600 rounded" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Acara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT ACARA */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Acara: {editEventData.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nama Acara *</label>
                <input required type="text" value={editEventData.name} onChange={e => setEditEventData({...editEventData, name: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-1 focus:ring-teal-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kategori</label>
                  <select value={editEventData.category} onChange={e => setEditEventData({...editEventData, category: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 font-medium">
                    <option value="Ibadah Minggu">Ibadah Minggu</option>
                    <option value="Natal">Natal</option>
                    <option value="Paskah">Paskah</option>
                    <option value="Youth Gathering">Youth Gathering</option>
                    <option value="Seminar / Konferensi">Seminar / Konferensi</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Kapasitas Maksimal</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-teal-700 font-bold">
                      <input 
                        type="checkbox" 
                        checked={isEditUnlimited} 
                        onChange={e => setIsEditUnlimited(e.target.checked)}
                      />
                      <span>Tanpa Batas (∞)</span>
                    </label>
                  </div>
                  <input 
                    type="number" 
                    disabled={isEditUnlimited}
                    value={isEditUnlimited ? '' : editEventData.capacity} 
                    onChange={e => setEditEventData({...editEventData, capacity: e.target.value})} 
                    placeholder={isEditUnlimited ? "Kapasitas Tidak Terbatas" : "1300"}
                    className="w-full p-2.5 border rounded-lg border-slate-300 disabled:bg-slate-100 disabled:text-slate-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Tanggal Acara *</label>
                  <input type="date" required value={editEventData.date} onChange={e => setEditEventData({...editEventData, date: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Jam / Waktu</label>
                  <input type="text" value={editEventData.time} onChange={e => setEditEventData({...editEventData, time: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Tempat / Ruangan</label>
                <input type="text" value={editEventData.venue} onChange={e => setEditEventData({...editEventData, venue: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Kata-kata Pengantar / Deskripsi Acara</label>
                <textarea rows={3} value={editEventData.description} onChange={e => setEditEventData({...editEventData, description: e.target.value})} placeholder="Masukkan kata-kata pengantar panjang, ayat Alkitab, atau pengumuman..." className="w-full p-2.5 border rounded-lg border-slate-300 font-sans"></textarea>
              </div>

              {/* SAKELAR FITUR ACARA EDIT */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Pengaturan Fitur Acara:</label>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">🎟️ Terbitkan E-Tiket &amp; QR Code</span>
                  <input type="checkbox" checked={editEventData.enable_qr} onChange={e => setEditEventData({...editEventData, enable_qr: e.target.checked})} className="w-4 h-4 text-teal-600 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">✉️ Minta Email &amp; Kirim Otomatis</span>
                  <input type="checkbox" checked={editEventData.require_email} onChange={e => setEditEventData({...editEventData, require_email: e.target.checked})} className="w-4 h-4 text-teal-600 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">👨‍👩‍👧‍👦 Izinkan Pendaftaran Keluarga / Rombongan</span>
                  <input type="checkbox" checked={editEventData.allow_family} onChange={e => setEditEventData({...editEventData, allow_family: e.target.checked})} className="w-4 h-4 text-teal-600 rounded" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {saving ? 'Memperbarui...' : 'Perbarui Acara'}
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
// MODULE 3: CHECK-IN SCANNER QR REAL (CDN VERSION)
// ==========================================
function CheckInModule({ showToast }) {
  const [scanResult, setScanResult] = useState(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [manualTicketInput, setManualTicketInput] = useState('');
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    let html5QrCode = null;

    const loadScriptAndStart = () => {
      if (window.Html5Qrcode) {
        initScanner();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.async = true;
      script.onload = () => initScanner();
      script.onerror = () => setCameraError("Gagal memuat library pemindai QR.");
      document.body.appendChild(script);
    };

    const initScanner = async () => {
      try {
        html5QrCode = new window.Html5Qrcode("reader");

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => handleProcessCheckIn(decodedText.trim())
        );
      } catch (err) {
        console.warn("Gagal pakai kamera belakang, mencoba kamera default:", err);
        try {
          if (html5QrCode) {
            await html5QrCode.start(
              { facingMode: "user" },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText) => handleProcessCheckIn(decodedText.trim())
            );
          }
        } catch (fallbackErr) {
          console.error("Kamera gagal diakses penuh:", fallbackErr);
          setCameraError("Kamera tidak dapat diakses otomatis. Pastikan izin kamera di browser sudah diizinkan (Allow).");
        }
      }
    };

    loadScriptAndStart();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(err => console.error("Error stop scanner:", err));
      }
    };
  }, []);

  const handleProcessCheckIn = async (rawTicketId) => {
    if (loadingCheckIn) return;
    setLoadingCheckIn(true);
    setScanResult(null);

    let cleanTicketId = rawTicketId.trim();
    if (cleanTicketId.includes('TKT-')) {
      const match = cleanTicketId.match(/TKT-\d+/);
      if (match) cleanTicketId = match[0];
    }

    const { data: ticket, error } = await supabase
      .from('registration_members')
      .select('*, registrations(name, whatsapp, event_id)')
      .eq('ticket_id', cleanTicketId)
      .single();

    if (error || !ticket) {
      setScanResult({
        status: 'INVALID',
        message: `Tiket "${cleanTicketId}" Tidak Ditemukan!`,
        ticketId: cleanTicketId
      });
      if (showToast) showToast(`Tiket ${cleanTicketId} tidak valid!`, 'error');
      setLoadingCheckIn(false);
      return;
    }

    if (ticket.checked_in) {
      setScanResult({
        status: 'ALREADY_USED',
        message: `TIKET SUDAH TERPAKAI!`,
        ticket,
        checkInTime: ticket.check_in_time
      });
      if (showToast) showToast(`Tiket ${ticket.name} sudah dipakai pada ${ticket.check_in_time}`, 'error');
      setLoadingCheckIn(false);
      return;
    }

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    
    const { error: updateError } = await supabase
      .from('registration_members')
      .update({ 
        checked_in: true, 
        check_in_time: nowTime 
      })
      .eq('id', ticket.id);

    if (updateError) {
      setScanResult({
        status: 'ERROR',
        message: `Gagal Update Status: ${updateError.message}`
      });
      setLoadingCheckIn(false);
      return;
    }

    if (ticket.registrations?.event_id) {
      const { data: eventData } = await supabase
        .from('events')
        .select('checked_in')
        .eq('id', ticket.registrations.event_id)
        .single();

      if (eventData) {
        await supabase
          .from('events')
          .update({ checked_in: (eventData.checked_in || 0) + 1 })
          .eq('id', ticket.registrations.event_id);
      }
    }

    const successData = {
      status: 'SUCCESS',
      message: 'VERIFIKASI BERHASIL',
      ticket: { ...ticket, checked_in: true, check_in_time: nowTime }
    };

    setScanResult(successData);
    setRecentCheckIns(prev => [successData.ticket, ...prev.slice(0, 4)]);
    if (showToast) showToast(`Check-in Berhasil: ${ticket.name} (${ticket.ticket_id})`);
    
    setLoadingCheckIn(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualTicketInput.trim()) {
      handleProcessCheckIn(manualTicketInput.trim().toUpperCase());
      setManualTicketInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-base text-slate-900">Scanner Tiket QR (Pintu Masuk)</h3>
          <p className="text-xs text-slate-500">Arahkan kamera ke QR Code E-Tiket jemaat untuk verifikasi kehadiran real-time</p>
        </div>
        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200 w-fit">
          🟢 Scanner Aktif
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Kamera Pemindai</h4>
          
          <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-900 min-h-[280px] flex items-center justify-center relative">
            <div id="reader" className="w-full h-full min-h-[250px]"></div>
          </div>

          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              ⚠️ {cameraError}
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="pt-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Atau Ketik Kode Tiket Manual:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={manualTicketInput}
                onChange={e => setManualTicketInput(e.target.value)}
                placeholder="Contoh: TKT-678170" 
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-teal-500"
              />
              <button type="submit" disabled={loadingCheckIn} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg disabled:opacity-50">
                Verifikasi
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-h-[280px] flex flex-col justify-center">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">Hasil Pemindaian Terbaru</h4>

            {loadingCheckIn ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-medium">Memverifikasi data...</p>
              </div>
            ) : !scanResult ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <QrCode size={48} className="mx-auto text-slate-300" />
                <p className="text-xs">Scan QR tiket di sebelah kiri untuk melihat status verifikasi</p>
              </div>
            ) : scanResult.status === 'SUCCESS' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md">
                  ✓
                </div>
                <div>
                  <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">VERIFIKASI BERHASIL</span>
                  <h3 className="font-bold text-lg text-slate-900 mt-1">{scanResult.ticket.name}</h3>
                  <p className="text-xs text-slate-600 font-mono">Kode Tiket: {scanResult.ticket.ticket_id} ({scanResult.ticket.category})</p>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-emerald-200">
                  Waktu Masuk: <strong>{scanResult.ticket.check_in_time}</strong>
                </div>
              </div>
            ) : scanResult.status === 'ALREADY_USED' ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md">
                  ✕
                </div>
                <div>
                  <span className="bg-rose-200 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">TIKET SUDAH TERPAKAI</span>
                  <h3 className="font-bold text-lg text-slate-900 mt-1">{scanResult.ticket.name}</h3>
                  <p className="text-xs text-rose-700 font-medium mt-1">
                    Tiket ini sudah pernah di-scan sebelumnya pada <strong>{scanResult.checkInTime}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md">
                  !
                </div>
                <div>
                  <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">TIKET INVALID</span>
                  <p className="text-xs text-amber-800 font-medium mt-1">{scanResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {recentCheckIns.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Riwayat Scan Sesi Ini</h5>
              <div className="space-y-1.5">
                {recentCheckIns.map(item => (
                  <div key={item.id} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center text-xs border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">({item.ticket_id})</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{item.check_in_time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 4: DATA REGISTRASI & PENDAFTARAN JEMAAT
// ==========================================
function RegistrationsModule({ events, showToast }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeQrModal, setActiveQrModal] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(name), registration_members(*), registration_answers(*, event_form_fields(label))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
      if (showToast) showToast(`Gagal memuat data: ${error.message}`, 'error');
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleManualCheckIn = async (member, eventId) => {
    if (processingId) return;
    setProcessingId(member.id);

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const { error } = await supabase
      .from('registration_members')
      .update({ 
        checked_in: true, 
        check_in_time: nowTime 
      })
      .eq('id', member.id);

    if (error) {
      if (showToast) showToast(`Gagal Check-In: ${error.message}`, 'error');
      setProcessingId(null);
      return;
    }

    if (eventId) {
      const { data: eventData } = await supabase
        .from('events')
        .select('checked_in')
        .eq('id', eventId)
        .single();

      if (eventData) {
        await supabase
          .from('events')
          .update({ checked_in: (eventData.checked_in || 0) + 1 })
          .eq('id', eventId);
      }
    }

    if (showToast) showToast(`Berhasil Check-In Manual: ${member.name} (${member.ticket_id})`);
    
    setRegistrations(prevRegs => prevRegs.map(reg => ({
      ...reg,
      registration_members: reg.registration_members.map(m => 
        m.id === member.id ? { ...m, checked_in: true, check_in_time: nowTime } : m
      )
    })));

    setProcessingId(null);
  };

  const filteredRegs = registrations.filter(reg => {
    const matchEvent = selectedEventId === 'ALL' || reg.event_id === selectedEventId;
    const matchSearch = reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        reg.whatsapp.includes(searchQuery) ||
                        (reg.registration_members && reg.registration_members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.ticket_id.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchEvent && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-base text-slate-900">Data Pendaftaran Jemaat</h3>
          <p className="text-xs text-slate-500">Daftar seluruh jemaat &amp; E-Tiket yang telah diterbitkan</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={selectedEventId} 
            onChange={e => setSelectedEventId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            <option value="ALL">Semua Acara</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <button onClick={fetchRegistrations} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search size={16} className="text-slate-400 ml-1" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama jemaat, nomor WhatsApp, atau kode tiket (contoh: TKT-678170)..." 
          className="w-full text-xs bg-transparent focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Memuat data pendaftaran jemaat...
        </div>
      ) : filteredRegs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
          <FileText size={36} className="mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">Belum Ada Data Pendaftaran</p>
          <p className="text-slate-400">Pendaftaran publik jemaat akan muncul di sini secara otomatis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegs.map(reg => (
            <div key={reg.id} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{reg.name}</span>
                    <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                      Pendaftar Utama
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📱 {reg.whatsapp} {reg.email && `| ✉️ ${reg.email}`}
                  </p>
                  
                  {reg.registration_answers && reg.registration_answers.length > 0 && (
                    <div className="mt-2 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="text-[10px] font-bold text-indigo-700 uppercase">Jawaban Form Kustom:</div>
                      {reg.registration_answers.map(ans => (
                        <div key={ans.id} className="text-slate-700">
                          <strong>{ans.event_form_fields?.label || 'Pertanyaan'}:</strong> <span className="text-teal-800 font-semibold">{ans.answer_value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-left sm:text-right text-xs">
                  <span className="font-semibold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md">
                    {reg.events?.name || 'Event GII Holis'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">ID: {reg.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Tiket Terbit ({reg.registration_members?.length || 0} Porsi)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reg.registration_members?.map(mem => (
                    <div key={mem.id} className={`p-3 rounded-lg border flex flex-col justify-between text-xs gap-3 ${mem.checked_in ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{mem.name}</div>
                          <div className="text-[10px] font-mono font-bold text-teal-700 mt-0.5">{mem.ticket_id}</div>
                        </div>
                        
                        <button 
                          onClick={() => setActiveQrModal({ member: mem, eventName: reg.events?.name })}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md shadow-sm transition" 
                          title="Tampilkan QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                        {mem.checked_in ? (
                          <span className="w-full text-center px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-300">
                            ✓ Hadir ({mem.check_in_time || 'Checked-In'})
                          </span>
                        ) : (
                          <button
                            disabled={processingId === mem.id}
                            onClick={() => handleManualCheckIn(mem, reg.event_id)}
                            className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md shadow-sm transition flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {processingId === mem.id ? 'Memproses...' : '✓ Set Hadir Manual'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">E-Tiket Jemaat</span>
              <button onClick={() => setActiveQrModal(null)} className="text-slate-400 hover:text-slate-600 p-1 font-bold">✕</button>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">{activeQrModal.member.name}</h3>
              <p className="text-xs text-slate-500">{activeQrModal.eventName || 'GII Holis Event'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mx-auto shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeQrModal.member.ticket_id}`} 
                alt="QR Code Tiket" 
                className="w-48 h-48 mx-auto rounded-lg bg-white p-1"
              />
            </div>

            <div className="font-mono text-sm font-bold text-teal-800 bg-teal-50 py-1.5 px-4 rounded-lg border border-teal-200 inline-block">
              {activeQrModal.member.ticket_id}
            </div>

            <div className="pt-2 flex gap-2">
              {!activeQrModal.member.checked_in && (
                <button 
                  onClick={() => {
                    handleManualCheckIn(activeQrModal.member, null);
                    setActiveQrModal(null);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                >
                  ✓ Hadir Manual
                </button>
              )}
              <button 
                onClick={() => setActiveQrModal(null)} 
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE: KAMPANYE EMAIL
// ==========================================
function EmailModule() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
          ✉️
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900">Integrasi Email Service (Resend API)</h3>
          <p className="text-xs text-slate-500">Status Otomasi Pengiriman Email Konfirmasi Tiket Jemaat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900">Status API Resend:</span>
            <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">AKTIF (SERVERLESS)</span>
          </div>
          <p className="text-emerald-800">
            Email konfirmasi + QR Code tiket akan terkirim secara otomatis via Vercel Backend Serverless Function tiap jemaat selesai mengisi form pendaftaran.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
          <div><strong>Domain Pengirim:</strong> onboarding@resend.dev</div>
          <div><strong>API Key Status:</strong> Secured via Vercel Serverless (RESEND_API_KEY)</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE: MANAJEMEN USER & ROLES (FULL CRUD SUPABASE)
// ==========================================
function RolesModule({ currentRole, setCurrentRole, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'CHECKIN_STAFF', password: '' });
  const [editUser, setEditUser] = useState({ id: '', name: '', email: '', role: 'CHECKIN_STAFF', status: 'Aktif' });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Gagal memuat profil pengguna:', error);
      if (showToast) showToast('Gagal memuat data pengguna', 'error');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.name || !newUser.password) {
      showToast('Mohon lengkapi email, nama, dan password.', 'error');
      return;
    }

    setSaving(true);
    const userId = `USR-${Date.now()}`;
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Aktif'
    }]);

    setSaving(false);

    if (profileError) {
      showToast(`Gagal menyimpan profil: ${profileError.message}`, 'error');
    } else {
      showToast(`Berhasil menambahkan pengguna ${newUser.name}!`);
      setShowAddModal(false);
      setNewUser({ email: '', name: '', role: 'CHECKIN_STAFF', password: '' });
      fetchUsers();
    }
  };

  const handleOpenEdit = (user) => {
    setEditUser({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status || 'Aktif' });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name: editUser.name, role: editUser.role, status: editUser.status }).eq('id', editUser.id);
    setSaving(false);

    if (error) {
      showToast(`Gagal memperbarui pengguna: ${error.message}`, 'error');
    } else {
      showToast(`Pengguna ${editUser.name} berhasil diperbarui!`);
      setShowEditModal(false);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akses untuk ${name}?`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus user: ${error.message}`, 'error');
    } else {
      showToast(`Pengguna ${name} berhasil dihapus dari database.`);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-base text-slate-900">Manajemen Pengguna &amp; Hak Akses</h3>
          <p className="text-xs text-slate-500">Kelola akun administrator, event admin, dan staff check-in database Supabase</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow">
          <UserPlus size={16} /> Tambah Pengguna Baru
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat data pengguna dari Supabase...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada data pengguna tersimpan di tabel profiles. Klik &quot;Tambah Pengguna Baru&quot; untuk mulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-semibold">Nama &amp; Email</th>
                  <th className="p-3 font-semibold">Peran (Role)</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'EVENT_ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {u.role === 'SUPER_ADMIN' && '🛡️ Super Admin'}
                        {u.role === 'EVENT_ADMIN' && '📅 Event Admin'}
                        {u.role === 'CHECKIN_STAFF' && '🎟️ Staff Check-In'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        {u.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(u)} className="text-teal-600 hover:underline font-semibold">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-rose-600 hover:underline font-semibold">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Pengguna Baru ke Supabase</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nama Lengkap *</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Contoh: Budi Santoso" className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Email Login *</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="budi@giiholis.org" className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Password Login *</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Hak Akses (Role)</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 font-medium">
                  <option value="CHECKIN_STAFF">Staff Check-In (Scanner QR)</option>
                  <option value="EVENT_ADMIN">Event Admin (Kelola Acara &amp; Pendaftaran)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Pengguna: {editUser.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Nama Lengkap *</label>
                <input required type="text" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Email Login (Read-only)</label>
                <input disabled type="email" value={editUser.email} className="w-full p-2.5 border rounded-lg border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Hak Akses (Role)</label>
                <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 font-medium">
                  <option value="CHECKIN_STAFF">Staff Check-In (Scanner QR)</option>
                  <option value="EVENT_ADMIN">Event Admin (Kelola Acara &amp; Pendaftaran)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Status Akun</label>
                <select value={editUser.status} onChange={e => setEditUser({...editUser, status: e.target.value})} className="w-full p-2.5 border rounded-lg border-slate-300 font-medium">
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Perbarui Pengguna'}
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
// ONGOING MODULE PLACEHOLDERS
// ==========================================
function OngoingModuleTitle({ title }) {
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3 shadow-sm">
      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200 font-bold text-lg">
        ⏳
      </div>
      <h3 className="font-bold text-base text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Modul ini sedang dalam tahap pengembangan (*Ongoing*) untuk pembaruan sistem berikutnya.
      </p>
    </div>
  );
}

function ContactsModule() { return <OngoingModuleTitle title="Kontak & CRM Jemaat" />; }
function DigitalInvitationsModule() { return <OngoingModuleTitle title="Undangan Digital" />; }
function GiftCardsModule() { return <OngoingModuleTitle title="Digital Gift Cards" />; }
function EngagementModule() { return <OngoingModuleTitle title="Engagement Center" />; }
function WhatsAppModule() { return <OngoingModuleTitle title="Integrasi WhatsApp Gateway" />; }
function ReportsModule() { return <OngoingModuleTitle title="Laporan & Export Data" />; }
