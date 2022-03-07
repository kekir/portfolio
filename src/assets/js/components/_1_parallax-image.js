// File#: _1_parallax-image
// Usage: codyhouse.co/license
;(function () {
  let ParallaxImg = function (element, rotationLevel) {
    this.element = element
    this.figure = this.element.getElementsByClassName('js-parallax-img__assets')[0]
    this.imgs = this.element.getElementsByTagName('img')
    this.maxRotation = rotationLevel || 2 // rotate level
    if (this.maxRotation > 5) this.maxRotation = 5
    this.scale = 1
    this.animating = false
    initParallax(this)
    initParallaxEvents(this)
  }

  function initParallax(element) {
    element.count = 0
    window.requestAnimationFrame(checkImageLoaded.bind(element))
    for (let i = 0; i < element.imgs.length; i++) {
      ;(function (i) {
        let loaded = false
        element.imgs[i].addEventListener('load', function () {
          if (loaded) return
          element.count = element.count + 1
        })
        if (element.imgs[i].complete && !loaded) {
          loaded = true
          element.count = element.count + 1
        }
      })(i)
    }
  }

  function checkImageLoaded() {
    if (this.count >= this.imgs.length) {
      initScale(this)
      if (this.loaded) {
        window.cancelAnimationFrame(this.loaded)
        this.loaded = false
      }
    } else {
      this.loaded = window.requestAnimationFrame(checkImageLoaded.bind(this))
    }
  }

  function initScale(element) {
    let maxImgResize = getMaxScale(element)
    element.scale = maxImgResize / Math.sin(Math.PI / 2 - (element.maxRotation * Math.PI) / 180)
    element.figure.style.transform = 'scale(' + element.scale + ')'
    Util.addClass(element.element, 'parallax-img--loaded')
  }

  function getMaxScale(element) {
    let minWidth = 0
    let maxWidth = 0
    for (let i = 0; i < element.imgs.length; i++) {
      let width = element.imgs[i].getBoundingClientRect().width
      if (width < minWidth || i == 0) minWidth = width
      if (width > maxWidth || i == 0) maxWidth = width
    }
    let scale = Math.ceil((10 * maxWidth) / minWidth) / 10
    if (scale < 1.1) scale = 1.1
    return scale
  }

  function initParallaxEvents(element) {
    element.element.addEventListener('mousemove', function (event) {
      if (element.animating) return
      element.animating = true
      window.requestAnimationFrame(moveImage.bind(element, event))
    })
  }

  function moveImage(event, timestamp) {
    let wrapperPosition = this.element.getBoundingClientRect()
    let rotateY =
      2 *
      (this.maxRotation / wrapperPosition.width) *
      (wrapperPosition.left - event.clientX + wrapperPosition.width / 2)
    let rotateX =
      2 *
      (this.maxRotation / wrapperPosition.height) *
      (event.clientY - wrapperPosition.top - wrapperPosition.height / 2)

    if (rotateY > this.maxRotation) rotateY = this.maxRotation
    if (rotateY < -1 * this.maxRotation) rotateY = -this.maxRotation
    if (rotateX > this.maxRotation) rotateX = this.maxRotation
    if (rotateX < -1 * this.maxRotation) rotateX = -this.maxRotation
    this.figure.style.transform =
      'scale(' + this.scale + ') rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)'
    this.animating = false
  }

  window.ParallaxImg = ParallaxImg

  //initialize the ParallaxImg objects
  let parallaxImgs = document.getElementsByClassName('js-parallax-img')
  if (parallaxImgs.length > 0 && Util.cssSupports('transform', 'translateZ(0px)')) {
    for (let i = 0; i < parallaxImgs.length; i++) {
      ;(function (i) {
        let rotationLevel = parallaxImgs[i].getAttribute('data-perspective')
        new ParallaxImg(parallaxImgs[i], rotationLevel)
      })(i)
    }
  }
})()
