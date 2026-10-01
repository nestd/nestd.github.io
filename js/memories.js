// Renders messages + photos that guests opted to share publicly (see
// share.html / worker/src/index.js). Only runs if the section exists.
(function () {
  var mList = document.getElementById("memories-messages");
  var pGrid = document.getElementById("memories-photos");
  var empty = document.getElementById("memories-empty");
  if (!mList || !pGrid) return;

  var gotMessages = false, gotPhotos = false, haveAny = false;

  function checkEmpty() {
    if (gotMessages && gotPhotos && !haveAny) empty.hidden = false;
  }

  fetch("/api/messages").then(function (r) { return r.json(); }).then(function (items) {
    items.forEach(function (m) {
      haveAny = true;
      var li = document.createElement("li");
      var who = document.createElement("p");
      who.className = "message-who";
      who.textContent = m.name + (m.relationship ? " — " + m.relationship : "");
      var body = document.createElement("p");
      body.className = "message-body";
      body.textContent = m.message;
      li.appendChild(who);
      li.appendChild(body);
      mList.appendChild(li);
    });
  }).catch(function () {}).then(function () { gotMessages = true; checkEmpty(); });

  fetch("/api/photos").then(function (r) { return r.json(); }).then(function (items) {
    items.forEach(function (p) {
      haveAny = true;
      var fig = document.createElement("figure");
      var img = document.createElement("img");
      img.src = p.url;
      img.alt = p.name ? "Shared by " + p.name : "Shared photo";
      img.loading = "lazy";
      fig.appendChild(img);
      if (p.name) {
        var cap = document.createElement("figcaption");
        cap.textContent = p.name;
        fig.appendChild(cap);
      }
      pGrid.appendChild(fig);
    });
  }).catch(function () {}).then(function () { gotPhotos = true; checkEmpty(); });
})();
