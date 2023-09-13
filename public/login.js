'use strict'

document.getElementById('loader').style.display = 'none'

const loginForm = document.querySelector('#login-form')
const loginButton = document.querySelector('#submit-login')

loginForm.addEventListener('submit', async (e) => {
    document.getElementById('loader').style.display = 'block'
    loginButton.setAttribute('disabled', true)
    e.preventDefault()
    const formData = new FormData(loginForm)
    const username = formData.get('username')
    const password = formData.get('password')
    if (username && password) {
        let div = append()
        document.getElementById('notif-wrapper').append(div)
        document.getElementById('notif').innerHTML = 'Processing .. .. ..'
        const response = await fetch('/auth', {
            method: 'POST',
            mode: 'same-origin',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
        const e = await response.json().catch( err => console.log(err))
        if (e.status === 'success') {
            location.reload()
        } else {
            document.getElementById('notif-wrapper').append(div)
            document.getElementById('notif-wrapper').style.display = 'block'

            loginButton.removeAttribute('disabled')
            document.getElementById('notif').innerHTML = e.message
            setTimeout( () => {
                document.getElementById('loader').style.display = 'none'
            }, 500)
        }
    }
})

function append() {
    const div = document.createElement('DIV')
    div.classList.add('alert','alert-danger', 'alert-dismissible', 'fade', 'show')
    div.setAttribute('role', 'alert')
    const st = document.createElement('STRONG')
    st.setAttribute('id', 'notif')
    const bt = document.createElement('BUTTON')
    bt.classList.add('close')
    bt.setAttribute('type','button')
    bt.setAttribute('data-dismiss','alert')
    bt.setAttribute('aria-label','CLose')
    const sp = document.createElement('SPAN')
    sp.setAttribute('aria-hidden','true')
    sp.innerHTML = 'x'
    bt.append(sp)
    div.append(st, bt)
    return div
}