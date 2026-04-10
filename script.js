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


document.querySelectorAll(".agent-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedAgent = btn.dataset.agent;
    document.querySelectorAll(".agent-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});


document.querySelectorAll(".currency-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCurrency = btn.dataset.currency;
    document.querySelectorAll(".currency-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});


namaInput.addEventListener("input", () => {
  namaInput.value = namaInput.value.replace(/[^a-zA-Z\s]/g, "");
});

function bindInput(el, allowDecimal = false) {
  el.addEventListener("input", () => {
    if (allowDecimal) {
      el.value = el.value.replace(/[^0-9.]/g, "");
      el.value = el.value.replace(/(\..*)\./g, "$1");
    } else {
      el.value = el.value.replace(/[^0-9]/g, "");
    }

    hitung();
  });
}

bindInput(rateInput, false);
bindInput(usdInput, true);  
bindInput(modalInput, false);


function formatRupiah(angka) {
  return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function formatDollar(angka) {
  return "$" + Number(angka || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2
  });
}


function hitung() {
  const rate = parseFloat(rateInput.value) || 0;
  const usd = parseFloat(usdInput.value) || 0;
  const modal = parseFloat(modalInput.value) || 0;

  const totalRupiah = rate * usd;
  const profit = totalRupiah - (modal * usd);

  totalRupiahInput.value = formatRupiah(totalRupiah);

  if (profit < 0) {
    profitInput.style.color = "red";
    profitInput.style.fontWeight = "bold";
    profitInput.value = "⚠ " + formatRupiah(profit);
  } else {
    profitInput.style.color = "lime";
    profitInput.style.fontWeight = "bold";
    profitInput.value = formatRupiah(profit);
  }

  if (modal * usd > totalRupiah) {
    totalRupiahInput.style.color = "orange";
  } else {
    totalRupiahInput.style.color = "white";
  }
}


const SHEET_URL = "https://script.google.com/macros/s/AKfycbzORBPb6gqDSe2iwXjYGYU9BIGIELSFy-yM9srjvv0n8CnzHTkKLgvBKveq2N2dMIqx1Q/exec";


async function loadPendingForms() {
  try {
    const res = await fetch(SHEET_URL + "?action=getAll");
    const data = await res.json();

    dashboardBody.innerHTML = "";
    data.forEach(addToDashboard);
  } catch (err) {
    console.error("Gagal load Pending Form:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadPendingForms);


form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!selectedAgent || !selectedCurrency) {
    return alert("Pilih agent & currency dulu!");
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Mengirim...";

  const now = new Date();

  const data = {
    tanggal: now.toISOString(),
    jam: now.toLocaleTimeString("id-ID"),
    nama: namaInput.value,
    rate: rateInput.value,
    totalDollar: usdInput.value,
    agent: selectedAgent,
    currency: selectedCurrency,
    modal: modalInput.value
  };

  try {
await fetch(SHEET_URL, {
  method: "POST",
  mode: "no-cors",
  body: new URLSearchParams(data)
});

    addToDashboard({
      TANGGAL: now,
      NAMA: data.nama,
      RATE: data.rate,
      "TOTAL DOLLAR": data.totalDollar,
      "TOTAL RUPIAH": data.rate * data.totalDollar,
      MODAL: data.modal
    });

    form.reset();
    selectedAgent = "";
    selectedCurrency = "";

    document.querySelectorAll(".active").forEach(b => b.classList.remove("active"));

    totalRupiahInput.value = "";
    profitInput.value = "";

  } catch (err) {
    alert("Gagal mengirim data");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Kirim";
  }
});


function addToDashboard(d) {
  const tr = document.createElement("tr");

  const tanggal = new Date(d.TANGGAL);
  const safeTanggal = isNaN(tanggal.getTime())
    ? "-"
    : tanggal.toLocaleDateString("id-ID");

  tr.innerHTML = `
    <td>${safeTanggal}</td>
    <td>${d.NAMA || "-"}</td>
    <td>${formatRupiah(d.RATE)}</td>
    <td>${formatDollar(d["TOTAL DOLLAR"])}</td>
    <td>${formatRupiah(d["TOTAL RUPIAH"])}</td>
  `;

  dashboardBody.appendChild(tr);
}
