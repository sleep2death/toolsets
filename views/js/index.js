import MicroModal from "micromodal";
MicroModal.init({
  onShow: (modal) => console.info(`${modal.id} is shown`),
  debugMode: true,
});

window.Parsley.addValidator('password', {
  requirementType: 'string',
  validateString: function (value) {
    const res = checkPasswordValidity(value)
    if (res === null) {
      return true
    }

    console.warn(res)
    return false
  },
  messages: {
    en: 'Password invalid'
  }
})

$("#new").on("click", function (_) {
  MicroModal.show("modal-login");
});

$("#signup").on("click", function (_) {
  MicroModal.close();
  MicroModal.show("modal-signup");
});

$.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

$("#form-signup").on('submit',function( evt ) {
  evt.preventDefault();
  var formData = $(this).serializeObject();
  console.log(formData);
});

$(function () {
  $('#form-login').parsley().on('field:validated', function () {
    // console.log($('.parsley-error').length)
  })
})

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

  const isContainsSymbol =
    /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
  if (!isContainsSymbol.test(value)) {
    return "Password must contain at least one Special Symbol.";
  }

  const isValidLength = /^.{9,16}$/;
  if (!isValidLength.test(value)) {
    return "Password must be 9-16 Characters Long.";
  }

  return null;
}
