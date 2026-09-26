const alertOverlay = document.querySelector('.alert-overlay');
const closeAlertButton = document.getElementById('closeAlert');
const closeAlertAction = document.getElementById('closeAlertAction');

if (alertOverlay && closeAlertButton && closeAlertAction) {
  function tutupAlert() {
    alertOverlay.style.display = 'none';
  }

  closeAlertButton.addEventListener('click', tutupAlert);
  closeAlertAction.addEventListener('click', tutupAlert);
  alertOverlay.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      tutupAlert();
    }
  });
  closeAlertButton.focus();
}
