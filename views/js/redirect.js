var jwt = sessionStorage.getItem("jwt");
if (!jwt || jwt.length === 0) {
  window.location.replace("/login");
}

window.loadPage = async function (url) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + jwt,
      },
    });
    $("#page-holder").html(await resp.text());
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

window.loadData = async function (url, data) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + jwt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await resp.json();
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
