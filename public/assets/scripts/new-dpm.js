'use strict'

/**
 * LOCALSTORAGE KONSEP
 * 
 * name = pekerjaan
 * value = [{project, pekerjaan, dpmId, item, itemName, unit, qty}]
 */

const project = document.querySelector('#project')
const pekerjaan = document.querySelector('#pekerjaan')
const dpmContainer = document.querySelector('#new-dpm')
const dpmCart = document.querySelector('#dpm-cart')
const dpmDestroy = document.querySelector('#dpm-destroy')
const formItem = document.querySelector('#form-item')

formItem.addEventListener('submit', async (e) => {
    e.preventDefault()
    let formData = new FormData(formItem)
    const pk = pekerjaan.value
    const item = formData.get('item')
    dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
            <div class="card-body">
                <div class="row justify-content-center font-weight-bold text-danger">
                    PROCESSING
                </div>
            </div>
        </div>
    </div>`
    await postData('/API/dpmItemList', {pk, item})
    .then( async e => {
        if (e.status == 'success' && e.data.length > 0) {
            await tableDpmContainer(e.data)
        } else if (e.status == 'failed') {
            dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
                <div class="card-body">
                    <div class="row justify-content-center font-weight-bold text-danger">
                        ${e.message}
                    </div>
                </div>
            </div>`
        } else {
            dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
                <div class="card-body">
                    <div class="row justify-content-center font-weight-bold text-danger">
                        ${item} TIDAK DITEMUKAN
                    </div>
                </div>
            </div>`
        }
    })

})

function tableDpmContainer(arrayData) {
    if (arrayData) {
        let table = `<table class="table table-sm table-striped table hover">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Jumlah Kebutuhan</th>
                    <th>Unit</th>
                    <th>Tanggal Kebutuhan</th>
                    <th>Catatan</th>
                    <th>SIMPAN</th>
                </tr>
            </thead>
            <tbody>`
            for (let i = 0; i < arrayData.length; i++) {
                table += `<tr>
                    <td>${i + 1}</td>
                    <td>${arrayData[i].name}
                        <br>
                        ${arrayData[i].pekerjaan}
                    </td>
                    <td>
                        <input id="${arrayData[i].id}-qty" type="number" name="qty" class="form-control">
                    </td>
                    <td>${arrayData[i].unit}</td>
                    <td>
                        <input id="${arrayData[i].id}-tanggal" type="date" name="tanggal" class="form-control">
                    </td>
                    <td>
                        <input id="${arrayData[i].id}-catatan" type="text" name="catatan" class="form-control">
                    </td>
                    <td>
                        <button class="btn btn-sm btn-danger simpan-dpm" data-id="${arrayData[i].id}" data-name="${arrayData[i].name}" data-pekerjaan="${arrayData[i].pekerjaan}" data-unit="${arrayData[i].unit}">SIMPAN</button>
                    </td>
                </tr>`
            }
            table += `</tbody>
        </table>`
        dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
            <div class="card-body">
                ${table}
            </div>
        </div>`
        $('.table').DataTable();
    } else {
        dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
            <div class="card-body">
                TIDAK ADA DATA
            </div>
        </div>`
    }
}

function badgeDpm() {
    if (localStorage.getItem('dpmLocal')) {
        const dpmStorage = localStorage.getItem('dpmLocal')
        const arrDpm = JSON.parse(dpmStorage)
        document.getElementById('dpm-cart').innerHTML = arrDpm.length
        const project = document.getElementById("project").options;
        for (var i = 0; i < project.length; i++) {
            if (project[i].text == arrDpm[0].project) {
                project[i].selected = true;
                break;
            }
        }
        const pekerjaan = document.getElementById("pekerjaan").options;
        for (var i = 0; i < pekerjaan.length; i++) {
            if (pekerjaan[i].text == arrDpm[0].pekerjaan) {
                pekerjaan[i].selected = true;
                break;
            }
        }

        if (arrDpm.length > 0) {
            const btnNew = `<button class="btn btn-danger">
                HAPUS DATA
            </button>`
            dpmDestroy.innerHTML = btnNew
            dpmDestroy.addEventListener('click', () => {
                localStorage.removeItem('dpmLocal')
                badgeDpm()
                tableDpmContainer()
                dpmDestroy.innerHTML = ''
            })
        }
    } else {
        document.getElementById('dpm-cart').innerHTML = 0
    }
}

badgeDpm()

project.addEventListener('change', () => {
    pekerjaan.value = ''
    dpmContainer.innerHTML = '';
    if (!project.value) {
        return toastFailed('Pilih Project Terlebih Dahulu')
    }
    localStorage.removeItem('dpmLocal')
    badgeDpm()
    toastSuccess('Pilih Pekerjaan')
})

pekerjaan.addEventListener('change', () => {
    const pj = project.value
    const pk = pekerjaan.value
    if (!pj) {
        pekerjaan.value = ''
        return toastFailed('Pilih Project Terlebih Dahulu')
    }
    localStorage.removeItem('dpmLocal')
    badgeDpm()
    return toastSuccess('Silahkan pilih item ')
})

$(document).on('click', '.simpan-dpm', function () {
    const id = $(this).attr('data-id')
    const name = $(this).attr('data-name')
    const pekerjaan = $(this).attr('data-pekerjaan')
    const unit = $(this).attr('data-unit')
    const qty = document.getElementById(id+'-qty').value
    const tanggal = document.getElementById(id+'-tanggal').value
    const catatan = document.getElementById(id+'-catatan').value
    const project = document.getElementById('project').value
    if (id && name && pekerjaan && qty && unit && tanggal && catatan && project) {
        const data = {id, name, pekerjaan, qty, unit, tanggal, catatan, project}
        saveDpmStorage(data)
    }
} )

$(document).on('click', '#dpm-list', function () {
    if (localStorage.getItem('dpmLocal')) {
        const arrDpm = JSON.parse(localStorage.getItem('dpmLocal'))
        getDpmLocal(arrDpm)
    }
} )

$(document).on('click', '.btn-remove-dpmLocal', function () {
    const id = $(this).attr('data-id')
    const arrDpm = JSON.parse(localStorage.getItem('dpmLocal'))
    if (arrDpm) {
        if (arrDpm.length > 1) {
            for (let i = 0; i < arrDpm.length; i++) {    
                if (arrDpm[i].id == id) {
                    arrDpm.splice(i, 1)
                    break
                }
            }
            localStorage.setItem('dpmLocal', JSON.stringify(arrDpm))
            getDpmLocal(arrDpm)
            badgeDpm()
        } else {
            localStorage.removeItem('dpmLocal')
            badgeDpm()
            getDpmLocal()
            dpmDestroy.innerHTML = ''
        }
    } else {
        localStorage.removeItem('dpmLocal')
        getDpmLocal(arrDpm)
        badgeDpm()
    }
})

$(document).on('click', '.submit-dpm', function() {
    const dpmLocal = JSON.parse(localStorage.getItem('dpmLocal'))
    if (dpmLocal) {
        swal.fire({
            icon: 'warning',
            title: 'SUBMIT DPM',
            html: 'SUBMIT bisa GAGAL jika ada item pada DPM sebelumnya yang belum dibuat PO',
            confirmButtonText: 'YA, SUBMIT',
            showCancelButton: true,
            cancelButtonText: 'BATAL'
        })
        .then ( e => {
            if (e.isConfirmed) {
                postData('/API/submitDpm', {data: dpmLocal})
                .then (e => {
                    if (e.status == 'failed') {
                        const data = e.data[0]
                        const id = data.item
                        document.getElementById(id+'-item').classList.add('text-danger')
                        document.getElementById(id+'-item').classList.add('font-weight-bold')
                        const text = document.getElementById(data.item+'-item').innerHTML
                        document.getElementById(id+'-item').innerHTML = text+`<br>
                        <a href="/dpm_control?number=${data.number}&id=${data.dpm_id}" class="text-primary" target="_blank">CHECK THIS</a>`
                        toastFailed('GAGAL! Check kolom item')
                    } else if (e.status == 'success') {
                        localStorage.removeItem('dpmLocal')
                        dpmContainer.innerHTML = ''
                        dpmDestroy.innerHTML = ''
                        badgeDpm()
                        location.href = `/dpm_control?number=${e.data}`
                    }
                })
            }
        })
    }
})

function getDpmLocal(arrDpm) {
    if (arrDpm) {
        let table = `<table class="table table-sm table-striped table hover">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>QTY</th>
                    <th>Unit</th>
                    <th>Tanggal Kebutuhan</th>
                    <th>Catatan</th>
                    <th>HAPUS</th>
                </tr>
            </thead>
            <tbody>`
            for (let i = 0; i < arrDpm.length; i++) {
                table += `<tr>
                    <td class="align-top">${i + 1}</td>
                    <td id="${arrDpm[i].id}-item" class="align-top">${arrDpm[i].name}
                        <br>
                        ${arrDpm[i].pekerjaan}
                    </td>
                    <td class="align-top">${arrDpm[i].qty}</td>
                    <td class="align-top">${arrDpm[i].unit}</td>
                    <td class="align-top">
                        ${arrDpm[i].tanggal}
                    </td>
                    <td class="align-top">${arrDpm[i].catatan}</td>
                    <td class="align-top"><button class="btn btn-danger btn-remove-dpmLocal" data-id="${arrDpm[i].id}">HAPUS</button></td>
                </tr>`
            }
            table += `</tbody>
        </table>`
        dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
            <div class="card-body">
                ${table}
            </div>
            <div class="card-footer justify-content-end">
                <button class="btn btn-success font-weight-bold submit-dpm">SUBMIT DPM</button>
            </div>
        </div>`
    } else {
        dpmContainer.innerHTML = `<div class="mb-3 col-md-12 card">
            <div class="card-body">
            <div class="d-flex justify-content-center text-danger font-weight-bold">
                TIDAK ADA DATA
            </div>
        </div>`
    }
}

function saveDpmStorage(data) {
    const jsonArray = JSON.parse(localStorage.getItem('dpmLocal'))
    if (jsonArray) {
        let insert = 0
        for (let i = 0; i < jsonArray.length; i++) {
            const x = jsonArray[i]
            if (x.id == data.id) {
                insert += 1
            }
        }
        if (insert == 0) {
            jsonArray.push(data)
            localStorage.setItem('dpmLocal', JSON.stringify(jsonArray))
            toastSuccess('Berhasil tambah data DPM')
            badgeDpm()
        } else {
            let newArray = []
            for (let i = 0; i < jsonArray.length; i++) {
                if (jsonArray[i].id == data.id) {
                    newArray.push(data)
                } else {
                    newArray.push(jsonArray[i])
                }
            }
            localStorage.setItem('dpmLocal', JSON.stringify(newArray))
            toastSuccess('Berhasil update data DPM')
        }
    } else {
        localStorage.setItem('dpmLocal', JSON.stringify([data]))
        badgeDpm()
        toastSuccess('Berhasil simpan DPM')
    }
}