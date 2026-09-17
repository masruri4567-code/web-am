// Remove startup loader after 2.5s
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('startup-loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startup-loader').style.display = 'none';
        }, 500);
    }, 2500);
});

// Runtime logic
let startTime = Date.now();
setInterval(() => {
    // Clock
    const now = new Date();
    document.getElementById('current-date').innerText = now.toLocaleDateString('id-ID');
    document.getElementById('current-time').innerText = now.toLocaleTimeString('id-ID');

    // Bot Runtime
    let diff = Math.floor((Date.now() - startTime) / 1000);
    let h = Math.floor(diff / 3600).toString().padStart(2, '0');
    let m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    let s = (diff % 60).toString().padStart(2, '0');
    document.getElementById('runtime-counter').innerText = `${h}:${m}:${s}`;
}, 1000);

// Tabs Logic
const tabBiasa = document.getElementById('tab-biasa');
const tabBulk = document.getElementById('tab-bulk');
const secBiasa = document.getElementById('section-biasa');
const secBulk = document.getElementById('section-bulk');

tabBiasa.addEventListener('click', () => {
    tabBiasa.classList.add('active'); tabBulk.classList.remove('active');
    secBiasa.classList.remove('hidden'); secBulk.classList.add('hidden');
});
tabBulk.addEventListener('click', () => {
    tabBulk.classList.add('active'); tabBiasa.classList.remove('active');
    secBulk.classList.remove('hidden'); secBiasa.classList.add('hidden');
});

// Bulk Buttons Selection
let selectedBulk = 1;
document.querySelectorAll('.bulk-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.bulk-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedBulk = e.target.getAttribute('data-val');
    });
});

// Logger helper
function logMsg(msg) {
    document.getElementById('log-output').innerHTML = `> ${msg}<br>` + document.getElementById('log-output').innerHTML;
}
function toggleLoading(show) {
    const loader = document.getElementById('action-loader');
    if(show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

// Mode Biasa Actions
async function sendLink() {
    const email = document.getElementById('input-email').value;
    if(!email) return alert('Masukkan email dulu!');
    
    toggleLoading(true);
    logMsg(`Mencoba mengirim link ke ${email}...`);
    try {
        const res = await fetch('/api/send-link', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email})
        });
        const data = await res.json();
        if(data.success) {
            logMsg(`[SUCCESS] Link terkirim ke ${email}. Cek inbox.`);
            document.getElementById('verify-area').classList.remove('hidden');
        } else {
            logMsg(`[ERROR] ${data.error}`);
        }
    } catch(e) {
        logMsg(`[ERROR] Koneksi bermasalah.`);
    }
    toggleLoading(false);
}

async function processPremium() {
    const email = document.getElementById('input-email').value;
    const link = document.getElementById('input-link').value;
    if(!link) return alert('Masukkan link verify dulu!');

    toggleLoading(true);
    logMsg(`Memproses link verifikasi...`);
    try {
        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email, link})
        });
        const data = await res.json();
        if(data.success) {
            logMsg(`[SUCCESS] Akun berhasil Premium! Order ID: ${data.codeorder || 'N/A'}`);
        } else {
            logMsg(`[ERROR] ${data.error}`);
        }
    } catch(e) {
        logMsg(`[ERROR] Gagal memproses premium.`);
    }
    toggleLoading(false);
}

// Mode Bulk Action
async function startBulk() {
    toggleLoading(true);
    logMsg(`Memulai Bulk Mode untuk ${selectedBulk} akun...`);
    try {
        const res = await fetch('/api/bulk', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({count: selectedBulk})
        });
        const data = await res.json();
        if(data.success) {
            data.accounts.forEach((acc, i) => {
                if(acc.error) logMsg(`[ACC ${i+1}] Gagal: ${acc.error}`);
                else logMsg(`[ACC ${i+1}] ${acc.email} - ${acc.status}`);
            });
            logMsg(`[SUCCESS] Bulk mode selesai dijalankan.`);
        } else {
            logMsg(`[ERROR] ${data.error}`);
        }
    } catch(e) {
        logMsg(`[ERROR] Terjadi kesalahan saat bulk generator.`);
    }
    toggleLoading(false);
}
