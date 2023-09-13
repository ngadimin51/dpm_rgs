//req.io.to(idUser).emit('updateUser', {idUser, target, value})
socket.on("welcome", (id, name) => {
    console.log('Welcome '+name)
    console.log('Sukses JOIN : '+id)
})

socket.on('update-password', () => {
    swal.fire({
        icon: 'warning',
        title: 'User Kicked Out',
        html: 'Password changed by ADMIN',
        allowOutsideClick: false,
        showConfirmButton: false
    })
    Swal.showLoading()
    setTimeout( () => {
        location.href = '/logout'
    }, 3000)
})

socket.on('notif', data => {
    const notif = document.getElementById('notifikasi')
    const notifCount = document.getElementById('notif-count')
    let li = ''
    let total = 0
    for (let x = 0; x < data.length; x++) {
        total += 1
        const notifikasi = data[x]
        const pName = data[x].project.trim().split(' ')
        const projectName = pName.length > 2 ? pName[0].substring(0,1)+' '+pName[1]+' '+pName[2] : notifikasi.project
        if (notifikasi.type == 'DPM' || notifikasi.type == 'APPLE') {
            var link = `/dpm_control?number=${notifikasi.number}&id=${notifikasi.dpm_id}`
        } else if (notifikasi.type == 'PO') {
            var link = `/purchase_orders?project=${notifikasi.project}&po_number=${notifikasi.number}`
        } else if (notifikasi.type == 'QR') {
            var link = `/verification_control?type=${notifikasi.type}&id=${notifikasi.dpm_id}&po_number=${notifikasi.number}`
        }
        li += `<li class="nav-item">
            <div class="row">
                <a href="${link}" class="nav-link">
                    <div class="icon-circle">
                        <i class="pe-7s-mail"></i>
                    </div>
                    <span>
                        <b>${notifikasi.type} | ${notifikasi.pekerjaan}</b><br>
                        ${notifikasi.name.substring(0,20)}<br><small class="font-weight-bold">${projectName}</small>
                    </span>
                </a>
            </div>
        </li>`
    }
    notifCount.innerHTML = total
    notif.innerHTML = li
})

socket.on('update-notif', () => {
    socket.emit('update-notif')
})

socket.on('notif-default', message => {
    toastFailed(message)
})

socket.on('refresh-cookies', () => {
    location.replace('/logout')
})

socket.on('update-dpm', data => {
    console.log(data)
    if (urlParams.get('number') == data.number && urlParams.get('id') == data.dpmId) {
        location.reload()
    }
})

/**
 * CHATTING
 */
socket.on('projectRoom', data => {
    console.log(data)
})

socket.on('chatting', data => {

    const typingArea = document.getElementById('typing-area')
    if (!typingArea) {
        toastWarning('Pesan baru dari '+data.chat_sender+' room: '+data.chat_room)
    }
})