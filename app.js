/* PC Software Shop v1 */
(function () {
  "use strict";
  var MM = "၀၁၂၃၄၅၆၇၈၉";
  function mm(n) { return String(n).replace(/[0-9]/g, function (d) { return MM[+d]; }); }
  function fmtSize(b) {
    b = +b || 0;
    if (b >= 1 << 30) return (b / (1 << 30)).toFixed(1) + " GB";
    if (b >= 1 << 20) return Math.round(b / (1 << 20)) + " MB";
    if (b >= 1 << 10) return Math.round(b / (1 << 10)) + " KB";
    return b + " B";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var CATS = [
    ["all", "အားလုံး", null],
    ["win", "Windows / Office", ["windows", "office", "kms", "activator", "winrar"]],
    ["adobe", "Adobe", ["adobe"]],
    ["va", "Video & Audio", ["video", "audio", "music", "filmora", "camtasia", "obs", "fl studio", "ableton"]],
    ["photo", "Photo & Graphics", ["photo", "photoshop", "lightroom", "graphic", "design", "luminar", "topaz"]],
    ["util", "Utilities", ["driver", "vpn", "antivirus", "downloader", "idm", "rufus", "cleaner", "backup"]],
    ["other", "အခြား", null]
  ];
  function catOf(name) {
    var n = (name || "").toLowerCase();
    for (var i = 1; i < CATS.length - 1; i++) {
      var kws = CATS[i][2];
      for (var j = 0; j < kws.length; j++) {
        if (n.indexOf(kws[j]) !== -1) return CATS[i][0];
      }
    }
    return "other";
  }

  var DATA = null, state = { q: "", cat: "all", shown: 0 };
  var PAGE = 60;
  var view = document.getElementById("view");
  var tabs = document.getElementById("catTabs");
  var qInput = document.getElementById("q");

  CATS.forEach(function (c, i) {
    var b = document.createElement("button");
    b.textContent = c[1];
    b.dataset.cat = c[0];
    if (i === 0) b.className = "active";
    b.onclick = function () {
      state.cat = c[0]; state.shown = 0;
      Array.prototype.forEach.call(tabs.children, function (x) {
        x.classList.toggle("active", x === b);
      });
      renderList();
    };
    tabs.appendChild(b);
  });

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var toks = q.split(/\s+/).filter(Boolean);
    return DATA.products.filter(function (p) {
      if (state.cat !== "all" && catOf(p.n) !== state.cat) return false;
      if (!toks.length) return true;
      var hay = p.n.toLowerCase();
      return toks.every(function (t) { return hay.indexOf(t) !== -1; });
    });
  }

  function thumbHtml(p, cls) {
    cls = cls || "thumb";
    if (p.cover) {
      return '<img class="' + cls + ' cover" src="' + esc(p.cover) +
        '" alt="" loading="lazy" onerror="this.outerHTML=' +
        "'<span class=\"" + cls + " fallback\">💿</span>'" + '">';
    }
    if (p.i) {
      return '<img class="' + (cls || "thumb") + '" src="' + esc(p.i) +
        '" alt="" loading="lazy" onerror="this.outerHTML=' +
        "'<span class=\"" + (cls || "thumb") + " fallback\">💿</span>'" + '">';
    }
    return '<span class="' + (cls || "thumb") + ' fallback">💿</span>';
  }

  function cardHtml(p) {
    var buyUrl = "https://t.me/" + BOT_USERNAME + "?start=buy_" + p.id;
    return '<div class="card">' +
      '<div class="chead">' + thumbHtml(p) +
      '<h3><a href="#/p/' + p.id + '">' + esc(p.n) + "</a></h3></div>" +
      '<div class="cmeta">' + mm(p.c) + " ဖိုင် · " + esc(fmtSize(p.s)) + "</div>" +
      '<div class="crow"><span class="price">' + mm(PRICE_MMK) + " ကျပ်</span>" +
      '<a class="buy" href="' + buyUrl + '" target="_blank" rel="noopener">ဝယ်မယ်</a></div>' +
      "</div>";
  }

  function renderList() {
    var list = filtered();
    state.shown = Math.min(state.shown || PAGE, list.length) || Math.min(PAGE, list.length);
    var html = '<div class="count">' + mm(list.length) + " မျိုး တွေ့ရှိပါသည်</div>";
    if (!list.length) {
      html += '<div class="empty">မတွေ့ပါ 😅<br>software နာမည်ကို အင်္ဂလိပ်လို ရိုက်ရှာကြည့်ပါ။</div>';
    } else {
      html += '<div class="grid">';
      for (var i = 0; i < state.shown; i++) html += cardHtml(list[i]);
      html += "</div>";
      if (state.shown < list.length) {
        html += '<button class="more" id="moreBtn">နောက်ထပ် ပြရန် (' +
          mm(list.length - state.shown) + " ကျန်)</button>";
      }
    }
    view.innerHTML = html;
    var more = document.getElementById("moreBtn");
    if (more) more.onclick = function () {
      state.shown = Math.min(state.shown + PAGE, list.length);
      renderList();
    };
    view.scrollIntoView();
  }

  function renderDetail(pid) {
    view.innerHTML = '<div class="count">ဖွင့်နေပါသည်…</div>';
    fetch("data/products/" + pid + ".json")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var rows = d.items.map(function (f) {
          return "<li><span>" + esc(f.n) + '</span><span class="fs">' +
            esc(fmtSize(f.s)) + "</span></li>";
        }).join("");
        var icon = "", desc = "";
        if (DATA) {
          for (var i = 0; i < DATA.products.length; i++) {
            if (DATA.products[i].id === pid) {
              icon = thumbHtml(DATA.products[i], "thumb big");
              if (DATA.products[i].d) desc = DATA.products[i].d;
              break;
            }
          }
        }
        view.innerHTML =
          '<a class="back" href="#/">← ပြန်သွားရန်</a>' +
          '<div class="detail"><div class="chead">' + icon +
          "<h2>" + esc(d.name) + "</h2></div>" +
          (desc ? '<p class="desc">' + esc(desc) + "</p>" : "") +
          '<div class="dbox">' + mm(d.count) + " ဖိုင် · စုစုပေါင်း <b>" +
          esc(fmtSize(d.size)) + "</b></div>" +
          '<ul class="flist">' + rows + "</ul>" +
          '<div class="buyrow"><span class="price" style="font-size:18px">' +
          mm(d.price) + ' ကျပ်</span>' +
          '<a class="buy big" href="' + esc(d.buy_url) +
          '" target="_blank" rel="noopener">ဝယ်မယ် 🛒</a></div>' +
          '<div class="note">ဝယ်ယူရန် နှိပ်လိုက်တာနဲ့ Telegram bot ဆီ ရောက်သွားမှာပါ။ ' +
          "ငွေလွှဲပြေစာပို့ပြီး ဖိုင်တွေ ရယူနိုင်ပါတယ်။</div></div>";
        window.scrollTo(0, 0);
      })
      .catch(function () {
        view.innerHTML = '<a class="back" href="#/">← ပြန်သွားရန်</a>' +
          '<div class="empty">ဒီ software ကို ရှာမတွေ့ပါ။</div>';
      });
  }

  function route() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/p\/([0-9a-f]+)$/);
    if (m) renderDetail(m[1]);
    else {
      if (!state.shown) state.shown = PAGE;
      renderList();
    }
  }

  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    state.q = qInput.value; state.shown = PAGE;
    if ((location.hash || "#/") !== "#/") location.hash = "#/";
    else renderList();
  });
  qInput.addEventListener("input", function () {
    state.q = qInput.value; state.shown = PAGE;
    if (DATA && (location.hash || "#/") === "#/") renderList();
  });
  window.addEventListener("hashchange", route);

  fetch("data/products.json")
    .then(function (r) { return r.json(); })
    .then(function (d) { DATA = d; route(); })
    .catch(function () {
      view.innerHTML = '<div class="empty">ဒေတာ ဖွင့်မရပါ။ ခဏနေပြန်စမ်းပါ။</div>';
    });
})();
