var jwt = sessionStorage.getItem("jwt");
if (!jwt || jwt.length === 0) {
  window.location.replace("/login");
}

function loadPage() {
  $.ajax({
    url: window.location.pathname,
    headers: { Authorization: "Bearer " + jwt },
    method: "POST",
    error: function (err) {
      switch (err.status) {
        case 400:
          console.error("bad request");
          break;
        case 401:
          console.error("unauthorized");
          break;
        case 403:
          console.error("forbidden");
          break;
        default:
          console.error("oops, something wrong...");
          break;
      }
      window.location.replace(`/error?code=${err.status}`);
    },
    success: function (res) {
      $("#page-holder").html(res);
    },
  });
}
loadPage(window.location.pathname);
