export function initMenu(button, drawer) {
  const label = button.querySelector('.sr-only')
  button.hidden = false

  function setOpen(open) {
    drawer.hidden = !open
    button.setAttribute('aria-expanded', String(open))
    label.textContent = open ? 'Fechar menu' : 'Abrir menu'
  }

  button.addEventListener('click', () => setOpen(drawer.hidden))
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer.hidden) {
      setOpen(false)
      button.focus()
    }
  })
  window.matchMedia?.('(min-width: 768px)')?.addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })

  return { setOpen }
}

export function initHeaderShadow(header) {
  const update = () => header.classList.toggle('shadow-md', window.scrollY > 0)
  window.addEventListener('scroll', update, { passive: true })
  update()
}
