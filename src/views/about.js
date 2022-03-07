// Test import of styles
import '@/assets/styles/main.scss'

const aboutHead = document.querySelector('.breadcrumbs__logo')

aboutHead.textContent = 'ABOUT'

const bcLink = document.querySelector('.breadcrumbs__item').childNodes[2]

bcLink.textContent = '/ About'
