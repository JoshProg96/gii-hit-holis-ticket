export default async function handler(req, res) {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, name, tickets, eventName, eventDate, eventVenue } = req.body;

  if (!toEmail) {
    return res.status(400).json({ error: 'Email tujuan wajib diisi' });
  }

  // Generate tampilan list tiket QR
  const ticketItemsHtml = tickets.map((t, idx) => `
    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 10px; text-align: center;">
      <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: bold;">TIKET #${idx + 1} (${t.category})</p>
      <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">${t.name}</h3>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.ticket_id}" alt="QR Code" style="width: 140px; height: 140px; border: 1px solid #e2e8f0; padding: 4px; border-radius: 6px;" />
      <p style="margin: 6px 0 0 0; font-family: monospace; font-weight: bold; color: #0d9488; font-size: 14px; background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">
        ${t.ticket_id}
      </p>
    </div>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">GII Holis - E-Tiket Konfirmasi</h2>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
        <h3 style="color: #0d9488; margin-top: 0;">Halo, ${name}!</h3>
        <p style="color: #334155; font-size: 13px; line-height: 1.5;">
          Terima kasih telah melakukan pendaftaran. Berikut adalah detail konfirmasi dan <strong>E-Tiket QR</strong> untuk kegiatan:
        </p>
        
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; margin: 15px 0; font-size: 12px; color: #334155;">
          <p style="margin: 3px 0;">📌 <strong>Acara:</strong> ${eventName}</p>
          <p style="margin: 3px 0;">📅 <strong>Waktu:</strong> ${eventDate}</p>
          <p style="margin: 3px 0;">📍 <strong>Lokasi:</strong> ${eventVenue}</p>
        </div>

        <h4 style="color: #0f172a; font-size: 13px; margin-bottom: 10px; text-align: center; uppercase; letter-spacing: 0.5px;">Daftar E-Tiket Resmi</h4>
        ${ticketItemsHtml}

        <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 20px;">
          Tunjukkan QR Code di atas kepada petugas check-in saat memasuki ruangan ibadah/kegiatan.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p style="color: #94a3b8; font-size: 10px; text-align: center; margin: 0;">
          GII Hok Im Tong Holis Bandung — Otomasi Tiket Jemaat
        </p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'GII Holis Ticket <onboarding@resend.dev>',
        to: [toEmail],
        subject: `[E-Tiket Resmi] Pendaftaran ${eventName} - ${name}`,
        html: htmlContent
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
