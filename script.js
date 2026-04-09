const form = document.getElementById("transaksi-form");
const namaInput = document.getElementById("nama");
const rateInput = document.getElementById("rate");
const usdInput = document.getElementById("usd");
const modalInput = document.getElementById("modal");
const totalRupiahInput = document.getElementById("total-rupiah");
const profitInput = document.getElementById("profit");
const dashboardBody = document.querySelector("#dashboard tbody");
const submitBtn = document.getElementById("submit-btn");

let selectedAgent = "";
let selectedCurrency = "";

// Agent button click
const agentBtns = document.querySelectorAll(".agent-btn");
agentBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedAgent = btn.dataset.agent;
    agentBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Currency button click
const currencyBtns = document.querySelectorAll(".currency-btn");
currencyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCurrency = btn.dataset.currency;
    currencyBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Validasi nama hanya huruf & spasi
namaInput.addEventListener("input", () => {
  namaInput.value = namaInput.value.replace(/[^a-zA-Z\s]/g, "");
});

// Validasi angka
[rateInput, usdInput, modalInput].forEach(inp => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/[^0-9]/g, "");
    hitungRupiahProfit();
  });
});

// Format Rupiah
function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

// Format Dollar
function formatDollar(angka) {
  return "$" + Number(angka).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

// Hitung Total Rupiah & Profit
function hitungRupiahProfit() {
  const rate = Number(rateInput.value) || 0;
  const totalDollar = Number(usdInput.value) || 0;
  const modal = Number(modalInput.value) || 0;

  const totalRupiah = rate * totalDollar;
  const profit = totalRupiah - (modal * totalDollar);

  totalRupiahInput.value = formatRupiah(totalRupiah);
  profitInput.value = formatRupiah(profit);
}

// ======================
// Endpoint Google Apps Script
// ======================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzORBPb6gqDSe2iwXjYGYU9BIGIELSFy-yM9srjvv0n8CnzHTkKLgvBKveq2N2dMIqx1Q/exec";

// Load Pending Form dari Sheet
async function loadPendingForms() {
  try {
    const res = await fetch(SHEET_URL + "?action=getAll");
    const data = await res.json();
    data.forEach(d => addToDashboard(d));
  } catch (err) {
    console.error("Gagal load Pending Form:", err);
  }
}

// Jalankan waktu page load
document.addEventListener("DOMContentLoaded", loadPendingForms);

// ======================
// Submit
// ======================
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!selectedAgent || !selectedCurrency) {
    return alert("Pilih agent & currency dulu!");
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Mengirim...";

  const tanggal = new Date();
  const data = {
    tanggal: tanggal.toLocaleDateString("id-ID"),
    jam: tanggal.toLocaleTimeString("id-ID"),
    nama: namaInput.value,
    rate: rateInput.value,
    totalDollar: usdInput.value,
    agent: selectedAgent,
    currency: selectedCurrency,
    modal: modalInput.value
  };

  try {
    // Kirim ke Apps Script
    await fetch(SHEET_URL + "?" + new URLSearchParams(data), {
      method: "POST",
      mode: "no-cors"
    });

    // Update tabel di page
    addToDashboard({
      TANGGAL: data.tanggal,
      JAM: data.jam,
      NAMA: data.nama,
      RATE: Number(data.rate),
      "TOTAL DOLLAR": Number(data.totalDollar),
      AGENT: data.agent,
      "TOTAL RUPIAH": Number(data.rate) * Number(data.totalDollar),
      CURRENCY: data.currency,
      MODAL: Number(data.modal),
      PROFIT: (Number(data.rate) * Number(data.totalDollar)) - (Number(data.modal) * Number(data.totalDollar))
    });

    form.reset();
    agentBtns.forEach(b => b.classList.remove("active"));
    currencyBtns.forEach(b => b.classList.remove("active"));
    selectedAgent = "";
    selectedCurrency = "";
    totalRupiahInput.value = "";
    profitInput.value = "";
  } catch {
    alert("Gagal mengirim data");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Kirim";
  }
});

// ======================
// Tambah ke tabel Pending Form
// ======================
function addToDashboard(d) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${d.TANGGAL}</td>
    <td>${d.JAM}</td>
    <td>${d.NAMA}</td>
    <td>${formatRupiah(d.RATE)}</td>
    <td>${formatDollar(d["TOTAL DOLLAR"])}</td>
    <td>${d.AGENT}</td>
    <td>${formatRupiah(d["TOTAL RUPIAH"])}</td>
    <td>${d.CURRENCY}</td>
    <td>${formatRupiah(d.MODAL)}</td>
    <td>${formatRupiah(d.PROFIT)}</td>
  `;
  dashboardBody.appendChild(tr);
}
