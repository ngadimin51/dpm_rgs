'use strict' //butuh JQUERY

const choices = new Choices('#supplier');

$('#table-po-item').DataTable()

const deleteArray = document.getElementsByClassName('delete-array')
const localsPo = localStorage.getItem('itemToPo')
const textSyarat = `- Tanda Terima Barang (surat jalan, invoice/kwitansi, BTB)\n- Purchase Order (PO) Harus ditanda tangani kembali & dicap\n- Pengiriman barang harus disertakan nota/faktur & Kwitansi\n- Setiap pengiriman barang harap disertakan photocopy PO\n- Barang yang diterima dalam kondisi baik/tidak rusak`
getLocalsPo(localsPo)

document.getElementById('syarat').innerHTML = textSyarat

function getLocalsPo(data) {
    if (data) {
        const arrPo = JSON.parse(data)
        let html = ''
        let total = 0
        for (let i = 0; i < arrPo.length; i++) {
            total += arrPo[i].qty * arrPo[i].price
            html += `<tr>
                <td>${i + 1}</td>
                <td>${arrPo[i].item}<br>${arrPo[i].supplier}</td>
                <td>${arrPo[i].note}</td>
                <td>${arrPo[i].qty}</td>
                <td>${arrPo[i].unit}</td>
                <td>${arrPo[i].price}</td>
                <td class="text-right">${(arrPo[i].qty * arrPo[i].price).toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}</td>
                <td class="align-top text-center">
                    <input data-array="${i}" name="po-status" type="checkbox" class="po-status" ${arrPo[i].poAnak == 1 ? 'checked' : ''}>
                </td>
                <td class="align-top text-center">
                    <button data-array="${i}" class="btn btn-sm btn-danger font-weight-bold delete-array">
                        <i class="pe-7s-trash"></i>
                    </button>
                </td>
            </tr>`
        }
        let footer = `<tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th class="text-right font-weight-bold">${total.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})}</th>
                <th></th>
                <th></th>
            </tr>`
        document.getElementById('data-item-po').innerHTML = html
        document.getElementById('data-item-po-footer').innerHTML = footer
        
        let submitPo = `<button class="float-right btn btn-sm btn-danger submit-po">SUBMIT PO</button>`
        document.getElementById('submit-po').innerHTML = submitPo
    } else {
        document.getElementById('data-item-po').innerHTML = ''
    }

    if (deleteArray) {
        for (let i = 0; i < deleteArray.length; i++) {
            const x = deleteArray[i]
            const int = x.getAttribute('data-array')
            x.addEventListener('click', () => {
                const arr = JSON.parse(localStorage.getItem('itemToPo'))
                toastWarning('Item '+arr[int].item+' '+arr[int].qty+' '+arr[int].unit+' dihapus')
                if (arr.length == 1) {
                    localStorage.removeItem('itemToPo')
                    document.getElementById('submit-po').innerHTML = ''
                    document.getElementById('data-item-po-footer').innerHTML = ''
                } else {
                    arr.splice(int, 1)
                    localStorage.setItem('itemToPo', JSON.stringify(arr))
                }
                getLocalsPo(localStorage.getItem('itemToPo'))
            })
        }
    }
}

$(document).on('click', '.save-item', function() {

    const size = localStorageSpace()
    const locationProject = urlParams.get('project')

    if (size > 5000) return toastFailed('Localstorage anda penuh')

    const dpmId = $(this).attr('data-id')
    const item = $(this).attr('data-item')
    const unit = $(this).attr('data-unit')
    const project = $(this).attr('data-project')
    const supplier = $(this).attr('data-supplier')
    const note = document.getElementById('note-'+dpmId).value
    const qty = document.getElementById('qty-'+dpmId).value
    const price = document.getElementById('price-'+dpmId).value
    const poAnak = 0

    const data = {dpmId, project, item, supplier, unit, note, qty, price, poAnak}
            
    if (localStorage.getItem('itemToPo')) {
        const arrPo = JSON.parse(localStorage.getItem('itemToPo'))
        var temp = []
        for (let i = 0; i < arrPo.length; i++) {
            if (arrPo[i].project != locationProject) {
                toastFailed('Masih ada pekerjaan di Project '+arrPo[i].project, '/purchase_orders/po_new?project='+arrPo[i].project)
                return false
            }
            if (arrPo[i].dpmId == dpmId) {
                toastFailed('Item sudah tersimpan')
                return false
            } else {
                temp.push(arrPo[i])
            }
        }
        temp.push(data)
        localStorage.setItem('itemToPo', JSON.stringify(temp))
        getLocalsPo(localStorage.getItem('itemToPo'))
        toastSuccess('Berhasil simpan item '+item+' '+qty+' '+unit)
    } else {
        var temp = []
        temp.push(data)
        localStorage.setItem('itemToPo', JSON.stringify(temp))
        getLocalsPo(localStorage.getItem('itemToPo'))
        toastSuccess('Berhasil simpan item '+item+' '+qty+' '+unit)
    }

})

$(document).on('click', '.po-status', function () {
    const arrPo = JSON.parse(localStorage.getItem('itemToPo'))
    const array = $(this).attr('data-array')
    if (arrPo[array].poAnak == 1) {
        var poStatus = 0
    } else {
        var poStatus = 1
    }
    
    arrPo[array].poAnak = poStatus
    localStorage.setItem('itemToPo', JSON.stringify(arrPo))
    getLocalsPo(localStorage.getItem('itemToPo'))
})

$(document).on('click', '.submit-po', function() {
    const itemPo = JSON.parse(localStorage.getItem('itemToPo'))
    const payment = document.querySelector('[name="payment"]').value
    const poNumber = document.querySelector('[name="po-number"]').value
    const jadwal = document.querySelector('[name="jadwal"]').value
    const alamat = document.querySelector('[name="alamat-pengiriman"]').value
    const penerima = document.querySelector('[name="penerima"]').value
    const syarat = document.querySelector('[name="syarat"]').value
    const catatan = document.querySelector('[name="catatan"]').value
    const tanggal = document.querySelector('[name="tanggal"]').value
    const supl = document.querySelector('#supplier').value
    const data = {payment, poNumber, jadwal, alamat, penerima, syarat, catatan, tanggal, supl, itemPo}

    if (!itemPo) {
        toastFailed('Tidak ada item untuk PO')
        return false
    }
    if (!poNumber) { center(document.querySelector('[name="po-number"]')); return false }
    if (!payment) { center(document.querySelector('[name="payment"]')); return false }
    if (!jadwal) { center(document.querySelector('[name="jadwal"]')); return false }
    if (!alamat) { center(document.querySelector('[name="alamat-pengiriman"]')); return false }
    if (!penerima) { center(document.querySelector('[name="penerima"]')); return false}
    if (!syarat) { center(document.querySelector('[name="syarat"]')); return false}
    if (!catatan) { center(document.querySelector('[name="catatan"]')); return false}
    if (!tanggal) { center(document.querySelector('[name="tanggal"]')); return false}
    if (!supl) { document.querySelector('#supplier').click(); return false}
    postData('/purchase_orders/submit', data)
    .then( e => {
        if (e.status == 'failed') {
            toastFailed(e.message, `/purchase_orders?project=${e.project}&po_number=${poNumber}`)
        } else {
            toastSuccess(e.message)
            localStorage.removeItem('itemToPo')
            location.href = `/purchase_orders/pengajuan?project=${e.project}&po_number=${poNumber}`
        }
    })
})

function center(element) {
    element.focus()
    Element.prototype.documentOffsetTop = function () {
        return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
    };
    var top = element.documentOffsetTop() - ( window.innerHeight / 2 );
    window.scrollTo( 0, top );
}