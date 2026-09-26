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
