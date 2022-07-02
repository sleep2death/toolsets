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

  d.json = await res.json();
  return d;
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
