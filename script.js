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

  formProfilAcara.addEventListener('submit', function (event) {
    event.preventDefault();
    let valid = true;

    formProfilAcara.classList.add('was-validated');

    formInputs.forEach(function (input) {
      if (!validasiField(input)) {
        valid = false;
      }
    });

    if (valid) {
      successMessage.textContent = 'Profil acara berhasil disimpan. Pencarian sponsor siap dilakukan.';
      successMessage.hidden = false;
      formProfilAcara.reset();
      formProfilAcara.classList.remove('was-validated');
      formInputs.forEach(function (input) {
        hapusError(input.id);
      });
    } else {
      successMessage.hidden = true;
    }
  });
}

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
