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

const agentBtns = document.querySelectorAll(".agent-btn");
agentBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedAgent = btn.dataset.agent;
    agentBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

const currencyBtns = document.querySelectorAll(".currency-btn");
currencyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCurrency = btn.dataset.currency;
    currencyBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Validasi input
namaInput.addEventListener("input", () => {
  namaInput.value = namaInput.value.replace(/[^a-zA-Z\s]/g, "");
});

[rateInput, usdInput, modalInput].forEach(inp => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/[^0-9]/g, "");
    hitungRupiahProfit();
  });
});

function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function formatDollar(angka) {
  return "$" + Number(angka).toLocaleString("en-US", {minimumFractionDigits: 2});
}

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
// Load Pending Form dari Sheet
// ======================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbx4gVn44H1NfrGr3gwS23B2BZaCH45POihRtli9V54-APx2SrCBeeuuXpWhEgl9b6jfNg/exec";

async function loadPendingForms() {
  try {
    const res = await fetch(SHEET_URL + "?action=getAll");
    const data = await res.json();
    data.forEach(d => addToDashboard(d));
  } catch (err) {
    console.error("Gagal load Pending Form:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadPendingForms);

// ======================
// Submit Form
// ======================
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!selectedAgent || !selectedCurrency) return alert("Pilih agent & currency dulu!");

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
    await fetch(SHEET_URL + "?" + new URLSearchParams(data), { method: "POST", mode: "no-cors" });
    addToDashboard(data); // langsung update tabel di page
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
  const rate = Number(d.rate);
  const totalDollar = Number(d.totalDollar);
  const modal = Number(d.modal);
  const totalRupiah = rate * totalDollar;
  const profit = totalRupiah - (modal * totalDollar);

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${d.tanggal}</td>
    <td>${d.jam}</td>
    <td>${d.nama}</td>
    <td>${formatRupiah(rate)}</td>
    <td>${formatDollar(totalDollar)}</td>
    <td>${d.agent}</td>
    <td>${formatRupiah(totalRupiah)}</td>
    <td>${d.currency}</td>
    <td>${formatRupiah(modal)}</td>
    <td>${formatRupiah(profit)}</td>
  `;
  dashboardBody.appendChild(tr);
}
