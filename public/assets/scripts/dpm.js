'use strict'

const processLapangan = document.getElementById('process-lapangan')
const dpmId = processLapangan.getAttribute('data-id')
const processHo = document.getElementById('process-ho')

const appleIdData = document.getElementById('apple-id')
const addApple = document.querySelector('#tambah-apple')
const approvalApple = document.querySelectorAll('.approval-apple')
const revApple = document.querySelectorAll('.rev-apple')

/**
 * DPM
 */
function approvalLapangan(dpmId, level, control, ho) {
    if (level == 'site engineer' && control < 2 && ho == 0) {
        swal.fire({
            icon: 'warning',
            title: 'AJUKAN LAGI',
            showConfirmButton: true,
            confirmButtonText: 'AJUKAN',
            showCancelButton: true
        })
        .then ( e => {
            if (e.isConfirmed) {
                postData('/dpm_control/update', {dpmId})
                .then ( e => {
                    if (e.status == 'success') {
                        location.reload()
                    } else {
                        toastWarning(e.message)
                    }
                })
                .catch( err => {
                    console.log(err)
                })
            }
        })
    } else if ((level == 'site manager' &&  control < 4) || (level == 'project manager'  &&  control <= 4 && ho == 0)) {
        swal.fire({
            icon: 'warning',
            title: 'PROSES DPM',
            html: `Pilih tombol APPROVE / HAPUS / CANCEL<br>
            <textarea id="catatan-sm-pm" class="form-control"></textarea>`,
            showConfirmButton: true,
            confirmButtonText: 'APPROVE',
            showDenyButton: true,
            denyButtonText: 'REJECT',
            showCancelButton: true,
            preConfirm: () => {
                const catatan = document.getElementById('catatan-sm-pm')
                if (!catatan.value) {
                    Swal.showValidationMessage(
                        `Catatan harus diisi`
                    )
                    catatan.focus()
                }
                return catatan.value
            },
            preDeny: () => {
                const catatan = document.getElementById('catatan-sm-pm')
                if (!catatan.value) {
                    Swal.showValidationMessage(
                        `Tulis alasan penghapusan`
                    )
                    catatan.focus()
                    return false
                }
                return catatan.value
            }
        })
        .then ( e => {
            const catatan = e.value
            if (e.isConfirmed) {
                var status = 2
            } else if (e.isDenied) {
                var status = 1
            }
            if (status == 1 || status == 2) {
                postData('/dpm_control/update', {dpmId, status, catatan})
                .then ( e => {
                    if (e.status == 'success') {
                        location.reload()
                    } else {
                        toastWarning(e.message)
                    }
                })
                .catch( err => {
                    console.log(err)
                })
            }
        })
    } else if ((level == 'director' &&  control < 4 && ho == 0) || (level == 'admin' &&  control < 4 && ho == 0)) {
        approvalHo(dpmId, level)
    } else {
        toastFailed('Otorisasi Level Gagal')
    }
}

function approvalHo(dpmId, level, control, ho) {
    if (level == 'cost controll' || level == 'director' || level == 'admin') {
        swal.fire({
            icon: 'warning',
            title: 'APPROVAL LEVEL CC',
            html: `Pilih tombol APPROVE / REJECT / CANCEL<hr>
            <label class="mt-2">Quantity Approve</label>
            <input id="qty" type="number" class="form-control">
            <label class="mt-2">Tanggal kebutuhan barang di lapangan</label>
            <input id="date2" type="date" class="form-control">
            <label class="mt-2">Catatan</label>
            <textarea id="catatan" class="form-control"></textarea>`,
            showConfirmButton: true,
            confirmButtonText: 'APPROVE',
            showDenyButton: true,
            denyButtonText: 'REJECT',
            showCancelButton: true,
            preConfirm: () => {
                const qty = document.getElementById('qty')
                const date2 = document.getElementById('date2')
                const catatan = document.getElementById('catatan')
                if (qty.value < 1) {
                    Swal.showValidationMessage(`Qty harus diisi`)
                    qty.focus()
                } else if (!date2.value) {
                    Swal.showValidationMessage(`Tentukan tanggal kebutuhan barang sampai di lapangan`)
                    date2.focus()
                } else if (!catatan.value) {
                    Swal.showValidationMessage(`Catatan harus diisi`)
                    catatan.focus()
                }
                return {qty2: qty.value, date2: date2.value, catatan: catatan.value}
            },
            preDeny: () => {
                const catatan = document.getElementById('catatan')
                if (!catatan.value) {
                    Swal.showValidationMessage(
                        `Tulis alasan reject`
                    )
                    catatan.focus()
                    return false
                }
                return {catatan: catatan.value}
            }
        })
        .then ( e => {
            let catatan = null
            let qty2 = null
            let date2 = null
            if (e.isConfirmed) {
                var status = 2
                catatan = e.value.catatan
                qty2 = e.value.qty2
                date2 = e.value.date2
                //approveDpm(dpmId, catatan, qty2, date2)
            } else if (e.isDenied) {
                catatan = e.value.catatan
                var status = 1
                //hapusDpm(dpmId, catatan)
            }
            if (status == 1 || status == 2) {
                postData('/dpm_control/update', {dpmId, status, qty2,  date2, catatan})
                .then ( e => {
                    if (e.status == 'success') {
                        location.reload()
                    } else {
                        toastWarning(e.message)
                    }
                })
                .catch( err => {
                    console.log(err)
                })
            }
        })
    } else if (ho >= 5 && (level == 'logistic' || level == 'admin')) {
        swal.fire({
            title: 'Ubah Status Pengiriman',
            html: `<select class="form-control" id="logistic-pengiriman">
                <option value="5" ${ho == 5 ? 'selected' : ''}>Menunggu Pengiriman</option>
                <option value="6" ${ho == 6 ? 'selected' : ''}>Sedang Dikirim</option>
                <option value="7" ${ho == 7 ? 'selected' : ''}>Telah Sampai</option>
            </select>`,
            showCancelButton: true,
            preConfirm: () => {
                const pengiriman = document.querySelector('#logistic-pengiriman')
                return {pengiriman: pengiriman.value}
            }
        }).then ( e => {
            if (e.isConfirmed) {
                putData('/dpm_control/pengiriman', {dpmId, ho: e.value.pengiriman})
                .then ( res => {
                    if (res.status == 'success') {
                        setTimeout(() => {
                            location.reload()
                        }, 1500)
                        return toastSuccess(res.message)
                    }
                    toastFailed(res.message)
                })
            }
        })
    } else {
        toastFailed('Otorisasi Level Gagal')
    }
}

processLapangan.addEventListener('click', async () => {
    postData('/dpm_control/approve', {dpmId})
    .then( e => {
        if (e.status == 'success') {
            approvalLapangan(dpmId, e.level, e.control, e.ho)
        } else {
            toastFailed(e.message)
        }
    })
})

processHo.addEventListener('click', () => {
    postData('/dpm_control/approve', {dpmId})
    .then( e => {
        if (e.status == 'success') {
            approvalHo(dpmId, e.level, e.control, e.ho)
        } else {
            toastFailed(e.message)
        }
    })
})

const approveDpm = (dpmId, catatan, qty2, date2) => {
    postData('/API/lapanganApproveDpm', {dpmId, qty2, date2, catatan})
    .then ( e => {
        if (e.status == 'success') {
            location.reload()
        } else {
            toastWarning(e.message)
        }
    })
}

const hapusDpm = (dpmId, catatan) => {
    postData('/API/lapanganHapusDpm', {dpmId, catatan})
    .then ( e => {
        if (e.status == 'success') {
            location.reload()
        } else {
            toastFailed(e.message)
        }
    })
}

/**
 * APPLE
 */
if (localStorage.getItem('apple')) {
    const apple = JSON.parse(localStorage.getItem('apple'))
    if (apple.length == 0) {
        localStorage.removeItem('apple')
    } else {
        showApple(apple)
    }
}

if (addApple) {
    addApple.addEventListener('click', async () => {
        let html = `<form id="add-apple">
            <div class="position-relative row form-group">
                <label for="supplier" class="col-sm-3 col-form-label">Supplier</label>
                <div class="col-sm-9">
                    <select name="supplier" id="supplier" class="form-control"></select>
                </div>
            </div>
            <div class="position-relative row form-group">
                <label for="payment" class="col-sm-3 col-form-label">Payment</label>
                <div class="col-sm-9">
                    <input name="payment" id="payment" type="text" class="form-control">
                </div>
            </div>
            <div class="position-relative row form-group">
                <label for="note" class="col-sm-3 col-form-label">Note</label>
                <div class="col-sm-9">
                    <input name="note" id="note" type="text" class="form-control">
                </div>
            </div>
            <div class="position-relative row form-group">
                <label for="price" class="col-sm-3 col-form-label">Price</label>
                <div class="col-sm-9">
                    <input name="price" id="price" type="number" step="any" class="form-control">
                </div>
            </div>
            <button class="btn btn-danger" type="submit">SUBMIT</button>
        <form>`
        swal.fire({
            width: '80vw',
            icon: 'warning',
            title: 'Tambah Apple',
            html, showConfirmButton: false, showCloseButton: true
        })
        await allActiveSupplier()
        let form = document.querySelector('#add-apple')
        form.addEventListener('submit', (e) => {
            e.preventDefault()

            let formData = new FormData(form)
            const storage = []
            const supplier = []
            let apple = {};
            for (var key of formData.keys()) {
                if (formData.get(key)) {
                    apple[key] = formData.get(key);
                } else {
                    return document.getElementsByName(key)[0].focus() //console.log(key+' kosong')
                }
            }
            const number = urlParams.get('number')
            const id = urlParams.get('id')
            supplier.push(apple)
            let dataApple = {number, id, supplier}
            storage.push(dataApple)

            const storageApple = JSON.parse(localStorage.getItem('apple'))
            if (storageApple && storageApple.length > 0) {
                tambahApple(dataApple)
            } else {
                localStorage.setItem('apple', '['+JSON.stringify(dataApple)+']')
                showApple(JSON.parse(localStorage.getItem('apple')))
                toastSuccess('Berhasil menyimpan apple to apple')
            }
            swal.close()
        })
    })
}

if (approvalApple) {
    for (let i = 0; i < approvalApple.length; i++) {
        const x = approvalApple[i]
        const appleId = x.getAttribute('data-id')
        const dpmId = x.getAttribute('data-dpm-id')
        const supl = x.getAttribute('data-supl')
        const name = x.getAttribute('data-name')
        x.addEventListener('click', () => {
            //x.classList.add('active')
            let html = `<label>Quantity</label>
            <input type="number" id="qtyApple" class="form-control">
            <label>Comment</label>
            <textarea id="commentApple" class="form-control"></textarea>`
            swal.fire({
                icon: 'warning',
                title: 'Pilih '+name,
                html,
                confirmButtonText: 'APPROVE',
                showDenyButton: true,
                denyButtonText: 'REJECT',
                showCancelButton: true,
                cancelButtonText: 'CLOSE',
                preConfirm: () => {
                    const qty = document.getElementById('qtyApple')
                    const commentApple = document.getElementById('commentApple')
                    if (!qty.value) {
                        qty.focus()
                        swal.showValidationMessage(`Quantity Wajib diisi`)
                    } else if (!commentApple.value) {
                        commentApple.focus()
                        swal.showValidationMessage(`Comment Wajib diisi`)
                    } else {
                        return {qty: qty.value, comment: commentApple.value}
                    }
                },
                preDeny: () => {
                    const qty = document.getElementById('qtyApple')
                    const commentApple = document.getElementById('commentApple')
                    if (!qty.value) {
                        qty.focus()
                        swal.showValidationMessage(`Untuk REJECT Quantity harus 0`)
                        return false
                    } else if (!commentApple.value) {
                        commentApple.focus()
                        swal.showValidationMessage(`Comment Wajib diisi`)
                        return false
                    } else {
                        return {qty: qty.value, comment: commentApple.value}
                    }
                }
            })
            .then ( e => {
                if (e.isConfirmed) {
                    putData('/apple_control/approval_apple', {appleId, dpmId, supl, qty: e.value.qty, comment: e.value.comment, status: 1})
                    .then( e => {
                        if (e.status == 'success') {
                            location.reload()
                        } else {
                            toastFailed(e.message)
                        }
                    })
                } else if (e.isDenied) {
                    putData('/apple_control/approval_apple', {appleId, dpmId, supl, qty: e.value.qty, comment: e.value.comment, status: 0})
                    .then( e => {
                        if (e.status == 'success') {
                            location.reload()
                        } else {
                            toastFailed(e.message)
                        }
                    })
                }
            })
        })
    }
}

if (revApple) {
    for (let i = 0; i < revApple.length; i++) {
        const x = revApple[i]
        const appleId = x.getAttribute('data-id')
        const dpmId = x.getAttribute('data-dpm-id')
        const supl = x.getAttribute('data-supl')
        const name = x.getAttribute('data-name')
        x.addEventListener('click', () => {
            const check = x.getAttribute('data-update')
            if ( check != 1 ) {
                updateSupplier(i+1, appleId, dpmId, supl, name)
            } else {
                toastFailed(`Data ${name} sudah terupdate, hapus data untuk membuat`)
            }
        })
    }
}

//menambahkan data supplier saat membuat apple2apple
function tambahApple(apple) {
    const data = JSON.parse(localStorage.getItem('apple'))
    const number = urlParams.get('number')
    const id = urlParams.get('id')
    let target = null
    for (let i = 0; i < data.length; i++) {
        if (data[i].number == apple.number && data[i].id == apple.id) {
            target = i
        }
    }
    if (target != null) {
        const length = data[target].supplier.length
        if (length > 3) {
            toastFailed('Jumlah apple maksimal 3')
        } else {
            data[target].supplier.push(apple.supplier[0])
            localStorage.setItem('apple', JSON.stringify(data))
            showApple(data)
        }
    } else {
        data.push(apple)
        localStorage.setItem('apple', JSON.stringify(data))
        showApple(data)
    }
}

//tampilkan supplier saat membuat apple2apple
function showApple(data) {
    // return console.log(data)
    if (data.length > 0) {

        const number = urlParams.get('number')
        const id = urlParams.get('id')

        let target = false
        for (let i = 0; i < data.length; i++) {
            const appleNumber = data[i].number
            const appleId = data[i].id
            if (number == appleNumber && id == appleId) {
                target = i
            }
        }

        if (typeof data[target] != 'undefined') {
            const arraySupplier = data[target].supplier
            let spl = ''
            for (let i = 0; i < arraySupplier.length; i++) {
                const nama = arraySupplier[i].supplier.split('|spacer|')
                spl += `<div class="col-md-4 col-lg-4">
                    <div class="mb-3 card" style="height: 260px; overflow-y: auto;">
                        <div class="card-body">
                            <div class="text-center">
                                <b>SUPPLIER ${i + 1}</b>
                            </div>
                            <table class="table table-sm table-striped table-hover">
                                <tbody class="align-top">
                                    <tr>
                                        <td>${nama[1]}</td>
                                    </tr>
                                    <tr>
                                        <td>${arraySupplier[i].payment}</td>
                                    </tr>
                                    <tr>
                                        <td>${arraySupplier[i].note}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            ${(arraySupplier[i].price * 1).toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button id="hapus-${i}" class="btn btn-sm btn-danger float-right hapus-supplier">HAPUS</button>
                        </div>
                    </div>
                </div>`
            }

            if (arraySupplier.length >= 3) {
                if (addApple) {
                    addApple.style.display = 'none'
                }
                spl += `<div class="col-md-12 col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <textarea name="catatan" id="catatan-apple" class="form-control"></textarea>
                            <button id="submit-apple" class="btn btn-danger float-right mt-2">SUBMIT</button>
                        </div>
                    </div>
                </div>`
            }

            supplierForApple.innerHTML = spl

            const catatanApple = document.getElementById('catatan-apple')
            const submitApple = document.getElementById('submit-apple')
            if (submitApple) {
                submitApple.addEventListener('click', () => {
                    if (!catatanApple.value) {
                        toastFailed('Catatan apple2apple belum diisi')
                    } else {
                        const dataSubmit = data[target]
                        dataSubmit.catatan = catatanApple.value
                        putData('/apple_control/submit_apple', dataSubmit)
                        .then( e => {
                            if (e.status == 'success') {
                                data.splice(target,1)
                                localStorage.setItem('apple', JSON.stringify(data));
                                location.reload()
                            } else {
                                toastFailed(e.message)
                            }
                        })
                    }
                })
            }
            
            const hapus = document.querySelectorAll('.hapus-supplier')
            for ( let i = 0; i < hapus.length; i++) {
                hapus[i].addEventListener('click', () => {
                    if (arraySupplier.length == 1) {
                        data.splice(target,1)
                        localStorage.setItem('apple', JSON.stringify(data));
                        showApple(JSON.parse(localStorage.getItem('apple')))
                    } else {
                        data[target].supplier.splice(i, 1)
                        localStorage.setItem('apple', JSON.stringify(data))
                        showApple(JSON.parse(localStorage.getItem('apple')))
                    }
                })
            }
        } else {
            supplierForApple.innerHTML = ''
        }
    } else {
        supplierForApple.innerHTML = ''
    }
}

///API/allActiveSupplier
function allActiveSupplier() {
    fetch('/API/allActiveSupplier')
    .then (response => response.json())
    .then ( result => {
        let option = ''
        option += `<option></option>`
        for (let i = 0; i < result.length; i++) {
            option += `<option value="${result[i].id}|spacer|${result[i].name}">${result[i].name}</option>`
        }
        document.querySelector('#supplier').innerHTML = option
        const choices = new Choices('#supplier');
    })
}

async function updateSupplier(i, appleId, dpmId, supl, name) {
    //console.log({i, appleId, dpmId, supl, name})
    const target = document.getElementById(`supl${i}`)
    const target2 = document.getElementById(`check-supl${i}`)

    const div = document.createElement('DIV')
    div.innerHTML = `<div id="pengganti${i}" class="mb-3 card form-update-supplier">
        <div class="card-header font-weight-bold d-flex justify-content-between">
            <b>PENGGANTI SUPPLIER ${i}</b>
            <button class="float-right btn btn-sm btn-danger font-weight-bold delete-temp-supl" data-id="${i}"><i class="pe-7s-trash"></i></button>
        </div>
        <div class="card-body">
            <div class="position-relative row form-group">
                <label for="supplier" class="col-sm-3 col-form-label">Supplier</label>
                <div class="col-sm-9">
                    <select name="supplier" id="supplier${i}" class="form-control daftar-supplier"></select>
                </div>
            </div>
            <div class="position-relative row form-group">
                <label for="payment" class="col-sm-3 col-form-label">Payment</label>
                <div class="col-sm-9">
                    <input name="payment" id="payment" type="text" class="form-control">
                </div>
            </div>
            <div class="position-relative row form-group">
                <label for="note" class="col-sm-3 col-form-label">Note</label>
                <div class="col-sm-9">
                    <input name="note" id="note" type="text" class="form-control">
                </div>
            </div>
            <div class="position-relative row form-group">
                <label for="price" class="col-sm-3 col-form-label">Price</label>
                <div class="col-sm-9">
                    <input name="price" id="price" type="number" class="form-control">
                </div>
            </div>
        </div>
    </div>`
    target.append(div)
    daftarSupplier(i)
    target2.setAttribute('data-update', 1)
    checkUpdateSupplier()
    remove()

    function daftarSupplier(i) {
        fetch('/API/allActiveSupplier')
        .then (response => response.json())
        .then ( result => {
            let option = ''
            option += `<option></option>`
            for (let i = 0; i < result.length; i++) {
                option += `<option value="${result[i].id}|spacer|${result[i].name}">${result[i].name}</option>`
            }
            document.querySelector('#supplier'+i).innerHTML = option
            const choices = new Choices('#supplier'+i);
        })
    }

    function checkUpdateSupplier() {
        const check = document.querySelectorAll('.form-update-supplier')
        //console.log(check.length)
        if (check.length == 3) {
            const elm = document.querySelector('#purchasing-comment')
            elm.innerHTML = `<label>Catatan</label>
            <textarea name="catatan" id="catatan-apple" class="form-control"></textarea>
            <button id="submit-apple" class="btn btn-danger float-right mt-2">SUBMIT</button>`
            const submit = document.getElementById('submit-apple')
            submit.addEventListener('click', () => {
                submitRevisiApple()
            })
        }
    }

    function remove() {
        const btnRemove = document.getElementsByClassName('delete-temp-supl')
        for (let ii = 0; ii < btnRemove.length; ii++) {
            const x = btnRemove[ii]
            const id = x.getAttribute('data-id')
            const target = document.getElementById('pengganti'+id)
            x.addEventListener('click', () => {
                target.remove()
                target2.removeAttribute('data-update')
                checkUpdateSupplier()
            })
        }
    }
}

async function submitRevisiApple() {
    const appleId = appleIdData.getAttribute('data-apple-id')
    let catatanUpdate = document.getElementsByName('catatan')[0].value
    let supplier = document.getElementsByName('supplier')
    let payment = document.getElementsByName('payment')
    let note = document.getElementsByName('note')
    let price = document.getElementsByName('price')

    supplier = await getData(supplier)
    payment = await getData(payment)
    note = await getData(note)
    price = await getData(price)

    if (!supplier || !payment || !note || !price || !catatanUpdate) {
        toastWarning('Form wajib diisi')
    } else {
        const regexNumber = /^[0-9]+$/
        const supl1 = supplier[0]
        const supl2 = supplier[1]
        const supl3 = supplier[2]
        const payment1 = payment[0]
        const payment2 = payment[1]
        const payment3 = payment[2]
        const note1 = note[0]
        const note2 = note[1]
        const note3 = note[2]
        const price1 = price[0]
        const price2 = price[1]
        const price3 = price[2]
        const catatan = catatanUpdate
        const data = {appleId, supl1, payment1, note1, price1, supl2, payment2, note2, price2, supl3, payment3, note3, price3, catatan}
        putData('/apple_control/update_apple', data)
        .then( e => {
            if (e.status == 'success') {
                toastSuccess('Berhasil update DATA')
                setTimeout(() => {
                    location.reload()
                }, 1500)
            } else {
                toastFailed(e.message)
            }
        })
    }
}

function getData(data) {
    if (data.length < 3) return false
    let update = [];
    for (let i = 0; i < 3; i++) {
        if (!data[i].value) return false
        update.push(data[i].value)
    }
    return update
}