document.querySelectorAll<HTMLElement>('.design-gallery').forEach((gallery) => {
  const slides = [...gallery.querySelectorAll<HTMLButtonElement>('[data-slide]')]
  const dialog = gallery.querySelector<HTMLDialogElement>('dialog')!
  const enlarged = gallery.querySelector<HTMLImageElement>('.design-enlarged-image')!
  const pages = [...gallery.querySelectorAll<HTMLElement>('[data-thumbnail-page]')]
  let current = 0
  let currentPage = 0
  let opener: HTMLElement | undefined
  let previousOverflow = ''
  let scrollLocked = false

  function trackImage(image: HTMLImageElement, surface: HTMLElement) {
    const status = surface.querySelector<HTMLElement>('.design-image-status')!
    function update() {
      const loading = !image.complete
      const loaded = image.complete && image.naturalWidth > 0
      surface.setAttribute('aria-busy', String(loading))
      status.hidden = loaded
      status.textContent = loading ? 'Loading image…' : 'Image could not be loaded.'
      image.style.visibility = loaded ? '' : 'hidden'
    }
    image.addEventListener('load', update)
    image.addEventListener('error', update)
    update()
    return update
  }

  slides.forEach(slide => trackImage(slide.querySelector('img')!, slide))
  const updateEnlarged = trackImage(enlarged, gallery.querySelector('.design-enlarged')!)

  function selectImage(index: number) {
    const focusedSlide = slides.includes(document.activeElement as HTMLButtonElement)
    current = (index + slides.length) % slides.length
    slides[current]!.querySelector('img')!.loading = 'eager'
    slides.forEach((slide, index) => {
      slide.hidden = index !== current
    })
    if (dialog.open) {
      enlarged.src = slides[current]!.dataset.fullSrc!
      enlarged.alt = slides[current]!.querySelector('img')!.alt
      updateEnlarged()
    }
    gallery.querySelectorAll('[data-main-counter], [data-modal-counter]').forEach((counter) => {
      counter.textContent = `${current + 1} / ${slides.length}`
    })
    if (focusedSlide && !dialog.open) {
      slides[current]!.focus({ preventScroll: true })
    }
  }

  function openImage(index: number, trigger: HTMLElement) {
    opener = trigger
    if (!scrollLocked) {
      previousOverflow = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      scrollLocked = true
    }
    dialog.showModal()
    selectImage(index)
  }

  slides.forEach((slide, index) => slide.addEventListener('click', () => openImage(index, slide)))
  gallery.querySelectorAll<HTMLButtonElement>('[data-image-index]').forEach((button) => {
    button.addEventListener('click', () => openImage(Number(button.dataset.imageIndex), button))
  })
  gallery.querySelectorAll<HTMLButtonElement>('[data-main-step]').forEach((button) => {
    button.addEventListener('click', () => selectImage(current + Number(button.dataset.mainStep)))
  })
  gallery.querySelectorAll<HTMLButtonElement>('[data-page-step]').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = (currentPage + Number(button.dataset.pageStep) + pages.length) % pages.length
      pages.forEach((page, index) => {
        page.hidden = index !== currentPage
      })
      gallery.querySelector('[data-page-counter]')!.textContent = `${currentPage + 1} / ${pages.length}`
    })
  })
  gallery.addEventListener('keydown', (event) => {
    if (dialog.open && event.key === 'Tab') {
      const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button')]
      const first = buttons[0]!
      const last = buttons.at(-1)!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (!dialog.open && !(event.target instanceof Element && event.target.closest('.design-main'))) {
        return
      }
      event.preventDefault()
      selectImage(current + (event.key === 'ArrowLeft' ? -1 : 1))
    }
  })
  dialog.querySelector('.design-close')!.addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => {
    if (dialog.open || !scrollLocked) {
      return
    }
    document.documentElement.style.overflow = previousOverflow
    scrollLocked = false
    const focused = opener?.hidden ? slides[current] : opener
    focused?.focus()
  })
  for (const surface of gallery.querySelectorAll<HTMLElement>('.design-main-frame, .design-enlarged')) {
    let start: Touch | undefined
    surface.addEventListener(
      'touchstart',
      (event) => {
        start = event.touches.length === 1 ? event.touches[0] : undefined
      },
      { passive: true },
    )
    surface.addEventListener('touchmove', (event) => {
      if (event.touches.length !== 1) {
        start = undefined
      }
    }, { passive: true })
    surface.addEventListener('touchcancel', () => {
      start = undefined
    }, { passive: true })
    surface.addEventListener(
      'touchend',
      (event) => {
        const origin = start
        start = undefined
        const end = [...event.changedTouches].find(touch => touch.identifier === origin?.identifier)
        if (!origin || !end || event.touches.length) {
          return
        }
        const deltaX = end.clientX - origin.clientX
        const deltaY = end.clientY - origin.clientY
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (event.cancelable) {
            event.preventDefault()
          }
          selectImage(current + (deltaX < 0 ? 1 : -1))
          if (!dialog.open) {
            slides[current]!.focus({ preventScroll: true })
          }
        }
      },
      { passive: false },
    )
  }
})
