// File#: _1_circular-progress-bar
// Usage: codyhouse.co/license
;(function () {
  let CProgressBar = function (element) {
    this.element = element
    this.fill = this.element.getElementsByClassName('c-progress-bar__fill')[0]
    this.fillLength = getProgressBarFillLength(this)
    this.label = this.element.getElementsByClassName('js-c-progress-bar__value')
    this.value = parseFloat(this.element.getAttribute('data-progress'))
    // before checking if data-animation is set -> check for reduced motion
    updatedProgressBarForReducedMotion(this)
    this.animate =
      this.element.hasAttribute('data-animation') &&
      this.element.getAttribute('data-animation') == 'on'
    this.animationDuration = this.element.hasAttribute('data-duration')
      ? this.element.getAttribute('data-duration')
      : 1000
    // animation will run only on browsers supporting IntersectionObserver
    this.canAnimate =
      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype
    // this element is used to announce the percentage value to SR
    this.ariaLabel = this.element.getElementsByClassName('js-c-progress-bar__aria-value')
    // check if we need to update the bar color
    this.changeColor =
      Util.hasClass(this.element, 'c-progress-bar--color-update') &&
      Util.cssSupports('color', 'var(--color-value)')
    if (this.changeColor) {
      this.colorThresholds = getProgressBarColorThresholds(this)
    }
    initProgressBar(this)
    // store id to reset animation
    this.animationId = false
  }

  // public function
  CProgressBar.prototype.setProgressBarValue = function (value) {
    setProgressBarValue(this, value)
  }

  function getProgressBarFillLength(progressBar) {
    return parseFloat(2 * Math.PI * progressBar.fill.getAttribute('r')).toFixed(2)
  }

  function getProgressBarColorThresholds(progressBar) {
    let thresholds = []
    let i = 1
    while (
      !isNaN(
        parseInt(
          getComputedStyle(progressBar.element).getPropertyValue('--c-progress-bar-color-' + i)
        )
      )
    ) {
      thresholds.push(
        parseInt(
          getComputedStyle(progressBar.element).getPropertyValue('--c-progress-bar-color-' + i)
        )
      )
      i = i + 1
    }
    return thresholds
  }

  function updatedProgressBarForReducedMotion(progressBar) {
    // if reduced motion is supported and set to reduced -> remove animations
    if (osHasReducedMotion) progressBar.element.removeAttribute('data-animation')
  }

  function initProgressBar(progressBar) {
    // set shape initial dashOffset
    setShapeOffset(progressBar)
    // set initial bar color
    if (progressBar.changeColor) updateProgressBarColor(progressBar, progressBar.value)
    // if data-animation is on -> reset the progress bar and animate when entering the viewport
    if (progressBar.animate && progressBar.canAnimate) animateProgressBar(progressBar)
    else setProgressBarValue(progressBar, progressBar.value)
    // reveal fill and label -> --animate and --color-update variations only
    setTimeout(function () {
      Util.addClass(progressBar.element, 'c-progress-bar--init')
    }, 30)

    // dynamically update value of progress bar
    progressBar.element.addEventListener('updateProgress', function (event) {
      // cancel request animation frame if it was animating
      if (progressBar.animationId) window.cancelAnimationFrame(progressBar.animationId)

      let final = event.detail.value,
        duration = event.detail.duration ? event.detail.duration : progressBar.animationDuration
      let start = getProgressBarValue(progressBar)
      // trigger update animation
      updateProgressBar(progressBar, start, final, duration, function () {
        emitProgressBarEvents(progressBar, 'progressCompleted', progressBar.value + '%')
        // update value of label for SR
        if (progressBar.ariaLabel.length > 0) progressBar.ariaLabel[0].textContent = final + '%'
      })
    })
  }

  function setShapeOffset(progressBar) {
    let center = progressBar.fill.getAttribute('cx')
    progressBar.fill.setAttribute('transform', 'rotate(-90 ' + center + ' ' + center + ')')
    progressBar.fill.setAttribute('stroke-dashoffset', progressBar.fillLength)
    progressBar.fill.setAttribute('stroke-dasharray', progressBar.fillLength)
  }

  function animateProgressBar(progressBar) {
    // reset inital values
    setProgressBarValue(progressBar, 0)

    // listen for the element to enter the viewport -> start animation
    let observer = new IntersectionObserver(progressBarObserve.bind(progressBar), {
      threshold: [0, 0.1],
    })
    observer.observe(progressBar.element)
  }

  function progressBarObserve(entries, observer) {
    // observe progressBar position -> start animation when inside viewport
    let self = this
    if (entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
      updateProgressBar(this, 0, this.value, this.animationDuration, function () {
        emitProgressBarEvents(self, 'progressCompleted', self.value + '%')
      })
    }
  }

  function setProgressBarValue(progressBar, value) {
    let offset = (((100 - value) * progressBar.fillLength) / 100).toFixed(2)
    progressBar.fill.setAttribute('stroke-dashoffset', offset)
    if (progressBar.label.length > 0) progressBar.label[0].textContent = value
    if (progressBar.changeColor) updateProgressBarColor(progressBar, value)
  }

  function updateProgressBar(progressBar, start, to, duration, cb) {
    let change = to - start,
      currentTime = null

    var animateFill = function (timestamp) {
      if (!currentTime) currentTime = timestamp
      let progress = timestamp - currentTime
      let val = parseInt((progress / duration) * change + start)
      // make sure value is in correct range
      if (change > 0 && val > to) val = to
      if (change < 0 && val < to) val = to
      if (progress >= duration) val = to

      setProgressBarValue(progressBar, val)
      if (progress < duration) {
        progressBar.animationId = window.requestAnimationFrame(animateFill)
      } else {
        progressBar.animationId = false
        cb()
      }
    }
    if (window.requestAnimationFrame && !osHasReducedMotion) {
      progressBar.animationId = window.requestAnimationFrame(animateFill)
    } else {
      setProgressBarValue(progressBar, to)
      cb()
    }
  }

  function updateProgressBarColor(progressBar, value) {
    let className = 'c-progress-bar--fill-color-' + progressBar.colorThresholds.length
    for (let i = progressBar.colorThresholds.length; i > 0; i--) {
      if (
        !isNaN(progressBar.colorThresholds[i - 1]) &&
        value <= progressBar.colorThresholds[i - 1]
      ) {
        className = 'c-progress-bar--fill-color-' + i
      }
    }

    removeProgressBarColorClasses(progressBar)
    Util.addClass(progressBar.element, className)
  }

  function removeProgressBarColorClasses(progressBar) {
    let classes = progressBar.element.className.split(' ').filter(function (c) {
      return c.lastIndexOf('c-progress-bar--fill-color-', 0) !== 0
    })
    progressBar.element.className = classes.join(' ').trim()
  }

  function getProgressBarValue(progressBar) {
    return (
      100 -
      Math.round(
        (parseFloat(progressBar.fill.getAttribute('stroke-dashoffset')) / progressBar.fillLength) *
          100
      )
    )
  }

  function emitProgressBarEvents(progressBar, eventName, detail) {
    progressBar.element.dispatchEvent(new CustomEvent(eventName, { detail: detail }))
  }

  window.CProgressBar = CProgressBar

  //initialize the CProgressBar objects
  let circularProgressBars = document.getElementsByClassName('js-c-progress-bar')
  var osHasReducedMotion = Util.osHasReducedMotion()
  if (circularProgressBars.length > 0) {
    for (let i = 0; i < circularProgressBars.length; i++) {
      ;(function (i) {
        new CProgressBar(circularProgressBars[i])
      })(i)
    }
  }
})()
