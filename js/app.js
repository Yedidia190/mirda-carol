(function () {
  "use strict";
  
  var CONFIG = {
    stars: [
      {
        x: 18, y: 16, tag: "2023",
        title: "Le début",
        text: "En 2023, je t'ai découverte. Je ne savais pas encore que tu ferai partis des personne qui compte pour moi.",
        photo: "images/souvenirs/debut.jpg"
      },
      {
        x: 52, y: 9,
        title: "Ton rire",
        text: "Il y a des sons qui réparent une journée. Ton rire en fait partie.",
        photo: "images/souvenirs/rire.jpg"
      },
      {
        x: 80, y: 24,
        title: "Ta sensibilité",
        text: "Tu ressens les choses fort, et c'est ce qui te rend si humaine. Chez toi, ce n'est pas une faiblesse. C'est une lumière.",
        photo: "images/souvenirs/sensibilite.webp"
      },
      {
        x: 76, y: 50,
        title: "Les petites attentions",
        text: "Tu remarques les détails que la plupart ne voit. Cette étoile est l'un détail que j'ai remarqué chez toi.",
        photo: "images/souvenirs/attention.jpg"
      },
      {
        x: 46, y: 46,
        title: "Tes mots",
        text: "Certaines de tes phrases me sont restées en tête. Elles m'ont plus aidé que tu ne le crois.",
        photo: "images/souvenirs/mots.jpg"
      },
      {
        x: 20, y: 56,
        title: "Ce qui nous reste",
        text: "Les discussions, les fous rires, les silences sans gêne. Tout ça compte pour moi.",
        photo: "images/souvenirs/souvenirs.webp"
      },
      {
        x: 30, y: 82,
        title: "Mon souhait",
        text: "Que cette nouvelle année t'apporte autant de douceur que tu en donnes aux autres.",
        photo: "images/souvenirs/souhait.webp"
      },
      { x: 68, y: 78, final: true }
    ],
    letter: [
      "Carol,",
      "Si tu lis ces lignes, c'est que tu as ouvert toutes les étoiles. Chacune était un morceau de ce que je pense de toi depuis 2023.",
      "On t'appelle Soleil, et ce n'est pas un hasard : tu éclaires les gens autour de toi sans même t'en rendre compte, moi y compris.",
      "Je ne sais pas toujours bien dire ces choses à voix haute. Alors j'ai fait ce que je sais faire : j'ai écrit du code pour toi."
    ],
    wish: "Joyeux anniversaire, Soleil.",
    after: "Que cette année te rende tout ce que tu donnes.",
    signature: "Jewel"
  };

  var STORE_KEY = "univers-de-carol-etoiles";
  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (selector) { return document.querySelector(selector); };

  var sky = $("#sky");
  var field = $("#field");
  var linesSvg = $("#lines");
  var hint = $("#hint");
  var card = $("#card");
  var cardClose = $("#cardClose");
  var letter = $("#letter");
  var paper = $("#paper");
  var reread = $("#reread");
  var soundBtn = $("#soundBtn");

  var stars = CONFIG.stars;
  var N = stars.length;
  var FINAL = N - 1;
  var MEMORIES = N - 1;
  var opened = {};

  try {
    JSON.parse(localStorage.getItem(STORE_KEY) || "[]").forEach(function (i) {
      if (Number.isInteger(i) && i >= 0 && i < FINAL) opened[i] = true;
    });
  } catch (e) {}

  function count() { return Object.keys(opened).length; }
  function finalReady() { return count() >= MEMORIES; }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(Object.keys(opened).map(Number)));
    } catch (e) {}
  }

  /* Construction du ciel et des étoiles */
  var SVGNS = "http://www.w3.org/2000/svg";
  var lineEls = [];
  var starEls = [];
  var dotEls = [];

  for (var i = 1; i < N; i++) {
    var line = document.createElementNS(SVGNS, "line");
    line.setAttribute("x1", stars[i - 1].x);
    line.setAttribute("y1", stars[i - 1].y);
    line.setAttribute("x2", stars[i].x);
    line.setAttribute("y2", stars[i].y);
    line.setAttribute("class", "ln");
    linesSvg.appendChild(line);
    lineEls[i] = line;
  }

  stars.forEach(function (star, index) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "star" + (star.final ? " final" : "");
    button.style.left = star.x + "%";
    button.style.top = star.y + "%";
    button.setAttribute(
      "aria-label",
      star.final ? "Dernière étoile" : "Étoile " + (index + 1) + " sur " + MEMORIES
    );
    button.addEventListener("click", function () { onStar(index); });
    field.appendChild(button);
    starEls[index] = button;
  });

  var dots = $("#dots");
  for (var d = 0; d < MEMORIES; d++) {
    var dot = document.createElement("span");
    dots.appendChild(dot);
    dotEls[d] = dot;
  }

  function active(index) {
    return index === FINAL ? finalReady() : !!opened[index];
  }

  function render() {
    var openedCount = count();

    stars.forEach(function (star, index) {
      var element = starEls[index];
      if (star.final) {
        element.classList.toggle("locked", !finalReady());
        element.setAttribute("aria-disabled", finalReady() ? "false" : "true");
      } else {
        element.classList.toggle("on", !!opened[index]);
      }
    });

    for (var k = 1; k < N; k++) {
      lineEls[k].classList.toggle("show", active(k - 1) && active(k));
    }

    dotEls.forEach(function (element, index) {
      element.classList.toggle("on", openedCount > index);
    });

    var left = MEMORIES - openedCount;
    if (left > 1) hint.textContent = "Il reste " + left + " étoiles à ouvrir.";
    else if (left === 1) hint.textContent = "Plus qu'une étoile à ouvrir.";
    else hint.textContent = "Une dernière étoile, dorée, vient de s'allumer. Touche-la.";
  }

  /* Fiche d'un souvenir */
  var lastFocus = null;

  function openCard(index) {
    var star = stars[index];

    $("#cardTag").textContent =
      (star.tag ? star.tag + " · " : "") +
      "Étoile " + (index + 1) + " sur " + MEMORIES;
    $("#cardTitle").textContent = star.title || "Un souvenir";
    $("#cardText").textContent = star.text || "";

    var img = $("#cardImg");
    if (star.photo) {
      img.onerror = function () {
        img.hidden = true;
        console.warn("Photo introuvable : " + star.photo);
      };
      img.onload = function () { img.hidden = false; };
      img.alt = star.title ? "Photo du souvenir : " + star.title : "Photo d'un souvenir";
      img.src = star.photo;
      img.hidden = false;
    } else {
      img.hidden = true;
      img.removeAttribute("src");
      img.removeAttribute("alt");
    }

    lastFocus = document.activeElement;
    card.hidden = false;
    requestAnimationFrame(function () {
      card.classList.add("open");
      cardClose.focus();
    });

    opened[index] = true;
    save();
    render();
    chime([660, 880]);
  }

  function closeCard() {
    card.classList.remove("open");
    setTimeout(function () { card.hidden = true; }, reduce ? 0 : 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  cardClose.addEventListener("click", closeCard);
  $("#cardBackdrop").addEventListener("click", closeCard);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (!card.hidden) closeCard();
      else if (!letter.hidden && reread.hidden) hideLetter();
    }
  });

  function onStar(index) {
    if (stars[index].final) {
      if (!finalReady()) {
        hint.textContent = "Ouvre d'abord toutes les autres étoiles.";
        return;
      }
      startSunrise();
    } else {
      openCard(index);
    }
  }

  /* Lever de soleil et lettre finale */
  var risen = false;

  function buildLetter() {
    paper.innerHTML = "";
    var index = 0;

    function addParagraph(className, text) {
      var paragraph = document.createElement("p");
      if (className) paragraph.className = className;
      paragraph.textContent = text;
      paragraph.style.transitionDelay = (reduce ? 0 : 0.5 + index * 0.9) + "s";
      index++;
      paper.appendChild(paragraph);
    }

    CONFIG.letter.forEach(function (text) { addParagraph("", text); });
    addParagraph("wish", CONFIG.wish);
    addParagraph("", CONFIG.after);
    addParagraph("sign", "— " + CONFIG.signature);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = "Regarder le soleil";
    button.addEventListener("click", hideLetter);
    paper.appendChild(button);
  }

  function showLetter() {
    buildLetter();
    reread.hidden = true;
    letter.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { letter.classList.add("show"); });
    });
  }

  function hideLetter() {
    letter.classList.remove("show");
    setTimeout(function () {
      letter.hidden = true;
      reread.hidden = false;
      reread.focus();
    }, reduce ? 0 : 600);
  }

  reread.addEventListener("click", showLetter);

  function startSunrise() {
    if (risen) return;
    risen = true;
    sky.classList.add("rising");
    chime([392, 523, 659, 784], 0.45);
    setTimeout(showLetter, reduce ? 200 : 7500);
  }

  /* Son */
  var audioCtx = null;
  var soundOn = true;

  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    soundBtn.textContent = "Son : " + (soundOn ? "oui" : "non");
    soundBtn.setAttribute("aria-pressed", String(soundOn));
  });

  function chime(frequencies, gap) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();

      frequencies.forEach(function (frequency, index) {
        var time = audioCtx.currentTime + index * (gap || 0.14);
        var oscillator = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.14, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start(time);
        oscillator.stop(time + 1.5);
      });
    } catch (error) {
      console.warn("Le son n'est pas disponible dans ce navigateur.", error);
    }
  }

  /* Fond étoilé animé */
  var canvas = $("#bg");
  var ctx = canvas.getContext("2d");
  var backgroundStars = [];
  var W = 0;
  var H = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = sky.clientWidth;
    H = sky.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var number = Math.round(Math.min(160, (W * H) / 5500));
    backgroundStars = [];

    for (var q = 0; q < number; q++) {
      backgroundStars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.85,
        r: Math.random() * 1.3 + 0.3,
        p: Math.random() * 6.28,
        v: Math.random() * 1.2 + 0.4
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    for (var q = 0; q < backgroundStars.length; q++) {
      var star = backgroundStars[q];
      var alpha = reduce
        ? 0.7
        : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time / 1000 * star.v + star.p));

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#f7e9b8";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, 6.2832);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    if (!reduce && !risen) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", function () {
    resize();
    draw(performance.now());
  });

  resize();
  requestAnimationFrame(draw);
  render();
})();
