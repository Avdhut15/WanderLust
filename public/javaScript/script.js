// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  if (document.querySelector('.show-listing')) {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }

  document.querySelectorAll('.alert').forEach(alert => {
    window.setTimeout(() => {
      alert.style.transition = 'opacity .3s ease'
      alert.style.opacity = '0'
      window.setTimeout(() => alert.remove(), 300)
    }, 5000)
  })

  const imageInput = document.querySelector('#image')
  const imagePreview = document.querySelector('#image-preview')

  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', () => {
      const [file] = imageInput.files

      if (imagePreview.dataset.objectUrl) {
        URL.revokeObjectURL(imagePreview.dataset.objectUrl)
        delete imagePreview.dataset.objectUrl
      }

      if (file) {
        imagePreview.dataset.objectUrl = URL.createObjectURL(file)
        imagePreview.src = imagePreview.dataset.objectUrl
        imagePreview.hidden = false
      } else if (imagePreview.dataset.currentImage) {
        imagePreview.src = imagePreview.dataset.currentImage
      } else {
        imagePreview.removeAttribute('src')
        imagePreview.hidden = true
      }
    })
  }

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
