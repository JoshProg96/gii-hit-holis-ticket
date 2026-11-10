export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, name, tickets, eventName, eventDate, eventVenue } = req.body;

  if (!toEmail) {
    return res.status(400).json({ error: 'Email tujuan wajib diisi' });
  }

  // Generate tampilan list tiket QR Maksimal & Aman Scan
  const ticketItemsHtml = tickets.map((t, idx) => `
    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px 12px; margin-bottom: 16px; text-align: center;">
      <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
        TIKET #${idx + 1} (${t.category})
      </p>
      <h3 style="margin: 0 0 14px 0; color: #0f172a; font-size: 17px; font-weight: bold;">
        ${t.name}
      </h3>
      
      <!-- Container QR Code Terisolasi (Anti-Cut Off) -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${t.ticket_id}" 
                 alt="QR Code Tiket" 
                 width="180" 
                 height="180" 
                 style="display: block; width: 180px; height: 180px; border: 1px solid #cbd5e1; padding: 8px; border-radius: 10px; background-color: #ffffff; margin: 0 auto;" />
          </td>
        </tr>
      </table>

      <!-- Kode Tiket Backup Manual -->
      <div style="margin-top: 12px;">
        <span style="font-family: monospace; font-weight: bold; color: #0d9488; font-size: 13px; background-color: #f1f5f9; padding: 6px 14px; border-radius: 6px; display: inline-block; letter-spacing: 1px;">
          ${t.ticket_id}
        </span>
      </div>
    </div>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background-color: #0f172a; padding: 18px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">GII Holis - E-Tiket Konfirmasi</h2>
      </div>
      <div style="background-color: #ffffff; padding: 20px 16px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
        <h3 style="color: #0d9488; margin-top: 0; font-size: 16px;">Halo, ${name}!</h3>
        <p style="color: #334155; font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
          Terima kasih telah melakukan pendaftaran. Berikut adalah detail konfirmasi dan <strong>E-Tiket QR</strong> untuk kegiatan:
        </p>
        
        <div style="background-color: #f1f5f9; padding: 12px 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; color: #334155;">
          <p style="margin: 0 0 4px 0;">📌 <strong>Acara:</strong> ${eventName}</p>
          <p style="margin: 0 0 4px 0;">📅 <strong>Waktu:</strong> ${eventDate}</p>
          <p style="margin: 0;">📍 <strong>Lokasi:</strong> ${eventVenue}</p>
        </div>

        <h4 style="color: #0f172a; font-size: 13px; margin: 0 0 14px 0; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
          Daftar E-Tiket Resmi
        </h4>

        ${ticketItemsHtml}

        <p style="color: #64748b; font-size: 11px; text-align: center; margin: 16px 0 0 0; line-height: 1.4;">
          Tunjukkan QR Code di atas kepada petugas check-in saat memasuki ruangan ibadah/kegiatan.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
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
