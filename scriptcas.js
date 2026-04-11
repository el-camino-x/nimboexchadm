const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQIv9Jb0dWGFAVR70H9m9SQmSSUsFZuexWIcRWfZc-vBGqDTk1aJD1LykGVtCGw1A_/exec";

const form = document.getElementById("casbon-form");

const nama = document.getElementById("nama");
const rate = document.getElementById("rate");
const usd = document.getElementById("usd");
const bunga = document.getElementById("bunga");
const jatuhTempo = document.getElementById("jatuh-tempo");

const tanggal = document.getElementById("tanggal");
const jam = document.getElementById("jam");

const totalRupiah = document.getElementById("total-rupiah");
const totalBunga = document.getElementById("total-bunga");
const totalBayar = document.getElementById("total-bayar");

const usdBtn = document.getElementById("usd-btn");
const rielBtn = document.getElementById("riel-btn");

const dashboard = document.querySelector("#dashboard tbody");
const submitBtn = document.querySelector("button[type='submit']");

let currency = "USD";
let isLoading = false;

// ================= TIME =================
function updateTime() {
  const now = new Date();
  tanggal.value = now.toLocaleDateString("id-ID");
  jam.value = now.toLocaleTimeString("id-ID");
}
setInterval(updateTime, 1000);
updateTime();

// ================= FORMAT UANG =================
function formatRupiah(val) {
  const num = parseInt(String(val).replace(/[^0-9]/g, "")) || 0;
  return "Rp " + num.toLocaleString("id-ID");
}

function formatDollar(val) {
  const num = parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
  return "$ " + num.toLocaleString("en-US");
}

// ================= FORMAT BUNGA (🔥 FIX 0.1 → 10%) =================
function formatBunga(val) {
  if (!val) return "-";

  let str = String(val).trim();

  // kalau sudah ada %
  if (str.includes("%")) return str;

  let num = parseFloat(str);

  if (isNaN(num)) return "-";

  // 0.1 → 10%
  if (num > 0 && num < 1) {
    return (num * 100) + "%";
  }

  return num + "%";
}

// ================= FORMAT TANGGAL =================
function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ================= INPUT VALIDATION =================
nama.addEventListener("input", () => {
  nama.value = nama.value.replace(/[^a-zA-Z\s]/g, "");
});

rate.addEventListener("input", () => {
  let val = rate.value.replace(/[^0-9]/g, "");
  rate.value = val ? "Rp " + Number(val).toLocaleString("id-ID") : "";
});

usd.addEventListener("input", () => {
  let val = usd.value.replace(/[^0-9.]/g, "");
  usd.value = val ? "$ " + Number(val).toLocaleString("en-US") : "";
});

bunga.addEventListener("input", () => {
  let val = bunga.value.replace(/[^0-9.]/g, "");
  bunga.value = val ? val + "%" : "";
});

// ================= CURRENCY =================
usdBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  currency = "USD";
  usdBtn.classList.add("active");
  rielBtn.classList.remove("active");
});

rielBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  currency = "RIEL";
  rielBtn.classList.add("active");
  usdBtn.classList.remove("active");
});

// ================= HITUNG =================
function hitung() {
  const r = parseFloat(rate.value.replace(/[^0-9]/g, "")) || 0;
  const u = parseFloat(usd.value.replace(/[^0-9.]/g, "")) || 0;
  const b = parseFloat(bunga.value.replace(/[^0-9.]/g, "")) || 0;

  const rp = r * u;
  const bungaVal = rp * (b / 100);
  const total = rp + bungaVal;

  totalRupiah.value = formatRupiah(rp);
  totalBunga.value = formatRupiah(bungaVal);
  totalBayar.value = formatRupiah(total);
}

[rate, usd, bunga].forEach(el => el.addEventListener("input", hitung));

// ================= VALID =================
function isValid() {
  return nama.value && rate.value && usd.value && bunga.value && jatuhTempo.value;
}

// ================= LOAD TABLE =================
async function loadCasbon() {
  try {
    const res = await fetch(SCRIPT_URL + "?action=getCasbon");
    const text = await res.text();

    let data = [];
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = [];
    }

    if (!Array.isArray(data)) data = [];

    dashboard.innerHTML = "";

    data.forEach(d => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${formatDate(d.tanggal)}</td>
        <td>${d.nama || "-"}</td>
        <td>${formatRupiah(d.rate)}</td>
        <td>${formatDollar(d.totalDollar)}</td>
        <td>${formatBunga(d.bunga)}</td>
        <td>${formatRupiah(d.totalBunga)}</td>
        <td>${formatRupiah(d.totalBayar)}</td>
      `;

      dashboard.appendChild(tr);
    });

  } catch (err) {
    console.log("LOAD ERROR:", err);
  }
}

// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isLoading) return;
  if (!isValid()) return alert("Semua field wajib diisi!");

  isLoading = true;
  submitBtn.disabled = true;
  submitBtn.innerText = "Mengirim...";

  const bungaValue = bunga.value.replace(/[^0-9.]/g, "");

  const data = {
    tanggal: tanggal.value,
    jam: jam.value,
    nama: nama.value,
    rate: rate.value,
    totalDollar: usd.value,
    currency,
    totalRupiah: totalRupiah.value,
    bunga: bungaValue + "%",
    totalBunga: totalBunga.value,
    totalBayar: totalBayar.value,
    jatuhTempo: jatuhTempo.value
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(data)
    });

    form.reset();
    updateTime();

    setTimeout(loadCasbon, 900);

    alert("CASBON TERKIRIM ✔");

  } catch (err) {
    alert("Gagal kirim data");
  }

  submitBtn.disabled = false;
  submitBtn.innerText = "KIRIM CASBON";
  isLoading = false;
});

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  updateTime();
  loadCasbon();
});
