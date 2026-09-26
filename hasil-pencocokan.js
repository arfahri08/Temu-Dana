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
    image.alt = `Logo ${hasil.name}`;
    image.width = 36;
    image.height = 36;
    image.decoding = 'async';
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

tampilkanHasilMatching();
