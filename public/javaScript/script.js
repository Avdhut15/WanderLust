// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

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
