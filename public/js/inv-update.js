const form = document.querySelector("#update_form")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("button")
      updateBtn.removeAttribute("disabled")
    })