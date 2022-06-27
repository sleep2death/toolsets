$.fn.serializeObject = function () {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || "");
    } else {
      o[this.name] = this.value || "";
    }
  });
  return o;
};

// Signup form submit
$("#form-login").on("submit", function (evt) {
  evt.preventDefault();
  if ($(".parsley-error:visible").length > 0) return;

  var formData = $(this).serializeObject();
  $(".btn").attr("disabled", true);

  $.ajax({
    type: "POST",
    url: "/login",
    data: JSON.stringify(formData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (res) => {
      $(".info").toggleClass("success", true);
      $(".info").toggleClass("error", false);
      $(".info").toggle(true);

      $(".info .title").text("Success: ");
      $(".info .message").text("redirecting to login page");

      if (res.jwt) sessionStorage.setItem("jwt", res.jwt);

      // close signup modal
      setTimeout(function () {
        window.location.replace("/");
      }, 600);
    },
    error: (err) => {
      $(".info").toggleClass("success", false);
      $(".info").toggleClass("error", true);
      $(".info").toggle(true);

      if (err.responseJSON && err.responseJSON.msg && err.responseJSON.title) {
        $(".info .title").text(err.responseJSON.title);
        $(".info .message").text(err.responseJSON.msg);
      } else {
        $(".info .title").text("Failed: ");
        $(".info .message").text("Unknown error");
      }

      setTimeout(function () {
        $(".btn").attr("disabled", false);
      }, 500);
    },
  });
});
