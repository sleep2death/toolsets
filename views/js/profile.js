document.title = "Profile";
// load avatars for self
$("input").on("change input", function () {
  if ($(this).val().length > 0) {
    $(this).parent().addClass("enabled");
  } else {
    $(this).parent().removeClass("enabled");
  }
});

$(async () => {
  const result = await getAvatar($("#seed").val());
  $("#avatar").html(result);
});

$("#seed").on("change input", async function () {
  const seed = $("#seed").val();
  if (seed.length > 3) {
    const result = await getAvatar($("#seed").val());
    $("#avatar").html(result);
  }
});

$("#profile").on("submit", async function (evt) {
  evt.preventDefault();
  $(".submit-btn").prop("disabled", true);
  try {
    const data = new FormData(evt.target);
    const result = await fetchAPIWithJWT("/api/profile/save", {
      email: data.get("email"),
      nickname: data.get("nickname"),
      seed: data.get("seed"),
    });

    if (!result.ok) {
      if (result.json) throw new Error(result.json.msg);
      throw new Error(result.status);
    }
    success("Password updated, please login again");

    setTimeout(() => {
      window.location.replace("/login");
    }, 1000);
  } catch (err) {
    danger(err);
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 2000);
  }
});

$("#password").on("submit", async function (evt) {
  evt.preventDefault();
  $(".submit-btn").prop("disabled", true);
  try {
    const data = new FormData(evt.target);
    const result = await fetchAPIWithJWT("/api/password/update", {
      oldPwd: data.get("o-password"),
      newPwd: data.get("n-password"),
      rePwd: data.get("r-password"),
    });

    if (!result.ok) {
      if (result.json) throw new Error(result.json.msg);
      throw new Error(result.status);
    }
    success("Profile updated");

    setTimeout(() => {
      window.location.replace("/profile");
    }, 1000);
  } catch (err) {
    danger(err);
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 2000);
  }
});
