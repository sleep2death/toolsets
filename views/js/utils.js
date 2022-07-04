async function fetchAPI(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const d = {};
  d.ok = res.ok;
  d.status = res.status;

  try {
    d.json = await res.json();
  } catch (err) {
    console.error(err);
  }
  return d;
}

async function fetchAPIWithJWT(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + jwt,
    },
    body: JSON.stringify(data),
  });

  const d = {};
  d.ok = res.ok;
  d.status = res.status;

  try {
    d.json = await res.json();
  } catch (err) {
    console.error(err);
  }
  return d;
}

async function getAvatar(seed) {
  const d = await fetchAPIWithJWT("/api/avatar/seed", { seed });
  if (!d.ok) {
    if (d.json) {
      danger(d.json.msg);
    } else {
      danger("Cant get avatar: " + d.status);
    }
    return null;
  }
  return d.json.svg;
}

function danger(title) {
  $("#bottom-slider").removeClass("slide-out");
  $("#bottom-slider").addClass("slide-in");

  $("#bottom-slider span").addClass("bg-red-400");
  $("#bottom-slider span").removeClass("bg-green-400");

  $("#bottom-slider .title").text(title);
  setTimeout(slideOut, 2000);
}

function success(title) {
  $("#bottom-slider").removeClass("slide-out");
  $("#bottom-slider").addClass("slide-in");

  $("#bottom-slider span").addClass("bg-green-400");
  $("#bottom-slider span").removeClass("bg-red-400");

  $("#bottom-slider .title").text(title);
  setTimeout(slideOut, 2000);
}

function slideOut() {
  $("#bottom-slider").toggleClass("slide-in");
  $("#bottom-slider").addClass("slide-out");
}
