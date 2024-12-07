function showSonterraLocation() {
  //   const mapHtmlText =
  // '';
  //   const mapElement = document.createElement('iframe');
  //   mapElement.src =
  //     'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d4955.586765245282!2d73.74543873721983!3d18.505275100167598!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bdd8f1c4f3ad%3A0xac3cc5bf543c7ae9!2sSonterra%20Studios!5e0!3m2!1sen!2sin!4v1728847914026!5m2!1sen!2sin';
  //   mapElement.width = 600;
  //   mapElement.height = 450;
  //   mapElement.style.border = '0';
  //   mapElement.allowfullscreen = 'true';
  //   mapElement.loading = 'lazy';
  //   mapElement.referrerpolicy = 'no-referrer-when-downgrade';
  //   const googleMapElement = document.querySelector('.google-map');
  //   googleMapElement.appendChild(mapElement);
  const showDetailsButtonContainer = document.querySelector('#prewedding-map');
  showDetailsButtonContainer.classList.add('show');
}

function openModal() {
  const modal = document.querySelector('.modal');
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.querySelector('.modal');
  modal.classList.remove('show');
}

const modalCloseButton = document.querySelector('.modal .close-button');
modalCloseButton.addEventListener('click', closeModal);

const showDetailsButton = document.querySelector('#prewedding-map button');
showDetailsButton.addEventListener('click', openModal);

(function () {
  if (window.location.search.includes('showPreweddingDetails=true')) {
    showSonterraLocation();
  }
})();

/* TODO: check for showPreweddingDetails=true in search to add a modal and a button to show those details. */
