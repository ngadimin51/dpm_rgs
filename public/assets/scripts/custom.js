'use strict'

const locString = location.toString()
const urlParams = new URLSearchParams(window.location.search);
const pathName = window.location.pathname
const appContainer = document.querySelectorAll('.app-container')
const hamburger = document.querySelectorAll('.hamburger')
const switchHeader = document.querySelectorAll('.switch-header-cs-class')
const switchSidebar = document.querySelectorAll('.switch-sidebar-cs-class')
const closeSidebar = document.querySelectorAll('.close-sidebar-btn')
const poItem = document.querySelectorAll('.po-item')
const supplierForApple =  document.querySelector('#supplier-for-apple')
const menuActive = document.querySelectorAll('LI')
const aActive = document.querySelectorAll('A')
const myStorage = window.localStorage;

const customSearch = document.querySelector('.custom-search')
if (customSearch) {
    customSearch.addEventListener('submit', (e) => {
        const formData = new FormData(customSearch)
        formData.forEach((val, key) => {
            console.log(key, val)
            if (!val) e.preventDefault()
        })
    })
}

window.onload = () => {
    localSet()
}
window.onresize = () => {
    localSet()
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('loader').style.display = 'none'
});

window.onbeforeunload = function(e) {
    document.getElementById('loader').style.display = 'block'
};

async function localSet() {
    if (localStorage.getItem('header')) {
        const header = localStorage.getItem('header')
        const classHeader = header.split(' ')
        for (let i = 0; i < classHeader.length; i++) {
            document.getElementsByClassName('app-header')[0].classList.add(classHeader[i])
        }
    }
    
    if (localStorage.getItem('switchSidebar')) {
        const sidebar = localStorage.getItem('switchSidebar')
        const classSidebar = sidebar.split(' ')
        for (let i = 0; i < classSidebar.length; i++) {
            document.getElementsByClassName('app-sidebar')[0].classList.add(classSidebar[i])
        }
    }
    if (localStorage.getItem('sidebar')) {
        const sidebar = localStorage.getItem('sidebar')
        setTimeout(() => {
            appContainer[0].classList.add('closed-sidebar')
            hamburger[0].classList.add('is-active')
        }, 100);
    } else {
        appContainer[0].classList.remove('closed-sidebar')
        hamburger[0].classList.remove('is-active')
    };
}
localSet()

if (switchHeader) {
    for (let i = 0; i < switchHeader.length; i++) {
        const x = switchHeader[i]
        const dataClass = x.getAttribute('data-class')
        x.addEventListener('click', () => {
            localStorage.setItem('header', dataClass);
        })
    }
}

if (switchSidebar) {
    for(let i = 0; i < switchSidebar.length; i++) {
        const x = switchSidebar[i]
        const dataClass = x.getAttribute('data-class')
        x.addEventListener('click', () => {
            localStorage.setItem('switchSidebar', dataClass);
        })
    }
}

if (closeSidebar) {
    for (let i = 0; i < closeSidebar.length; i++) {
        const x = closeSidebar[i]
        const dataClass = x.getAttribute('data-class')
        x.addEventListener('click', () => {
            if (localStorage.getItem('sidebar')) {
                localStorage.removeItem('sidebar');
            } else {
                localStorage.setItem('sidebar', dataClass);
            }
        })
    }
}

if (menuActive) {
    const dataUrlNow = pathName.split('/')
    for (let i = 0; i < menuActive.length; i++) {
        const x = menuActive[i]
        const dataUrl = x.getAttribute('data-url')
        if (dataUrlNow[1] == dataUrl) {
            x.classList.add('mm-active')
        }
    }
}

if (aActive) {
    for (let i = 0; i < aActive.length; i++) {
        const x = aActive[i]
        const dataUrl = x.getAttribute('href')
        if (pathName == dataUrl) {
            x.classList.add('mm-active')
        }
    }
}

if (poItem) {
    for (let i = 0; i < poItem.length; i++) {
        const x = poItem[i]
        const poNumber = x.getAttribute('data-po-number')
        postData('/API/getDpmByPoNumber', {poNumber})
        .then( e => {
            let item = ''
            for (let i = 0; i < e.data.length; i++) {
                if (i - 1 < e.data.length) {
                    item += e.data[i].name+'<br>'
                } else {
                    item += e.data[i].name
                }
            }
            x.innerHTML = item
        })
    }
}

/*
if (vanillaTable) {
    var dataTable = new DataTable('.vanilla-data-table', {
        searchable: true,
        fixedHeight: true,
    });
}
*/

/*
//@const
var IS_HIDPI = window.devicePixelRatio > 1;

//@const
var IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);

//@const
var IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;

console.log(IS_HIDPI)
console.log(IS_MOBILE)
*/