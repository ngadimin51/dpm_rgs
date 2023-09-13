'use strict'
const socket = io(window.location.origin)

const arrayLevel = ['staff','site logistic','site engineer','site hse','site manager','project manager','cost controll','hse officer','purchasing','director','po','finance','payment','logistic']

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    if (response.redirected) {
      return location.reload()
    }
    return response.json()
}

async function putData(url = '', data = {}) {
  const response = await fetch(url, {
      method: 'PUT', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  if (response.redirected) {
    return location.reload()
  }
  return response.json()
}

async function deleteData(url = '', data = {}) {
  const response = await fetch(url, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  if (response.redirected) {
    return location.reload()
  }
  return response.json()
}

function toastSuccess(text, destination) {
  Toastify({
      text,
      duration: 3000,
      destination,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      backgroundColor: "linear-gradient(90deg, rgba(73,226,98,1) 0%, rgba(38,172,0,1) 100%)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
      onClick: function(){} // Callback after click
  }).showToast();
}

function toastFailed(text, destination) {
  Toastify({
      text,
      duration: 5000,
      destination,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      backgroundColor: "linear-gradient(90deg, rgba(182,98,38,1) 0%, rgba(155,23,0,1) 100%)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
      onClick: function(){} // Callback after click
  }).showToast();
}

function toastWarning(text, destination) {
  Toastify({
      text,
      duration: 3000,
      destination,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      backgroundColor: "linear-gradient(90deg, rgba(255,106,0,1) 0%, rgba(251,219,0,1) 100%)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
      onClick: function(){} // Callback after click
  }).showToast();
}

function closeModal(id) {
  const modal = document.getElementById(id);
      // change state like in hidden modal
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('style', 'display: none');

      // get modal backdrop
      const modalBackdrops = document.getElementsByClassName('modal-backdrop');

      // remove opened modal backdrop
      document.body.removeChild(modalBackdrops[0]);
}

var localStorageSpace = function(){
  var data = '';

  //console.log('-------------------------------------\nCurrent local storage: ');

  for(var key in window.localStorage){

      if(window.localStorage.hasOwnProperty(key)){
          data += window.localStorage[key];
          //console.log( '- '+key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }

  }

  const size = ((data.length * 16)/(8 * 1024)).toFixed(2)

  //console.log(data ? '\n' + 'Total space used: ' + size + ' KB' : 'Empty (0 KB)');
  //console.log(size > 5000 ? 'Maybe slowdown your browser' : 'It\'s light');
  //console.log(data ? 'Approx. space remaining: ' + (10240 - size) + ' KB' : '5 MB');
  //console.log('-------------------------------------');

  return size
};
localStorageSpace()