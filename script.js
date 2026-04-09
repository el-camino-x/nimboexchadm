document.getElementById('submitBtn').addEventListener('click', submitTransaction);

function submitTransaction() {
  const nama = document.getElementById('nama').value;
  const rate = document.getElementById('rate').value;
  const usd = document.getElementById('usd').value;
  const agent = document.getElementById('agent').value;
  const currency = document.getElementById('currency').value;

  if (!nama || !rate || !usd) {
    alert("Isi semua dulu bosku!");
    return;
  }

  const now = new Date();
  const tanggal = now.toLocaleDateString();
  const jam = now.toLocaleTimeString();

  const params = new URLSearchParams();
  params.append("tanggal", tanggal);
  params.append("jam", jam);
  params.append("nama", nama);
  params.append("rate", rate);
  params.append("usd", usd);
  params.append("agent", agent);
  params.append("currency", currency);

  fetch("https://script.google.com/macros/s/AKfycbzMq8atd8BLQc51ZW3U1lfQFaIw-zd52LUiSVBsjMUoZM21z0XdQNSryaeXBoe_f5pLkw/exec", {
    method: "POST",
    body: params
  })
  .then(() => {
    alert("Tersimpan! Cek sheet PENDING lu.");
    location.reload();
  });
}
