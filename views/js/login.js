document.addEventListener("onautocomplete", function (evt) {
  console.log("browser auto-fill detected");
  evt.target.parentElement.classList.add("enabled");
});

$("input").on("change input", function () {
  if ($(this).val().length > 0) {
    $(this).parent().addClass("enabled");
  } else {
    $(this).parent().removeClass("enabled");
  }
});

$("#login").on("submit", async function (evt) {
  evt.preventDefault();
  $(".submit-btn").prop("disabled", true);
  try {
    const data = new FormData(evt.target);
    const result = await fetchAPI("/login", {
      email: data.get("email"),
      pwd: data.get("pwd"),
    });

    if (!result.ok) {
      if (result.json) throw new Error(result.json.msg);
      throw new Error(result.status);
    }

    sessionStorage.setItem("jwt", result.json.jwt);
    success("Login success");

    setTimeout(() => {
      window.location.replace("/");
    }, 1500);
  } catch (err) {
    danger(err);
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 2000);
  }
});
