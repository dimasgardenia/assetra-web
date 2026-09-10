/* Halaman legal: Kebijakan Privasi (/privacy) dan Syarat & Ketentuan (/terms).
   Konten dwibahasa mengikuti pilihan bahasa portal. */
import React from 'react';
import { PortalNav, PortalFooter } from './shared';

const CONTACT_EMAIL = 'landassetra@gmail.com';
const COMPANY = 'PT Assetra Properti Nusantara';
const UPDATED = '10 September 2026';

const PRIVACY = {
  id: {
    title: 'Kebijakan Privasi',
    intro: `Kebijakan ini menjelaskan bagaimana ${COMPANY} ("Assetra", "kami") mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat memakai situs dan layanan Assetra.`,
    sections: [
      ['Data yang kami kumpulkan', [
        'Data akun: nama, alamat email, nomor WhatsApp, kata sandi (disimpan dalam bentuk hash), tipe akun (pembeli, pemilik properti, atau agen), dan foto profil bila Anda mengunggahnya.',
        'Masuk dengan Google: bila Anda memilih masuk dengan Google, kami menerima nama, alamat email, dan foto profil dari akun Google Anda. Kami tidak menerima kata sandi Google Anda dan tidak mengakses data Google lain.',
        'Data listing: alamat, harga, foto, dokumen legal, dan detail properti yang diunggah pemilik atau agen.',
        'Data minat (prospek): saat Anda menekan tombol WhatsApp, telepon, atau survei pada sebuah listing, kami mencatat nama, nomor Anda, listing yang diminati, dan waktu klik.',
        'Pengajuan KPR: nama, nomor WhatsApp, email, perkiraan penghasilan, dan parameter simulasi yang Anda isi di halaman Pembiayaan.',
        'Data teknis: alamat IP, jenis perangkat dan peramban, serta catatan aktivitas yang diperlukan untuk keamanan dan pembatasan penyalahgunaan.',
      ]],
      ['Cara kami menggunakan data', [
        'Menyediakan layanan: membuat akun, menampilkan listing, menghubungkan Anda dengan pemilik atau agen, dan meneruskan pengajuan KPR ke bank mitra.',
        'Verifikasi dan keamanan: mengirim tautan verifikasi email, mencegah akun ganda, membatasi penyalahgunaan, dan menjaga integritas platform.',
        'Komunikasi: mengirim email transaksional seperti verifikasi, reset kata sandi, dan pemberitahuan terkait akun Anda. Kami tidak mengirim email promosi tanpa persetujuan Anda.',
        'Peningkatan layanan: menganalisis penggunaan secara agregat untuk memperbaiki fitur.',
      ]],
      ['Dengan siapa data dibagikan', [
        'Pemilik properti dan agen: saat Anda menghubungi sebuah listing, nama dan nomor Anda ditampilkan kepada pemilik atau agen listing tersebut agar mereka dapat menindaklanjuti.',
        'Bank mitra: data pengajuan KPR diteruskan ke bank yang Anda pilih atau ke bank mitra kami untuk pra-persetujuan.',
        'Penyedia layanan: kami memakai penyedia infrastruktur, pengiriman email, dan layanan Google (Google Sign-In, Google Maps) yang memproses data atas nama kami sesuai kebijakan mereka.',
        'Kami tidak menjual data pribadi Anda kepada pihak ketiga.',
      ]],
      ['Penyimpanan dan keamanan', [
        'Data disimpan di server kami dengan akses terbatas. Kata sandi disimpan dalam bentuk hash dan tidak dapat dibaca oleh kami.',
        'Nomor kontak pemilik dan agen hanya ditampilkan kepada pengguna yang sudah memverifikasi email.',
        'Data disimpan selama akun Anda aktif atau selama diperlukan untuk tujuan di atas, lalu dihapus atau dianonimkan.',
      ]],
      ['Cookie dan penyimpanan peramban', [
        'Kami memakai penyimpanan lokal peramban untuk menjaga sesi masuk dan preferensi bahasa Anda. Kami tidak memakai cookie pelacakan iklan pihak ketiga.',
      ]],
      ['Hak Anda', [
        'Anda dapat melihat dan mengubah nama, email, nomor, dan foto profil di halaman Pengaturan.',
        `Untuk meminta salinan data, koreksi, atau penghapusan akun, hubungi kami di ${CONTACT_EMAIL}. Kami menanggapi dalam 14 hari kerja.`,
        'Anda dapat mencabut akses Google ke Assetra kapan saja lewat pengaturan akun Google Anda.',
      ]],
      ['Perubahan kebijakan', [
        'Kami dapat memperbarui kebijakan ini. Perubahan penting akan diumumkan di situs. Tanggal pembaruan terakhir tercantum di bagian atas halaman.',
      ]],
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro: `This policy explains how ${COMPANY} ("Assetra", "we") collects, uses, and protects your personal data when you use the Assetra website and services.`,
    sections: [
      ['Data we collect', [
        'Account data: name, email address, WhatsApp number, password (stored as a hash), account type (buyer, property owner, or agent), and a profile photo if you upload one.',
        'Sign in with Google: if you sign in with Google we receive your name, email address, and profile photo from your Google account. We never receive your Google password and do not access other Google data.',
        'Listing data: address, price, photos, legal documents, and property details uploaded by owners or agents.',
        'Interest data (leads): when you tap the WhatsApp, call, or survey button on a listing, we record your name, number, the listing, and the time.',
        'Mortgage (KPR) applications: name, WhatsApp number, email, estimated income, and the simulation parameters you enter on the Financing page.',
        'Technical data: IP address, device and browser type, and activity logs needed for security and abuse prevention.',
      ]],
      ['How we use data', [
        'Providing the service: creating accounts, showing listings, connecting you with owners or agents, and forwarding mortgage applications to partner banks.',
        'Verification and security: sending email verification links, preventing duplicate accounts, limiting abuse, and protecting platform integrity.',
        'Communication: transactional emails such as verification, password reset, and account notices. We do not send marketing email without your consent.',
        'Improving the service: aggregate usage analysis to improve features.',
      ]],
      ['Who we share data with', [
        'Property owners and agents: when you contact a listing, your name and number are shown to that listing\'s owner or agent so they can follow up.',
        'Partner banks: mortgage application data is forwarded to the bank you choose or to our partner banks for pre-approval.',
        'Service providers: we use infrastructure, email delivery, and Google services (Google Sign-In, Google Maps) that process data on our behalf under their own policies.',
        'We do not sell your personal data to third parties.',
      ]],
      ['Storage and security', [
        'Data is stored on our servers with restricted access. Passwords are hashed and cannot be read by us.',
        'Owner and agent contact numbers are shown only to users who have verified their email.',
        'Data is kept while your account is active or as long as needed for the purposes above, then deleted or anonymised.',
      ]],
      ['Cookies and browser storage', [
        'We use browser local storage to keep you signed in and remember your language. We do not use third-party advertising tracking cookies.',
      ]],
      ['Your rights', [
        'You can view and change your name, email, number, and profile photo on the Settings page.',
        `To request a copy of your data, a correction, or account deletion, contact us at ${CONTACT_EMAIL}. We respond within 14 working days.`,
        'You can revoke Google\'s access to Assetra at any time in your Google account settings.',
      ]],
      ['Changes to this policy', [
        'We may update this policy. Significant changes will be announced on the site. The last update date is shown at the top of this page.',
      ]],
    ],
  },
};

const TERMS = {
  id: {
    title: 'Syarat & Ketentuan',
    intro: `Dengan membuat akun atau memakai situs Assetra, Anda menyetujui ketentuan berikut. Layanan ini dioperasikan oleh ${COMPANY}.`,
    sections: [
      ['Akun', [
        'Anda harus berusia minimal 18 tahun dan memberikan data yang benar. Satu orang hanya boleh memiliki satu akun.',
        'Anda bertanggung jawab menjaga kerahasiaan kata sandi dan semua aktivitas di akun Anda.',
        'Akun agen aktif setelah ditinjau dan disetujui oleh Assetra. Akun pemilik properti aktif setelah verifikasi email.',
      ]],
      ['Listing properti', [
        'Pemilik dan agen menjamin bahwa mereka berhak memasarkan properti yang dipasang dan bahwa informasi, foto, serta dokumen yang diunggah akurat dan tidak melanggar hak pihak lain.',
        'Assetra dapat menyunting, menyembunyikan, atau menghapus listing yang menyesatkan, melanggar hukum, duplikat, atau melanggar ketentuan ini tanpa pemberitahuan.',
        'Assetra adalah platform penghubung. Kami bukan pihak dalam transaksi jual beli atau sewa antara pengguna, dan tidak menjamin ketersediaan, kondisi, harga, atau legalitas properti.',
      ]],
      ['Prospek dan kontak', [
        'Dengan menekan tombol kontak pada listing, Anda setuju nama dan nomor Anda diteruskan kepada pemilik atau agen listing tersebut.',
        'Pemilik dan agen hanya boleh memakai data prospek untuk menindaklanjuti minat terhadap listing terkait, bukan untuk pemasaran lain.',
      ]],
      ['Pengajuan KPR', [
        'Pengajuan di halaman Pembiayaan adalah permintaan pra-persetujuan yang diteruskan ke bank mitra. Persetujuan, bunga, dan syarat kredit sepenuhnya ditentukan oleh bank.',
        'Simulasi cicilan bersifat perkiraan dan bukan penawaran kredit.',
      ]],
      ['Iklan dan paket berbayar', [
        'Paket iklan dan penempatan unggulan dikenakan biaya sesuai harga yang tercantum saat pemesanan. Rincian tagihan dan pembatalan diatur dalam kesepakatan tertulis dengan tim sales Assetra.',
      ]],
      ['Larangan', [
        'Dilarang mengunggah konten palsu, menyesatkan, melanggar hukum, atau mengandung malware; mengambil data pengguna lain secara massal; mengganggu keamanan sistem; atau memakai layanan untuk penipuan.',
      ]],
      ['Batasan tanggung jawab', [
        'Layanan disediakan "sebagaimana adanya". Sejauh diizinkan hukum, Assetra tidak bertanggung jawab atas kerugian yang timbul dari transaksi antar pengguna, ketidakakuratan informasi listing, atau gangguan layanan.',
      ]],
      ['Penangguhan dan penghentian', [
        'Assetra dapat menangguhkan atau menutup akun yang melanggar ketentuan ini. Anda dapat menghapus akun kapan saja dengan menghubungi kami.',
      ]],
      ['Hukum yang berlaku', [
        `Ketentuan ini tunduk pada hukum Republik Indonesia. Pertanyaan dapat dikirim ke ${CONTACT_EMAIL}.`,
      ]],
    ],
  },
  en: {
    title: 'Terms of Service',
    intro: `By creating an account or using the Assetra website you agree to the following terms. The service is operated by ${COMPANY}.`,
    sections: [
      ['Accounts', [
        'You must be at least 18 years old and provide accurate information. One person may hold only one account.',
        'You are responsible for keeping your password confidential and for all activity on your account.',
        'Agent accounts become active after review and approval by Assetra. Property owner accounts become active after email verification.',
      ]],
      ['Property listings', [
        'Owners and agents warrant that they are entitled to market the listed property and that the information, photos, and documents uploaded are accurate and do not infringe third-party rights.',
        'Assetra may edit, hide, or remove listings that are misleading, unlawful, duplicated, or in breach of these terms without notice.',
        'Assetra is a connecting platform. We are not a party to any sale or rental transaction between users and do not guarantee the availability, condition, price, or legality of any property.',
      ]],
      ['Leads and contact', [
        'By tapping a contact button on a listing you agree that your name and number are forwarded to that listing\'s owner or agent.',
        'Owners and agents may use lead data only to follow up on interest in the related listing, not for other marketing.',
      ]],
      ['Mortgage (KPR) applications', [
        'Applications on the Financing page are pre-approval requests forwarded to partner banks. Approval, interest rates, and credit terms are decided solely by the bank.',
        'Instalment simulations are estimates and not a credit offer.',
      ]],
      ['Advertising and paid packages', [
        'Advertising packages and featured placements are charged at the prices shown at the time of order. Billing and cancellation details are governed by a written agreement with the Assetra sales team.',
      ]],
      ['Prohibited conduct', [
        'You may not upload fake, misleading, unlawful, or malicious content; scrape other users\' data; interfere with system security; or use the service for fraud.',
      ]],
      ['Limitation of liability', [
        'The service is provided "as is". To the extent permitted by law, Assetra is not liable for losses arising from transactions between users, inaccurate listing information, or service interruptions.',
      ]],
      ['Suspension and termination', [
        'Assetra may suspend or close accounts that breach these terms. You may delete your account at any time by contacting us.',
      ]],
      ['Governing law', [
        `These terms are governed by the laws of the Republic of Indonesia. Questions can be sent to ${CONTACT_EMAIL}.`,
      ]],
    ],
  },
};

const LegalPage = ({ kind, lang, onLang, onNav }) => {
  const doc = (kind === 'terms' ? TERMS : PRIVACY)[lang === 'id' ? 'id' : 'en'];
  const other = kind === 'terms' ? { href: '/privacy', label: lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy' } : { href: '/terms', label: lang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service' };
  React.useEffect(() => { window.scrollTo(0, 0); }, [kind]);
  return (
    <div>
      <PortalNav lang={lang} onLang={onLang} onNav={onNav} />
      <div className="pwrap" style={{ padding: '36px 0 64px', maxWidth: 820 }}>
        <div className="p-eyebrow">{lang === 'id' ? `Diperbarui ${UPDATED}` : `Updated ${UPDATED}`}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 36, letterSpacing: '-0.02em', margin: '6px 0 14px' }}>{doc.title}</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 28px' }}>{doc.intro}</p>
        {doc.sections.map(([h, items], i) => (
          <section key={i} style={{ marginBottom: 26 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 21, margin: '0 0 10px' }}>{i + 1}. {h}</h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-2)' }}>
              {items.map((p, j) => <li key={j} style={{ marginBottom: 6 }}>{p}</li>)}
            </ul>
          </section>
        ))}
        <div style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--line)', fontSize: 13.5, color: 'var(--muted)' }}>
          {lang === 'id' ? 'Lihat juga ' : 'See also '}<a href={other.href} style={{ color: 'var(--teal)', fontWeight: 600 }}>{other.label}</a> · {lang === 'id' ? 'Kontak: ' : 'Contact: '}<a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <PortalFooter />
    </div>
  );
};

export const PortalPrivacy = (props) => <LegalPage kind="privacy" {...props} />;
export const PortalTerms = (props) => <LegalPage kind="terms" {...props} />;
