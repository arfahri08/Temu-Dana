function tampilkanError(id, pesan) {
  const input = document.getElementById(id);
  const error = document.getElementById(`error-${id}`);

  if (!input || !error) {
    return;
  }

  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');
  error.textContent = pesan;
}

function hapusError(id) {
  const input = document.getElementById(id);
  const error = document.getElementById(`error-${id}`);

  if (!input || !error) {
    return;
  }

  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  error.textContent = '';
}

function normalisasi(nilai) {
  return String(nilai).trim().toLowerCase();
}

function hitungKecocokan(sponsor, profilAcara) {
  const jenisCocok = sponsor.eventTypes.map(normalisasi).includes(normalisasi(profilAcara.eventType));
  const targetCocok = sponsor.targetAudience.map(normalisasi).includes(normalisasi(profilAcara.targetAudience));
  const lokasiCocok = sponsor.locations.map(normalisasi).includes(normalisasi(profilAcara.location));
  const pesertaCocok = profilAcara.participants >= sponsor.minParticipants
    && profilAcara.participants <= sponsor.maxParticipants;
  const danaCocok = profilAcara.funding >= sponsor.fundingRange.min
    && profilAcara.funding <= sponsor.fundingRange.max;

  const faktor = [
    { cocok: jenisCocok, bobot: 30, sesuai: 'Jenis acara sesuai', tidak: 'Jenis acara tidak sesuai' },
    { cocok: targetCocok, bobot: 25, sesuai: 'Target peserta sesuai', tidak: 'Target peserta tidak sesuai' },
    { cocok: lokasiCocok, bobot: 20, sesuai: 'Lokasi sesuai', tidak: 'Lokasi tidak sesuai' },
    { cocok: pesertaCocok, bobot: 15, sesuai: 'Jumlah peserta sesuai', tidak: 'Jumlah peserta tidak sesuai' },
    { cocok: danaCocok, bobot: 10, sesuai: 'Kebutuhan dana sesuai', tidak: 'Kebutuhan dana tidak sesuai' }
  ];

  let score = 0;
  const reasons = faktor.map(function (item) {
    if (item.cocok) {
      score += item.bobot;
    }

    return {
      matched: item.cocok,
      text: item.cocok ? item.sesuai : item.tidak
    };
  });

  return { ...sponsor, score, reasons };
}

const formProfilAcara = document.getElementById('formProfilAcara');
const successMessage = document.getElementById('formSuccess');

if (formProfilAcara && successMessage) {
  const formInputs = formProfilAcara.querySelectorAll('.form-input');

  function validasiField(input) {
    const nilai = input.value.trim();

    if (nilai === '') {
      tampilkanError(input.id, 'Field ini wajib diisi.');
      return false;
    }

    if (input.id === 'lokasi') {
      if (nilai.length < 3) {
        tampilkanError(input.id, 'Lokasi minimal 3 karakter.');
        return false;
      }

      if (!/^[A-Za-zÀ-ÿ .'-]+$/.test(nilai)) {
        tampilkanError(input.id, 'Lokasi hanya boleh berisi huruf dan tanda baca sederhana.');
        return false;
      }
    }

    if (input.id === 'target-peserta' && nilai.length < 3) {
      tampilkanError(input.id, 'Target peserta minimal 3 karakter.');
      return false;
    }

    if (input.id === 'email-kontak' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nilai)) {
      tampilkanError(input.id, 'Masukkan format email yang valid.');
      return false;
    }

    if (input.id === 'jumlah-peserta') {
      const jumlah = Number(nilai);
      if (jumlah < 10 || jumlah > 10000) {
        tampilkanError(input.id, 'Jumlah peserta harus antara 10 dan 10.000.');
        return false;
      }
    }

    if (input.id === 'kebutuhan-dana') {
      const dana = Number(nilai);
      if (dana < 100000 || dana > 1000000000) {
        tampilkanError(input.id, 'Kebutuhan dana harus antara Rp100.000 dan Rp1.000.000.000.');
        return false;
      }
    }

    hapusError(input.id);
    return true;
  }

  formInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      validasiField(input);
      successMessage.hidden = true;
    });
  });

  formProfilAcara.addEventListener('submit', async function (event) {
    event.preventDefault();
    let valid = true;

    formProfilAcara.classList.add('was-validated');

    formInputs.forEach(function (input) {
      if (!validasiField(input)) {
        valid = false;
      }
    });

    if (!valid) {
      successMessage.hidden = true;
      return;
    }

    const profilAcara = {
      eventType: document.getElementById('jenis-acara').value,
      location: document.getElementById('lokasi').value,
      targetAudience: document.getElementById('target-peserta').value,
      participants: Number(document.getElementById('jumlah-peserta').value),
      funding: Number(document.getElementById('kebutuhan-dana').value)
    };

    successMessage.classList.remove('form-status-error');
    successMessage.textContent = 'Mencari sponsor yang paling sesuai...';
    successMessage.hidden = false;

    try {
      const response = await fetch('sponsors.json');
      if (!response.ok) {
        throw new Error('Data sponsor tidak dapat dimuat.');
      }

      const sponsors = await response.json();
      const matchingResults = sponsors.map(function (sponsor) {
        return hitungKecocokan(sponsor, profilAcara);
      }).sort(function (a, b) {
        return b.score - a.score;
      });

      sessionStorage.setItem('eventProfile', JSON.stringify(profilAcara));
      sessionStorage.setItem('matchingResults', JSON.stringify(matchingResults));
      successMessage.textContent = 'Pencocokan selesai. Membuka hasil...';
      formProfilAcara.reset();
      formProfilAcara.classList.remove('was-validated');
      formInputs.forEach(function (input) {
        hapusError(input.id);
      });
      window.location.href = 'hasil-pencocokan.html';
    } catch (error) {
      successMessage.classList.add('form-status-error');
      successMessage.textContent = error.message;
    }
  });
}
