const token = sessionStorage.getItem("jwt");
if (!token || token.length === 0) {
  window.location.replace("/login");
}
$.ajax({
  url: "/index-auth",
  headers: { Authorization: "Bearer " + token },
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
        console.error("something wrong...");
        break;
    }
  },
  success: function (res) {
    $("#content").html(res);
  },
});
