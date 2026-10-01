// Renders messages that guests opted to share publicly (see share.html /
// worker/src/index.js). Opted-in photos go into the main gallery instead
// (see Gallery.addPhotos in gallery.js) so they share the lightbox with the
// curated photos rather than living in a separate list.
(function () {
  var mList = document.getElementById("memories-messages");
  var empty = document.getElementById("memories-empty");
  if (!mList) return;

  fetch("/api/messages").then(function (r) { return r.json(); }).then(function (items) {
    items.forEach(function (m) {
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
    if (!items.length && empty) empty.hidden = false;
  }).catch(function () {});

  if (window.Gallery) {
    fetch("/api/photos").then(function (r) { return r.json(); }).then(function (items) {
      window.Gallery.addPhotos(items.map(function (p) {
        return { src: p.url, thumb: p.url, alt: p.name ? "Shared by " + p.name : "Shared photo" };
      }));
    }).catch(function () {});
  }
})();
