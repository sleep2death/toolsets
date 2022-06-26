import MicroModal from "micromodal";
MicroModal.init({});

window.Parsley.addValidator("password", {
  requirementType: "string",
  validateString: function (value) {
    const res = checkPasswordValidity(value);
    if (res === null) {
      return true;
    }
    return false;
  },
  messages: {
    en: "Password invalid",
  },
});

$("#login").on("click", function (_) {
  MicroModal.show("modal-login", {
    onClose: (modal) => {
      $(`#${modal.id} .info`).toggle(false);
    },
  });
});

$("#signup").on("click", function (_) {
  MicroModal.show("modal-signup", {
    onClose: (modal) => {
      $(`#${modal.id} .info`).toggle(false);
    },
  });
});

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

$("#form-login").on("submit", function (evt) {
  evt.preventDefault();

  if ($(".parsley-error:visible").length > 0) return;

  var formData = $(this).serializeObject();
  $("#modal-login .btn").attr("disabled", true);

  $.ajax({
    type: "POST",
    url: "/ws/login",
    data: JSON.stringify(formData),
    contentType: "application/json; charset=utf-8",
    success: (res) => {
      $("#modal-login .info").toggleClass("success", true);
      $("#modal-login .info").toggle(true);
      $("#modal-login .info .title").text("success: ");

      // store token
      // localStorage.setItem("jwt", res.token);
      $(".header").html(res);
      console.log($("#token").text());

      // close signup modal
      setTimeout(function () {
        MicroModal.close();
      }, 600);
    },
    error: (err) => {
      $("#modal-login .info").toggleClass("error", true);
      $("#modal-login .info").toggleClass("success", false);
      $("#modal-login .info").toggle(true);
      $("#modal-login .info .title").text("Failed: ");

      if (err.responseJSON && err.responseJSON.msg) {
        $("#modal-login .info .message").text(err.responseJSON.msg);
      } else {
        $("#modal-login .info .message").text("Unknown error");
      }

      setTimeout(function () {
        $("#modal-login .btn").attr("disabled", false);
      }, 600);
    },
  });
});

// Signup form submit
$("#form-signup").on("submit", function (evt) {
  evt.preventDefault();
  if ($(".parsley-error:visible").length > 0) return;

  var formData = $(this).serializeObject();
  $("#modal-signup .btn").attr("disabled", true);
  $.ajax({
    type: "POST",
    url: "/ws/signup",
    data: JSON.stringify(formData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: () => {
      $("#modal-signup .info").toggleClass("success", true);
      $("#modal-signup .info").toggleClass("error", false);
      $("#modal-signup .info").toggle(true);

      $("#modal-signup .info .title").text("Success: ");
      $("#modal-signup .info .message").text("login, please!");

      // close signup modal
      setTimeout(function () {
        MicroModal.close();
      }, 600);
    },
    error: (err) => {
      $("#modal-signup .info").toggleClass("success", false);
      $("#modal-signup .info").toggleClass("error", true);
      $("#modal-signup .info").toggle(true);

      $("#modal-signup .info .title").text("Failed: ");
      if (err.responseJSON && err.responseJSON.msg) {
        $("#modal-signup .info .message").text(err.responseJSON.msg);
      } else {
        $("#modal-signup .info .message").text("Unknown error");
      }

      setTimeout(function () {
        $("#modal-signup .btn").attr("disabled", false);
      }, 600);
    },
  });
});

/**
 * @param {string} value: passwordValue
 */
const checkPasswordValidity = (value) => {
  const isNonWhiteSpace = /^\S*$/;
  if (!isNonWhiteSpace.test(value)) {
    return "Password must not contain Whitespaces.";
  }

  const isContainsUppercase = /^(?=.*[A-Z]).*$/;
  if (!isContainsUppercase.test(value)) {
    return "Password must have at least one Uppercase Character.";
  }

  const isContainsLowercase = /^(?=.*[a-z]).*$/;
  if (!isContainsLowercase.test(value)) {
    return "Password must have at least one Lowercase Character.";
  }

  const isContainsNumber = /^(?=.*[0-9]).*$/;
  if (!isContainsNumber.test(value)) {
    return "Password must contain at least one Digit.";
  }

  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
  if (!isContainsSymbol.test(value)) {
    return "Password must contain at least one Special Symbol.";
  }

  const isValidLength = /^.{9,16}$/;
  if (!isValidLength.test(value)) {
    return "Password must be 9-16 Characters Long.";
  }

  return null;
};
