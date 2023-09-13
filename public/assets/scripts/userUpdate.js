'use strict'

const formUser = document.getElementsByClassName('form-user')
const formTambahUser = document.getElementById('form-tambah-user')
const idUserElement = document.getElementById('idUser')
const daftarPenugasan = document.getElementById('penugasan-project')

if (formTambahUser) {
    formTambahUser.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(formTambahUser);
        let data = {};
        for (var key of formData.keys()) {
            if (formData.get(key)) {
                data[key] = formData.get(key);
            } else {
                return document.getElementsByName(key)[0].focus() //console.log(key+' kosong')
            }
        }

        postData('/user_list/user/add', data)
        .then( e => {
            if (e.redirected) {
                location.reload()
            }
            if (e.status === 'success') {
                location.href = '/list_users/'+e.insertId
            }
            toastFailed(e.message)
            console.log(e)
        })
    })
}

for (let i = 0; i < formUser.length; i++) {
    const x = formUser[i]
    const target = x.getAttribute('data-target')
    const input = document.getElementsByName(target)[0]
    x.addEventListener('submit', async (e) => {
        const defaultValue = input.getAttribute('data-default')
        const value = input.value
        const idUser = idUserElement.value
        e.preventDefault()

        if (target != 'password' && defaultValue != value || target == 'password' && value) {
            let data = {target, value, idUser}
            putData('/user/update', data)
            .then ( res => {
                if (res.redirected) {
                    location.reload()
                } else {
                    if (res.status == 'success') {
                        toastSuccess(res.message)
                        input.setAttribute('data-default', value)
                    } else {
                        toastFailed(res.message)
                        input.value = defaultValue
                    }
                }
            })
        }
    })
}

var updateProject = document.getElementsByClassName('update-project')
for (let i = 0; i < updateProject.length; i++) {
    const x = updateProject[i]
    const id = x.getAttribute('data-id')
    const idUser = idUserElement.value
    x.addEventListener('click', () => {
        tambah_penugasan(id, idUser)
    })
}

async function tambah_penugasan(id, idUser) {
    putData('/user/tambah_penugasan', {id, idUser})
    .then( e => {
        if (e.redirected) {
            location.reload()
        }
        if (e.status === 'success') {
            toastSuccess('Berhasil update penugasan project')
            updateButton(e.data, idUser)
        } else {
            toastFailed(e.message)
        }
    })
}

async function updateButton(data, idUser) {
    let btn = ''
    for (let i = 0; i < data.length; i++) {
        const x = data[i]
        btn += `<button class="btn btn-outline-success mx-1 mb-2 penugasan-project font-weight-bold" data-id="${x.idProject}" onclick="tambah_penugasan(${x.idProject}, ${idUser})">${x.project}</button>`
    }
    daftarPenugasan.innerHTML = btn
}

$('form').on('focus', 'input[type=number]', function (e) {
    $(this).on('wheel.disableScroll', function (e) {
        e.preventDefault()
    })
})
$('form').on('blur', 'input[type=number]', function (e) {
    $(this).off('wheel.disableScroll')
})