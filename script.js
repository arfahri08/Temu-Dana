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

function buatInisial(nama) {
  return nama.split(' ').slice(0, 2).map(function (kata) {
    return kata.charAt(0);
  }).join('').toUpperCase();
}

function buatKartuSponsor(hasil) {
  const card = document.createElement('article');
  card.className = 'card card-hover';

  const cardTop = document.createElement('div');
  cardTop.className = 'sponsor-card-top';

  const brand = document.createElement('div');
  brand.className = 'sponsor-brand';

  const logo = document.createElement('div');
  logo.className = 'sponsor-logo';

  if (hasil.logo) {
    const image = document.createElement('img');
    image.src = hasil.logo;
    image.alt = hasil.name;
    logo.appendChild(image);
  } else {
    logo.classList.add('sponsor-logo-initials');
    logo.textContent = buatInisial(hasil.name);
  }

  const identity = document.createElement('div');
  const name = document.createElement('h2');
  name.className = 'text-heading sponsor-name';
  name.textContent = hasil.name;
  const category = document.createElement('p');
  category.className = 'text-body sponsor-category';
  category.textContent = hasil.category;
  identity.append(name, category);
  brand.append(logo, identity);

  const score = document.createElement('span');
  score.className = 'badge';
  score.classList.add(hasil.score >= 75 ? 'bg-sangat-cocok' : hasil.score >= 50 ? 'bg-cocok' : 'bg-tidak-cocok');
  score.textContent = `${hasil.score}% Kecocokan`;
  cardTop.append(brand, score);

  const divider = document.createElement('hr');
  divider.className = 'divider-sm';

  const reasonList = document.createElement('ul');
  reasonList.className = 'list-check';
  hasil.reasons.forEach(function (reason) {
    const item = document.createElement('li');
    item.className = reason.matched ? 'pos' : 'neg';
    const icon = document.createElement('span');
    icon.textContent = reason.matched ? '✓' : '✕';
    item.append(icon, document.createTextNode(reason.text));
    reasonList.appendChild(item);
  });

  const footer = document.createElement('div');
  footer.className = 'sponsor-card-footer';
  const link = document.createElement('a');
  link.className = 'detail-link';
  link.href = hasil.detailPage || `mailto:${hasil.contact}`;
  link.textContent = hasil.detailPage ? 'Detail →' : 'Hubungi →';
  footer.appendChild(link);

  card.append(cardTop, divider, reasonList, footer);
  return card;
}

function tampilkanHasilMatching() {
  const resultContainer = document.getElementById('matchingResults');
  const summary = document.getElementById('matchingSummary');
  const emptyState = document.getElementById('emptyMatching');

  if (!resultContainer || !summary || !emptyState) {
    return;
  }

  const savedResults = sessionStorage.getItem('matchingResults');
  resultContainer.replaceChildren();

  if (!savedResults) {
    summary.textContent = 'Belum ada profil acara untuk dicocokkan.';
    emptyState.hidden = false;
    return;
  }

  let matchingResults;
  try {
    matchingResults = JSON.parse(savedResults).filter(function (hasil) {
      return hasil.score >= 40;
    });
  } catch (error) {
    sessionStorage.removeItem('matchingResults');
    summary.textContent = 'Data hasil pencocokan tidak dapat dibaca.';
    emptyState.hidden = false;
    return;
  }

  if (matchingResults.length === 0) {
    summary.textContent = 'Tidak ada sponsor yang mencapai batas kecocokan 40%.';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  summary.textContent = `${matchingResults.length} sponsor paling relevan untuk acara kamu.`;
  matchingResults.forEach(function (hasil) {
    resultContainer.appendChild(buatKartuSponsor(hasil));
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.getElementById('main-navigation');

if (menuToggle && mainNavigation) {
  menuToggle.addEventListener('click', function () {
    const terbuka = mainNavigation.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(terbuka));
    menuToggle.setAttribute('aria-label', terbuka ? 'Tutup navigasi' : 'Buka navigasi');
  });

  const navigationLinks = document.querySelectorAll('.main-nav .nav-item');
  navigationLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mainNavigation.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Buka navigasi');
    });
  });
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

tampilkanHasilMatching();

const profilForm = document.getElementById('profil-form');
const tombolSimpan = document.getElementById('btn-simpan');

if (profilForm && tombolSimpan) {
  const profilInputs = profilForm.querySelectorAll('input');

  function cekFormProfil() {
    let lengkap = true;
    profilInputs.forEach(function (input) {
      if (input.value.trim() === '') {
        lengkap = false;
      }
    });
    tombolSimpan.disabled = !lengkap;
  }

  profilInputs.forEach(function (input) {
    input.addEventListener('input', cekFormProfil);
  });

  profilForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const nama = document.getElementById('nama');
    const email = document.getElementById('email');
    const displayNama = document.getElementById('display-nama');
    const displayEmail = document.getElementById('display-email');

    if (nama && email && displayNama && displayEmail && email.checkValidity()) {
      displayNama.textContent = nama.value.trim();
      displayEmail.textContent = email.value.trim();
    }
  });
}

const alertOverlay = document.querySelector('.alert-overlay');
const closeAlertButton = document.getElementById('closeAlert');
const closeAlertAction = document.getElementById('closeAlertAction');

if (alertOverlay && closeAlertButton && closeAlertAction) {
  function tutupAlert() {
    alertOverlay.style.display = 'none';
  }

  closeAlertButton.addEventListener('click', tutupAlert);
  closeAlertAction.addEventListener('click', tutupAlert);
}
