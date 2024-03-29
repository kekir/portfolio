// File#: _1_expandable-search
// Usage: codyhouse.co/license
;(function () {
  let expandableSearch = document.getElementsByClassName('js-expandable-search')
  if (expandableSearch.length > 0) {
    for (let i = 0; i < expandableSearch.length; i++) {
      ;(function (i) {
        // if user types in search input, keep the input expanded when focus is lost
        expandableSearch[i]
          .getElementsByClassName('js-expandable-search__input')[0]
          .addEventListener('input', function (event) {
            Util.toggleClass(
              event.target,
              'expandable-search__input--has-content',
              event.target.value.length > 0
            )
          })
      })(i)
    }
  }
})()
