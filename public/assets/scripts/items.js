'use strict'

$('.table').DataTable()

$(document).on('click', '#tambah-item-button', function() {
    const choices = new Choices('#unit');
    const saveItem = document.getElementById('save-item')
    saveItem.addEventListener('click', (e) => {
        e.preventDefault()
        const name = document.getElementById('name').value.trim()
        const pekerjaan = document.getElementById('pekerjaan').value
        const unit = document.getElementById('unit').value
        if (name && pekerjaan && unit) {
            postData('/items_control/submit_item', {name, pekerjaan, unit})
            .then( e => {
                if (e.status == 'success') {
                    toastSuccess(e.message)
                    closeModal('tambah-item')
                } else {
                    toastFailed(e.message)
                }
            })
        }
    })
})

$(document).on('click', '.update-item', async function() {
    const id = $(this).attr("data-id");
    const nama = $('#'+id+'-nama').html().trim();
    const unit = $('#'+id+'-unit').html();
    const pekerjaan = $('#'+id+'-pekerjaan').html();
    const pekerjaanList = await fetch('/API/items/getItemsPekerjaan').then (e => e.json())
    const unitList = await fetch('/API/items/getItemsUnit').then (e => e.json())
    console.log(nama)
    let html = `<div class="text-left">
            <label for="name">NAMA</label>
            <input type="text" name="nama" class="form-control mb-2" value="${nama}">
        </div>
        <div class="text-left">
            <label for="pekerjaan">PEKERJAAN</label>
            <select name="pekerjaan" class="form-control mb-2">`
            for (let i = 0; i < pekerjaanList.data.length; i++) {
                var selected = pekerjaanList.data[i].pekerjaan == pekerjaan ? 'selected' : ''
                html += `<option value="${pekerjaanList.data[i].pekerjaan}" ${selected}>${pekerjaanList.data[i].pekerjaan}</option>`
            }
    html += `</select>
        </div>
        <div class="text-left">
            <label for="unit">UNIT / SATUAN</label>
            <select name="unit" class="form-control mb-2">`
            for (let i = 0; i < unitList.length; i++) {
                var selected = unitList[i].name == unit ? 'selected' : ''
                html += `<option value="${unitList[i].name}" ${selected}>${unitList[i].name}</option>`
            }
    html += `</select>
        </div>`
    swal.fire({
        icon: 'warning',
        title: 'UPDATE ITEM<br>'+nama,
        html,
        confirmButtonText: 'SIMPAN',
        showCancelButton: true,
        cancelButtonText: 'BATAL',
        preConfirm: () => {
            const nama = document.querySelector('[name="nama"]')
            const pekerjaan = document.querySelector('[name="pekerjaan"]')
            const unit = document.querySelector('[name="unit"]')
            if (!nama.value) return swal.showValidationMessage('Nama Kosong')
            if (!pekerjaan.value) return swal.showValidationMessage('Pekerjaan kosong')
            if (!unit.value) return swal.showValidationMessage('Unit Kosong')
            return {nama: nama.value, pekerjaan: pekerjaan.value, unit: unit.value, id}
        }
    })
    .then( e => {
        if (e.isConfirmed) {
            postData('/items_controll/update', e.value)
            .then( resp => {
                if (resp.status == 'success') {
                    $('#'+id+'-nama').html(e.value.nama)
                    $('#'+id+'-pekerjaan').html(e.value.pekerjaan)
                    $('#'+id+'-unit').html(e.value.unit)
                    toastSuccess(resp.message)
                } else {
                    toastFailed(resp.message)
                }
            })
        }
    })
})

$(document).on('click', '.hapus-item', function() {
    const id = $(this).attr('data-id')
    swal.fire({
        icon: 'warning',
        title: 'HAPUS ITEM!?',
        html: 'Item yg pernah di proses dalam DPM tidak dapat dihapus',
        confirmButtonText: 'HAPUS',
        confirmButtonColor: 'red',
        showCancelButton: true
    })
    .then( e => {
        if (e.isConfirmed) {
            deleteData('/API/deleteItem', {id})
            .then ( e => {
                if (e.status == 'success') {
                    location.reload()
                } else {
                    toastFailed(e.message)
                }
            })
        }
    })
})

$('.table').DataTable()

$(document).on('click', '.detail-logistic', function () {
    const project = $(this).attr('data-project')
    const item = $(this).attr('data-item')
    const unit = $(this).attr('data-unit')
    detailLogistic(project, item, unit)
})

function detailLogistic(project, item, unit) {
    const detail = $('#detail-laporan')
    postData('/API/logistic/detailReport', {project, item})
    .then ( e => {
        if (e.data.length > 0) {
            let laporan = `<div class="col-md-12 col-lg-12">
                <div class="mb-3 card">
                    <div class="card-body table-responsive">
                        <div class="row">
                            
                            <div class="col-md-4">
                                <div class="card mb-3 widget-content bg-vicious-stance">
                                    <div class="widget-content-wrapper text-dark">
                                        <div class="widget-content-left">
                                            <div class="widget-heading">
                                                <button class="mb-2 mr-2 btn btn-danger">${e.item.toUpperCase()}<span class="badge badge-pill badge-light"></span></button>
                                                <div class="widget-subheading text-white">TOTAL IN dalam ${e.unit}</div>
                                            </div>
                                        </div>
                                        <div class="widget-content-right">
                                            <div class="widget-numbers text-white">
                                                ${e.totalIn.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="card mb-3 widget-content bg-vicious-stance">
                                    <div class="widget-content-wrapper text-dark">
                                        <div class="widget-content-left">
                                            <div class="widget-heading">
                                                <button class="mb-2 mr-2 btn btn-danger">${e.item.toUpperCase()}<span class="badge badge-pill badge-light"></span></button>
                                                <div class="widget-subheading text-white">TOTAL OUT dalam ${e.unit}</div>
                                            </div>
                                        </div>
                                        <div class="widget-content-right">
                                            <div class="widget-numbers text-white">
                                                ${e.totalOut.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="card mb-3 widget-content bg-vicious-stance">
                                    <div class="widget-content-wrapper text-dark">
                                        <div class="widget-content-left">
                                            <div class="widget-heading">
                                                <button class="mb-2 mr-2 btn btn-danger">${e.item.toUpperCase()}<span class="badge badge-pill badge-light"></span></button>
                                                <div class="widget-subheading text-white">SISA dalam ${e.unit}</div>
                                            </div>
                                        </div>
                                        <div class="widget-content-right">
                                            <div class="widget-numbers text-white">
                                                ${(e.totalIn - e.totalOut).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <hr>
                        <table class="table table-sm table-striped table-hover">
                            <thead class="text-center table-dark">
                                <tr>
                                    <th class="align-middle">No</th>
                                    <th class="align-middle">Item</th>
                                    <th class="align-middle">IN</th>
                                    <th class="align-middle">OUT</th>
                                    <th class="align-middle">Unit</th>
                                    <th class="align-middle">LAMPIRAN</th>
                                    <th class="align-middle">NOTE</th>
                                    <th class="align-middle">CREATED</th>
                                    <th class="align-middle">PETUGAS</th>
                                    <th class="align-middle">TINDAKAN</th>
                                </tr>
                            </thead>
                            <tbody>`
                            for (let i = 0; i < e.data.length; i++) {
                                const x = e.data[i]
                                const create = new Date(x.log_created)
                                const update = new Date(x.log_update)
                                laporan += `<tr>
                                    <td>${i + 1}</td>
                                    <td>
                                        ${x.name}
                                        <br>
                                        ${x.pekerjaan}
                                    </td>
                                    <td>${x.log_in ? x.log_in : ''}</td>
                                    <td>${x.log_out ? x.log_out : ''}</td>
                                    <td>${x.unit}</td>
                                    <td>${x.log_lampiran}</td>
                                    <td>${x.log_note}</td>
                                    <td>
                                        created:<br>${create.toLocaleString('en-US')}
                                        <br>
                                        updated:<br>${x.log_update ? update.toLocaleString('en-US') : '-'}
                                    </td>
                                    <td>${x.petugas}</td>
                                    <td>
                                        <button
                                            class="btn btn-sm btn-primary rounded-circle shadow update-logistic"
                                            data-id="${x.log_id}" 
                                            data-in="${x.log_in}" data-out="${x.log_out}"
                                            data-created="${create}"
                                            data-lampiran="${x.log_lampiran}"
                                            data-note="${x.log_note}"
                                            style="width: 36px; height: 36px;">
                                            <i class="fas fa-info"></i>
                                        </button>
                                    </td>
                                </tr>`
                            }
                laporan += `</tbody>
                        </table>
                    </div>
                </div>
            </div>`
            detail.html(laporan)
            $('#btn-report-controll').html(`<button id="close-report" data-item="${e.item}" data-id-item="${item}" data-id-unit="${unit}" class="btn btn-warning">Sembunyikan Data Laporan</button>`)
            $('.table').DataTable()
            window.scrollTo(0,0)
        }
    })
}

$(document).on('click', '.update-logistic', async function() {
    const project = urlParams.get('project')
    const pekerjaan = urlParams.get('pekerjaan')
    let item = $('#close-report').attr('data-item')
    let idItem = $('#close-report').attr('data-id-item')
    let unit = $('#close-report').attr('data-id-unit')
    const dataId = $(this).attr('data-id')
    const totalIn = $(this).attr('data-in')
    const totalOut = $(this).attr('data-out')
    let created = $(this).attr('data-created')
    const date = new Date(created)
    const tahun = date.getFullYear()
    let bulan = date.getMonth() + 1
    bulan = bulan < 10 ? '0'+bulan : bulan
    let tanggal = date.getDate()
    tanggal = tanggal < 10 ? '0'+tanggal : tanggal
    let jam = date.getHours()
    jam = jam < 10 ? '0'+jam : jam
    let menit = date.getMinutes()
    menit = menit < 10 ? '0'+menit : menit
    let detik = date.getSeconds()
    detik = detik < 10 ? '0'+detik : detik
    const dataTanggal = tahun+'-'+bulan+'-'+tanggal
    const dataWaktu = jam+':'+menit+':'+detik
    const lampiran = $(this).attr('data-lampiran')
    const note = $(this).attr('data-note')
    if (totalIn > totalOut) {
        var qty = totalIn
    } else {
        var qty = totalOut
    }
    
    const jsonPekerjaan = JSON.parse($('#detail-laporan').attr('data-pekerjaan'))
    let optPekerjaan = ''
    for (let i = 0; i < jsonPekerjaan.length; i++) {
        optPekerjaan += `<option value="${jsonPekerjaan[i].pekerjaan}" ${jsonPekerjaan[i].pekerjaan == pekerjaan ? 'selected' : ''}> ${jsonPekerjaan[i].pekerjaan} </option>`
    }
    console.log(created)

    if (item && idItem) {
        var form = `<label for="item">Item</label>
        <select class="form-control" id="item">${item}</select>
        <div class="row">
            <div class="col-sm-8">
                <label for="pekerjaan">Pekerjaan</label>
                <select class="form-control" id="pekerjaan">${optPekerjaan}</select>
            </div>
            <div class="col-sm-4">
                <label for="unit">Unit / Satuan</label>
                <div class="form-control" id="unit">${unit}</div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <label for="type">In / Out</label>
                <select class="form-control" id="type">
                    <option value="in" ${totalIn > totalOut ? 'selected' : ''}> In </option>
                    <option value="out" ${totalOut > totalIn ? 'selected' : ''}> Out </option>
                </select>
            </div>
            <div class="col-sm-6">
                <label for="qty">Qty</label>
                <input type="number" class="form-control" id="qty" value="${qty}">
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <label for="tanggal">Tanggal</label>
                <input type="date" class="form-control" id="tanggal" value="${dataTanggal}">
            </div>
            <div class="col-sm-6">
                <label for="jam">Jam</label>
                <input type="time" class="form-control" id="jam" value="${dataWaktu}">
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <label for="lampiran">Lampiran BTB / Toko</label>
                <textarea class="form-control" id="lampiran">${lampiran}</textarea>
            </div>
            <div class="col-sm-6">
                <label for="catatan">Catatan</label>
                <textarea class="form-control" id="catatan">${note}</textarea>
            </div>
        </div>`
    }
    await getItemsByPekerjaan(pekerjaan)
    swal.fire({
        title: 'Tambah Laporan',
        html: form,
        confirmButtonText: 'SUBMIT',
        showCancelButton: true,
        preConfirm: () => {
            const type = document.getElementById('type')
            const qty = document.getElementById('qty')
            const tanggal = document.getElementById('tanggal')
            const jam = document.getElementById('jam')
            const lampiran = document.getElementById('lampiran')
            const catatan = document.getElementById('catatan')
            if (!type.value) {
                type.focus(); return swal.showValidationMessage('pilih type')
            }
            if (!qty.value) {
                qty.focus(); return swal.showValidationMessage('Isi Quantity')
            }
            if (!tanggal.value) {
                tanggal.focus(); return swal.showValidationMessage('Isi Tanggal')
            }
            if (!jam.value) {
                jam.focus(); return swal.showValidationMessage('Isi Jam')
            }
            if (!lampiran.value) {
                lampiran.focus(); return swal.showValidationMessage('Isi Lampiran')
            }
            if (!catatan.value) {
                catatan.focus(); return swal.showValidationMessage('Isi Catatan')
            }
            return {project, item: idItem, type: type.value, qty: qty.value, tanggal: tanggal.value, jam: jam.value, lampiran: lampiran.value, catatan: catatan.value, dataId}
        }
    })
    .then ( e => {
        if (e.isConfirmed) {
            //'/items_control/site_logistic/update_logistic'
            postData('/items_control/site_logistic/update_logistic', e.value)
            .then ( resp => {
                if (resp.status == 'success') {
                    toastSuccess(resp.message)
                    detailLogistic(e.value.project, e.value.item)
                } else {
                    toastFailed(resp.message)
                }
            })
            //console.log(e)
            //console.log(e.value)
        }
    })
    
    const selectedItem = document.querySelector('#item')
    selectedItem.addEventListener('change', () => {
        const selected = selectedItem.options[selectedItem.selectedIndex].text
        const unit = selected.split('|')[1].trim()
        document.querySelector('#unit').innerHTML = unit
    })
})

$(document).on('click', '#close-report', function() {
    $(this).remove()
    $('#detail-laporan').html('')
})

$(document).on('click', '#tambah-laporan', async function() {
    const project = urlParams.get('project')
    const pekerjaan = urlParams.get('pekerjaan')
    let item = $('#close-report').attr('data-item')
    let idItem = $('#close-report').attr('data-id-item')
    let unit = $('#close-report').attr('data-id-unit')
    let option = false
    if (item && idItem) {
        var form = `<label for="item">Item</label>
        <div class="form-control" id="item">${item}</div>
        <div class="row">
            <div class="col-sm-8">
                <label for="pekerjaan">Pekerjaan</label>
                <div class="form-control" id="pekerjaan">${pekerjaan}</div>
            </div>
            <div class="col-sm-4">
                <label for="unit">Unit / Satuan</label>
                <div class="form-control" id="unit">${unit}</div>
            </div>
        </div>`
    } else {
        var form = `<label for="item">Item</label>
        <select class="form-control" id="item"></select>
        <label for="pekerjaan">Pekerjaan</label>
        <div class="form-control" id="pekerjaan">${pekerjaan}</div>`
        option = true
        await getItemsByPekerjaan(pekerjaan)
    }
    var form2 = `<div class="row">
        <div class="col-sm-6">
            <label for="type">In / Out</label>
            <select class="form-control" id="type">
                <option value="in"> In </option>
                <option value="out"> Out </option>
            </select>
        </div>
        <div class="col-sm-6">
            <label for="qty">Qty</label>
            <input type="number" class="form-control" id="qty">
        </div>
    </div>
    <div class="row">
        <div class="col-sm-6">
            <label for="tanggal">Tanggal</label>
            <input type="date" class="form-control" id="tanggal">
        </div>
        <div class="col-sm-6">
            <label for="jam">Jam</label>
            <input type="time" class="form-control" id="jam">
        </div>
    </div>
    <div class="row">
        <div class="col-sm-6">
            <label for="lampiran">Lampiran BTB / Toko</label>
            <textarea class="form-control" id="lampiran"></textarea>
        </div>
        <div class="col-sm-6">
            <label for="catatan">Catatan</label>
            <textarea class="form-control" id="catatan"></textarea>
        </div>
    </div>`
    swal.fire({
        title: 'Tambah Laporan',
        html: form+''+form2,
        confirmButtonText: 'SUBMIT',
        showCancelButton: true,
        preConfirm: () => {
            if (option) {
                idItem = document.getElementById('item').value
            }
            const type = document.getElementById('type')
            const qty = document.getElementById('qty')
            const tanggal = document.getElementById('tanggal')
            const jam = document.getElementById('jam')
            const lampiran = document.getElementById('lampiran')
            const catatan = document.getElementById('catatan')
            if (!idItem) {
                return swal.showValidationMessage('Tentukan Item')
            }
            if (!type.value) {
                type.focus(); return swal.showValidationMessage('pilih type')
            }
            if (!qty.value) {
                qty.focus(); return swal.showValidationMessage('Isi Quantity')
            }
            if (!tanggal.value) {
                tanggal.focus(); return swal.showValidationMessage('Isi Tanggal')
            }
            if (!jam.value) {
                jam.focus(); return swal.showValidationMessage('Isi Jam')
            }
            if (!lampiran.value) {
                lampiran.focus(); return swal.showValidationMessage('Isi Lampiran')
            }
            if (!catatan.value) {
                catatan.focus(); return swal.showValidationMessage('Isi Catatan')
            }
            return {project, item: idItem, type: type.value, qty: qty.value, tanggal: tanggal.value, jam: jam.value, lampiran: lampiran.value, catatan: catatan.value}

        }
    })
    .then ( e => {
        if (e.isConfirmed) {
            postData('/items_control/site_logistic/post', e.value)
            .then ( resp => {
                if (resp.status == 'success') {
                    toastSuccess(resp.message)
                    detailLogistic(e.value.project, e.value.item)
                } else {
                    toastFailed(resp.message)
                }
            })
        }
    })
})

function getItemsByPekerjaan(pekerjaan) {
    let item = $('#close-report').attr('data-item')
    let idItem = $('#close-report').attr('data-id-item')
    let unit = $('#close-report').attr('data-id-unit')
    postData('/API/items/getItemsPekerjaan', {pekerjaan})
    .then ( e => {
        let opt = ''
        for (let i = 0; i < e.length; i++) {
            opt += `<option value="${e[i].id}" ${idItem == e[i].id ? 'selected' : '' }>${e[i].name} | ${e[i].unit}</option>`
        }
        document.getElementById('item').innerHTML = opt
        const choices = new Choices('#item');
    })
}

$(document).on('click', '#atur-satuan-button', function () {
    const satuan = `<div class="col-md-12 col-lg-12">
        <div class="mb-3 card">
            <div class="card-body">
                <table class="table table-sm table-hover table-striped">
                    <thead class="align-top text-center table-dark">
                        <tr>
                            <th>#</th>
                            <th>Nama Satuan/Unit</th>
                            <th>Menu</th>
                        </tr>
                    </thead>
                    <tbody id="unit-list"></tbody>
                </table>
            </div>
        </div>
    </div>`
    $('#satuan').html(satuan)
    fetch('/API/items/getItemsUnit')
    .then(response => response.json())
    .then( e => {
        let tr = ''
        for (let i = 0; i < e.length; i++) {
            tr += `<tr>
                <td>${i + 1}</td>
                <td id="nama-unit-${e[i].id}">${e[i].name}</td>
                <td class="text-center">
                    <button id="update-unit-${e[i].id}" data-id="${e[i].id}" data-unit="${e[i].name}" class="btn btn-warning mr-2 update-unit">UPDATE</button>
                    <button data-id="${e[i].id}" data-unit="${e[i].name}" class="btn btn-danger delete-unit">DELETE</button>
                </td>
            </tr>`
        }
        document.querySelector('#unit-list').innerHTML = tr
        $('.table').dataTable()
        $(document).on('click', '.update-unit', function() {
            const id = $(this).attr('data-id')
            const unit = $(this).attr('data-unit')
            swal.fire({
                icon: 'warning',
                title: 'Update Satuan '+unit,
                html: `<input class="form-control" id="update-unit" value="${unit}">`,
                showCancelButton: true
            }).then( e => {
                if (e.isConfirmed) {
                    const unit = $('#update-unit').val()
                    putData('/API/updateUnit', {id, unit})
                    .then( e => {
                        if (e.status == 'success') {
                            toastSuccess(e.message)
                            document.getElementById('nama-unit-'+id).innerHTML = unit
                            document.getElementById('update-unit-'+id).setAttribute('data-unit', unit)
                        } else {
                            toastFailed(e.message)
                        }
                    })
                }
            })
        })
        $(document).on('click', '.delete-unit', function() {
            const id = $(this).attr('data-id')
            swal.fire({icon: 'warning', title: 'HAPUS ITEM INI!?',showConfirmButton: true, confirmButtonColor: 'red', showCancelButton: true})
            .then( e => {
                if (e.isConfirmed) {
                    deleteData('/API/deleteUnit', {id})
                    .then( e => {
                        if (e.status == 'success') {
                            toastWarning(e.message)
                            $('#satuan').html('')
                        } else {
                            toastFailed(e.message)
                        }
                    })
                }
            })
        })
    })
})