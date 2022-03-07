// Test import of styles
import '@/assets/styles/main.scss'

const servHead = document.querySelector('.breadcrumbs__logo')

servHead.textContent = 'SERVICES'

const bcLink = document.querySelector('.breadcrumbs__item').childNodes[2]

bcLink.textContent = '/ Services'
