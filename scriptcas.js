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
const submitBtn = form.querySelector("button[type='submit']");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6YBrm1f57y61opAjsYeDbkwc3cmxnFPN3CrJPrwwqFTza-D3Mut4q8xxAaIeFxnbN/exec";

let currency = "USD";

// ================= TIME =================
function updateTime() {
  const now = new Date();
  tanggal.value = now.toLocaleDateString("id-ID");
  jam.value = now.toLocaleTimeString("id-ID");
}

setInterval(updateTime, 1000);
updateTime();

// ================= FORMAT =================
function formatRupiah(num) {
  return "Rp. " + Number(num || 0).toLocaleString("id-ID");
}

// ================= INPUT VALIDATION =================

// nama only letters
nama.addEventListener("input", () => {
  nama.value = nama.value.replace(/[^a-zA-Z\s]/g, "");
});

// rate format Rp.
rate.addEventListener("input", () => {
  let val = rate.value.replace(/[^0-9]/g, "");

  if (!val) {
    rate.value = "";
    return;
  }

  rate.value = "Rp. " + Number(val).toLocaleString("id-ID");
});

// usd format $
usd.addEventListener("input", () => {
  let val = usd.value.replace(/[^0-9.]/g, "");

  if (!val) {
    usd.value = "";
    return;
  }

  usd.value = "$ " + Number(val).toLocaleString("en-US");
});

// bunga %
bunga.addEventListener("input", () => {
  let val = bunga.value.replace(/[^0-9]/g, "");
  bunga.value = val ? val + "%" : "";
});

// ================= CURRENCY TOGGLE =================
usdBtn.addEventListener("click", () => {
  currency = "USD";
  usdBtn.classList.add("active");
  rielBtn.classList.remove("active");
});

rielBtn.addEventListener("click", () => {
  currency = "RIEL";
  rielBtn.classList.add("active");
  usdBtn.classList.remove("active");
});

// ================= HITUNG =================
function hitung() {
  const r = parseFloat(rate.value.replace(/[^0-9]/g, "")) || 0;
  const u = parseFloat(usd.value.replace(/[^0-9.]/g, "")) || 0;
  const b = parseFloat(bunga.value.replace(/[^0-9]/g, "")) || 0;

  const rp = r * u;
  const bungaVal = rp * (b / 100);

  totalRupiah.value = formatRupiah(rp);
  totalBunga.value = formatRupiah(bungaVal);
  totalBayar.value = formatRupiah(rp + bungaVal);
}

[rate, usd, bunga].forEach(el => {
  el.addEventListener("input", hitung);
});

// ================= VALIDATION =================
function isValidForm() {
  const namaVal = nama.value.trim();
  const rateVal = rate.value.replace(/[^0-9]/g, "");
  const usdVal = usd.value.replace(/[^0-9.]/g, "");
  const bungaVal = bunga.value.replace(/[^0-9]/g, "");
  const tempoVal = jatuhTempo.value;

  return namaVal && rateVal && usdVal && bungaVal && tempoVal;
}

// ================= TABLE =================
function addRow(d) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${d.tanggal}</td>
    <td>${d.jam}</td>
    <td>${d.nama}</td>
    <td>${d.rate}</td>
    <td>${d.totalDollar}</td>
    <td>${d.currency}</td>
    <td>${d.totalRupiah}</td>
    <td>${d.bunga}</td>
    <td>${d.totalBayar}</td>
    <td>${d.jatuhTempo}</td>
  `;

  dashboard.prepend(tr);
}

// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isValidForm()) {
    alert("⚠ SEMUA FIELD WAJIB DIISI!");
    return;
  }

  // ================= LOCK BUTTON =================
  submitBtn.disabled = true;
  submitBtn.innerText = "LOADING...";

  try {
    const data = {
      tanggal: tanggal.value,
      jam: jam.value,
      nama: nama.value,
      rate: rate.value,
      totalDollar: usd.value,
      currency: currency,
      totalRupiah: totalRupiah.value,
      bunga: bunga.value,
      totalBunga: totalBunga.value,
      totalBayar: totalBayar.value,
      jatuhTempo: jatuhTempo.value
    };

    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(data)
    });

    addRow(data);

    alert("CASBON TERKIRIM ✔");

    form.reset();
    updateTime();

  } catch (err) {
    alert("GAGAL KIRIM ❌");
  } finally {
    // ================= UNLOCK BUTTON =================
    submitBtn.disabled = false;
    submitBtn.innerText = "KIRIM CASBON";
  }
});
