// Message + photo submission forms on share.html. Talks to the Worker at
// /api/messages and /api/photos (same domain, see worker/wrangler.toml routes).
// Messages/photos marked "publish" by their author show up on index.html.
(function () {
  var MAX_EDGE = 1600; // longest side, px, after client-side resize

  // ---- messages ----
  var mForm = document.getElementById("message-form");
  var mStatus = document.getElementById("message-status");

  if (mForm) {
    mForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(mForm);
      var publish = fd.get("publish") ? true : false;
      var payload = {
        name: fd.get("name"),
        relationship: fd.get("relationship"),
        message: fd.get("message"),
        publish: publish,
        turnstileToken: fd.get("cf-turnstile-response"),
      };
      mStatus.textContent = "Sending…";
      fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then(function (r) {
        if (!r.ok) throw new Error();
        mStatus.textContent = publish
          ? "Thank you — your message has been sent to the family and added to the site."
          : "Thank you — your message has been sent to the family.";
        mForm.reset();
        if (window.turnstile) window.turnstile.reset();
      }).catch(function () {
        mStatus.textContent = "Sorry, something went wrong. Please try again.";
      });
    });
  }

  // ---- photos ----
  var pForm = document.getElementById("photo-form");
  var pStatus = document.getElementById("photo-status");

  // Resize in-browser and re-encode as JPEG. Drawing to a canvas also strips
  // EXIF (location, device info) since canvas never carries metadata through.
  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error("could not process image"));
        }, "image/jpeg", 0.85);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("unsupported image — try a JPG or PNG"));
      };
      img.src = url;
    });
  }

  if (pForm) {
    pForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(pForm);
      var file = fd.get("photo");
      var name = fd.get("name");
      var token = fd.get("cf-turnstile-response");
      var publish = fd.get("publish") ? "1" : "";
      if (!file || !file.size) { pStatus.textContent = "Please choose a photo."; return; }

      pStatus.textContent = "Preparing photo…";
      resizeImage(file).then(function (blob) {
        var out = new FormData();
        out.append("name", name || "");
        out.append("turnstileToken", token || "");
        out.append("publish", publish);
        out.append("photo", blob, "photo.jpg");
        pStatus.textContent = "Uploading…";
        return fetch("/api/photos", { method: "POST", body: out });
      }).then(function (r) {
        if (!r.ok) throw new Error();
        pStatus.textContent = publish
          ? "Thank you — your photo has been shared and added to the gallery."
          : "Thank you — your photo has been shared with the family.";
        pForm.reset();
        if (window.turnstile) window.turnstile.reset();
      }).catch(function (err) {
        pStatus.textContent = err && err.message ? err.message : "Sorry, something went wrong. Please try again.";
      });
    });
  }
})();
