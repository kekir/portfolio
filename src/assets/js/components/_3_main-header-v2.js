// File#: _3_main-header-v2
// Usage: codyhouse.co/license
;(function () {
  let Submenu = function (element) {
    this.element = element
    this.trigger = this.element.getElementsByClassName('header-v2__nav-link')[0]
    this.dropdown = this.element.getElementsByClassName('header-v2__nav-dropdown')[0]
    this.triggerFocus = false
    this.dropdownFocus = false
    this.hideInterval = false
    this.prevFocus = false // nested dropdown - store element that was in focus before focus changed
    initSubmenu(this)
    initNestedDropdown(this)
  }

  function initSubmenu(list) {
    initElementEvents(list, list.trigger)
    initElementEvents(list, list.dropdown)
  }

  function initElementEvents(list, element, bool) {
    element.addEventListener('focus', function () {
      bool = true
      showDropdown(list)
    })
    element.addEventListener('focusout', function (event) {
      bool = false
      hideDropdown(list, event)
    })
  }

  function showDropdown(list) {
    if (list.hideInterval) clearInterval(list.hideInterval)
    Util.addClass(list.dropdown, 'header-v2__nav-list--is-visible')
    resetDropdownStyle(list.dropdown, true)
  }

  function hideDropdown(list, event) {
    if (list.hideInterval) clearInterval(this.hideInterval)
    list.hideInterval = setTimeout(function () {
      let submenuFocus = document.activeElement.closest('.header-v2__nav-item--main'),
        inFocus = submenuFocus && submenuFocus == list.element
      if (!list.triggerFocus && !list.dropdownFocus && !inFocus) {
        // hide if focus is outside submenu
        Util.removeClass(list.dropdown, 'header-v2__nav-list--is-visible')
        resetDropdownStyle(list.dropdown, false)
        hideSubLevels(list)
        list.prevFocus = false
      }
    }, 100)
  }

  function initNestedDropdown(list) {
    let dropdownMenu = list.element.getElementsByClassName('header-v2__nav-list')
    for (let i = 0; i < dropdownMenu.length; i++) {
      let listItems = dropdownMenu[i].children
      // bind hover
      new menuAim({
        menu: dropdownMenu[i],
        activate: function (row) {
          let subList = row.getElementsByClassName('header-v2__nav-dropdown')[0]
          if (!subList) return
          Util.addClass(row.querySelector('a.header-v2__nav-link'), 'header-v2__nav-link--hover')
          showLevel(list, subList)
        },
        deactivate: function (row) {
          let subList = row.getElementsByClassName('header-v2__nav-dropdown')[0]
          if (!subList) return
          Util.removeClass(row.querySelector('a.header-v2__nav-link'), 'header-v2__nav-link--hover')
          hideLevel(list, subList)
        },
        exitMenu: function () {
          return true
        },
        submenuSelector: '.header-v2__nav-item--has-children',
      })
    }
    // store focus element before change in focus
    list.element.addEventListener('keydown', function (event) {
      if ((event.keyCode && event.keyCode == 9) || (event.key && event.key == 'Tab')) {
        list.prevFocus = document.activeElement
      }
    })
    // make sure that sublevel are visible when their items are in focus
    list.element.addEventListener('keyup', function (event) {
      if ((event.keyCode && event.keyCode == 9) || (event.key && event.key == 'Tab')) {
        // focus has been moved -> make sure the proper classes are added to subnavigation
        let focusElement = document.activeElement,
          focusElementParent = focusElement.closest('.header-v2__nav-dropdown'),
          focusElementSibling = focusElement.nextElementSibling

        // if item in focus is inside submenu -> make sure it is visible
        if (
          focusElementParent &&
          !Util.hasClass(focusElementParent, 'header-v2__nav-list--is-visible')
        ) {
          showLevel(list, focusElementParent)
        }
        // if item in focus triggers a submenu -> make sure it is visible
        if (
          focusElementSibling &&
          !Util.hasClass(focusElementSibling, 'header-v2__nav-list--is-visible')
        ) {
          showLevel(list, focusElementSibling)
        }

        // check previous element in focus -> hide sublevel if required
        if (!list.prevFocus) return
        let prevFocusElementParent = list.prevFocus.closest('.header-v2__nav-dropdown'),
          prevFocusElementSibling = list.prevFocus.nextElementSibling

        if (!prevFocusElementParent) return

        // element in focus and element prev in focus are siblings
        if (focusElementParent && focusElementParent == prevFocusElementParent) {
          if (prevFocusElementSibling) hideLevel(list, prevFocusElementSibling)
          return
        }

        // element in focus is inside submenu triggered by element prev in focus
        if (
          prevFocusElementSibling &&
          focusElementParent &&
          focusElementParent == prevFocusElementSibling
        )
          return

        // shift tab -> element in focus triggers the submenu of the element prev in focus
        if (
          focusElementSibling &&
          prevFocusElementParent &&
          focusElementSibling == prevFocusElementParent
        )
          return

        let focusElementParentParent = focusElementParent.parentNode.closest(
          '.header-v2__nav-dropdown'
        )

        // shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
        if (focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
          if (prevFocusElementSibling) hideLevel(list, prevFocusElementSibling)
          return
        }

        if (
          prevFocusElementParent &&
          Util.hasClass(prevFocusElementParent, 'header-v2__nav-list--is-visible')
        ) {
          hideLevel(list, prevFocusElementParent)
        }
      }
    })
  }

  function hideSubLevels(list) {
    let visibleSubLevels = list.dropdown.getElementsByClassName('header-v2__nav-list--is-visible')
    if (visibleSubLevels.length == 0) return
    while (visibleSubLevels[0]) {
      hideLevel(list, visibleSubLevels[0])
    }
    let hoveredItems = list.dropdown.getElementsByClassName('header-v2__nav-link--hover')
    while (hoveredItems[0]) {
      Util.removeClass(hoveredItems[0], 'header-v2__nav-link--hover')
    }
  }

  function showLevel(list, level, bool) {
    if (bool == undefined) {
      //check if the sublevel needs to be open to the left
      Util.removeClass(level, 'header-v2__nav-dropdown--nested-left')
      let boundingRect = level.getBoundingClientRect()
      if (
        window.innerWidth - boundingRect.right < 5 &&
        boundingRect.left + window.scrollX > 2 * boundingRect.width
      )
        Util.addClass(level, 'header-v2__nav-dropdown--nested-left')
    }
    Util.addClass(level, 'header-v2__nav-list--is-visible')
  }

  function hideLevel(list, level) {
    if (!Util.hasClass(level, 'header-v2__nav-list--is-visible')) return
    Util.removeClass(level, 'header-v2__nav-list--is-visible')

    level.addEventListener('transition', function cb() {
      level.removeEventListener('transition', cb)
      Util.removeClass(level, 'header-v2__nav-dropdown--nested-left')
    })
  }

  let mainHeader = document.getElementsByClassName('js-header-v2')
  if (mainHeader.length > 0) {
    let menuTrigger = mainHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
      firstFocusableElement = getMenuFirstFocusable()

    // we'll use these to store the node that needs to receive focus when the mobile menu is closed
    let focusMenu = false

    menuTrigger.addEventListener('anim-menu-btn-clicked', function (event) {
      // toggle menu visibility an small devices
      Util.toggleClass(
        document.getElementsByClassName('header-v2__nav')[0],
        'header-v2__nav--is-visible',
        event.detail
      )
      Util.toggleClass(mainHeader[0], 'header-v2--expanded', event.detail)
      menuTrigger.setAttribute('aria-expanded', event.detail)
      if (event.detail) firstFocusableElement.focus()
      // move focus to first focusable element
      else if (focusMenu) {
        focusMenu.focus()
        focusMenu = false
      }
    })

    // take care of submenu
    let mainList = mainHeader[0].getElementsByClassName('header-v2__nav-list--main')
    if (mainList.length > 0) {
      for (let i = 0; i < mainList.length; i++) {
        ;(function (i) {
          new menuAim({
            // use diagonal movement detection for main submenu
            menu: mainList[i],
            activate: function (row) {
              let submenu = row.getElementsByClassName('header-v2__nav-dropdown')
              if (submenu.length == 0) return
              Util.addClass(submenu[0], 'header-v2__nav-list--is-visible')
              resetDropdownStyle(submenu[0], true)
            },
            deactivate: function (row) {
              let submenu = row.getElementsByClassName('header-v2__nav-dropdown')
              if (submenu.length == 0) return
              Util.removeClass(submenu[0], 'header-v2__nav-list--is-visible')
              resetDropdownStyle(submenu[0], false)
            },
            exitMenu: function () {
              return true
            },
            submenuSelector: '.header-v2__nav-item--has-children',
            submenuDirection: 'below',
          })

          // take care of focus event for main submenu
          let subMenu = mainList[i].getElementsByClassName('header-v2__nav-item--main')
          for (let j = 0; j < subMenu.length; j++) {
            ;(function (j) {
              if (Util.hasClass(subMenu[j], 'header-v2__nav-item--has-children'))
                new Submenu(subMenu[j])
            })(j)
          }
        })(i)
      }
    }

    // if data-animation-offset is set -> check scrolling
    let animateHeader = mainHeader[0].getAttribute('data-animation')
    if (animateHeader && animateHeader == 'on') {
      let scrolling = false,
        scrollOffset = mainHeader[0].getAttribute('data-animation-offset')
          ? parseInt(mainHeader[0].getAttribute('data-animation-offset'))
          : 400,
        mainHeaderHeight = mainHeader[0].offsetHeight,
        mainHeaderWrapper = mainHeader[0].getElementsByClassName('header-v2__wrapper')[0]

      window.addEventListener('scroll', function (event) {
        if (!scrolling) {
          scrolling = true
          !window.requestAnimationFrame
            ? setTimeout(function () {
                checkMainHeader()
              }, 250)
            : window.requestAnimationFrame(checkMainHeader)
        }
      })

      function checkMainHeader() {
        let windowTop = window.scrollY || document.documentElement.scrollTop
        Util.toggleClass(
          mainHeaderWrapper,
          'header-v2__wrapper--is-fixed',
          windowTop >= mainHeaderHeight
        )
        Util.toggleClass(
          mainHeaderWrapper,
          'header-v2__wrapper--slides-down',
          windowTop >= scrollOffset
        )
        scrolling = false
      }
    }

    // listen for key events
    window.addEventListener('keyup', function (event) {
      // listen for esc key
      if (
        (event.keyCode && event.keyCode == 27) ||
        (event.key && event.key.toLowerCase() == 'escape')
      ) {
        // close navigation on mobile if open
        if (menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
          focusMenu = menuTrigger // move focus to menu trigger when menu is close
          menuTrigger.click()
        }
      }
      // listen for tab key
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key.toLowerCase() == 'tab')
      ) {
        // close navigation on mobile if open when nav loses focus
        if (
          menuTrigger.getAttribute('aria-expanded') == 'true' &&
          isVisible(menuTrigger) &&
          !document.activeElement.closest('.js-header-v2')
        )
          menuTrigger.click()
      }
    })

    // listen for resize
    let resizingId = false
    window.addEventListener('resize', function () {
      clearTimeout(resizingId)
      resizingId = setTimeout(doneResizing, 500)
    })

    function doneResizing() {
      if (!isVisible(menuTrigger) && Util.hasClass(mainHeader[0], 'header-v2--expanded'))
        menuTrigger.click()
    }

    function getMenuFirstFocusable() {
      let focusableEle = mainHeader[0]
          .getElementsByClassName('header-v2__nav')[0]
          .querySelectorAll(
            '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
          ),
        firstFocusable = false
      for (let i = 0; i < focusableEle.length; i++) {
        if (
          focusableEle[i].offsetWidth ||
          focusableEle[i].offsetHeight ||
          focusableEle[i].getClientRects().length
        ) {
          firstFocusable = focusableEle[i]
          break
        }
      }

      return firstFocusable
    }
  }

  function resetDropdownStyle(dropdown, bool) {
    if (!bool) {
      dropdown.addEventListener('transitionend', function cb() {
        dropdown.removeAttribute('style')
        dropdown.removeEventListener('transitionend', cb)
      })
    } else {
      let boundingRect = dropdown.getBoundingClientRect()
      if (
        window.innerWidth - boundingRect.right < 5 &&
        boundingRect.left + window.scrollX > 2 * boundingRect.width
      ) {
        let left = parseFloat(window.getComputedStyle(dropdown).getPropertyValue('left'))
        dropdown.style.left = left + window.innerWidth - boundingRect.right - 5 + 'px'
      }
    }
  }

  function isVisible(element) {
    return element.offsetWidth || element.offsetHeight || element.getClientRects().length
  }
})()
