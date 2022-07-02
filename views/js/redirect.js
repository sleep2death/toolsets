var jwt = sessionStorage.getItem("jwt");
if (!jwt || jwt.length === 0) {
  window.location.replace("/login");
}

loadPage = async function (url) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + jwt,
      },
    });
    $("#root").html(await resp.text());
  } catch (err) {
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
  }
};

window.loadPage(window.location.pathname);
