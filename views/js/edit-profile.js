document.title = "Edit Profile";
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

const role = document.querySelector("input[name=role]");
const tagify = new Tagify(role, {
  enforceWhitelist: true,
  userInput: false,
  mode: "select",
  whitelist: ["admin", "member", "guest"],
});

$("#profile").on("submit", async function (evt) {
  evt.preventDefault();
  $(".submit-btn").prop("disabled", true);
  try {
    const data = new FormData(evt.target);
    const result = await fetchAPIWithJWT("/api/profile/save", {
      target: $(evt.target).data("email"),
      email: data.get("email"),
      nickname: data.get("nickname"),
      seed: data.get("seed"),
    });

    if (!result.ok) {
      if (result.json) throw new Error(result.json.msg);
      throw new Error(result.status);
    }
    success("Profile updated");
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
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
      target: $(evt.target).data("email"),
      newPwd: data.get("n-password"),
      rePwd: data.get("r-password"),
    });

    if (!result.ok) {
      if (result.json) throw new Error(result.json.msg);
      throw new Error(result.status);
    }
    success("Password updated");
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 1000);
  } catch (err) {
    danger(err);
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 2000);
  }
});

$("#staff").on("submit", async function (evt) {
  evt.preventDefault();
  $(".submit-btn").prop("disabled", true);
  try {
    const result = await fetchAPIWithJWT("/api/staff/update", {
      target: $(evt.target).data("email"),
      role: tagify.value[0].value,
    });

    if (!result.ok) {
      if (result.json) throw new Error(result.json.msg);
      throw new Error(result.status);
    }
    success("User staff updated");
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 1000);
  } catch (err) {
    danger(err);
    setTimeout(() => {
      $(".submit-btn").removeAttr("disabled");
    }, 2000);
  }
});

function back() {
  window.location.replace("/admin/users");
}
