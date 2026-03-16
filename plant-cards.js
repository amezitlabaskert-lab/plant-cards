/* =========================================================
   plant-cards.js  v2.4
   
   Változások:
     v2.4 - stopVideosInCard: YouTube postMessage pause parancs az iframe src
             törlése helyett — így nem veszik el a videóadat visszalépéskor.
             Az src-t a kód egyáltalán nem módosítja többé.
   ========================================================= */

(function () {
  'use strict';

  function loadCSS(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function displayName(v) {
    if (v.name) return v.name;
    var parts = [];
    if (v.nameEU) parts.push(v.nameEU);
    if (v.nameUS) parts.push(v.nameUS);
    return parts.join(' / ');
  }

  function accentGradient(color) {
    if (!color || !color.rgb) return 'linear-gradient(#c9b0e0, #a080c0)';
    var r = color.rgb[0], g = color.rgb[1], b = color.rgb[2];
    var dr = Math.max(0, r - 30);
    var dg = Math.max(0, g - 30);
    var db = Math.max(0, b - 30);
    return 'linear-gradient(rgb(' + r + ',' + g + ',' + b + '), rgb(' + dr + ',' + dg + ',' + db + '))';
  }

  function swatchStyle(color) {
    if (!color || !color.rgb) return 'background:#ddd;';
    var rgb = color.rgb;
    if (color.rhsNote) {
      var r2 = Math.max(0, rgb[0] - 40);
      var g2 = Math.max(0, rgb[1] - 40);
      var b2 = Math.max(0, rgb[2] - 40);
      return 'background: linear-gradient(135deg, rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ') 50%, rgb(' + r2 + ',' + g2 + ',' + b2 + ') 50%);';
    }
    var isLight = (rgb[0] + rgb[1] + rgb[2]) > 680;
    return 'background: rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ');'
         + (isLight ? ' box-shadow: rgba(0,0,0,0.06) 0px 1px 3px inset; border: 1px solid rgba(0,0,0,0.1);' : '');
  }

  function buildCard(v, seriesName) {
    var name    = displayName(v);
    var cultivar = v.cultivar ? v.cultivar + (v.year ? ' (' + v.year + ')' : '') : '';
    var accent  = accentGradient(v.color);

    var patentBadge = '';
    if (v.patent && v.patentUrl) {
      patentBadge = '<span class="pc-patent-link" data-url="' + v.patentUrl + '">'
                  + v.patent + ' 🔗</span>';
    } else if (v.patentNote) {
      patentBadge = '<span class="pc-patent-pending">' + v.patentNote + '</span>';
    }

    var marketBadge = '';
    if (v.availableMarkets && v.availableMarkets.length === 1) {
      if (v.availableMarkets[0] === 'US') {
        marketBadge = '<span class="pc-market-badge pc-market-us">🇺🇸 US only</span>';
      } else if (v.availableMarkets[0] === 'EU') {
        marketBadge = '<span class="pc-market-badge pc-market-eu">🇪🇺 EU only</span>';
      }
    }

    var colorSection = '';
    if (v.color) {
      var rhs = v.color.rhs
        ? '<div class="pc-color-rhs">RHS ' + v.color.rhs + (v.color.rhsNote ? ' · ' + v.color.rhsNote : '') + '</div>'
        : '';
      var rgb = v.color.rgb
        ? '<div class="pc-color-rgb">' + v.color.rgb.join(', ') + '</div>'
        : '';
      colorSection = '<div>'
        + '<div class="pc-detail-label">Virágszín</div>'
        + '<div class="pc-color-row">'
        +   '<div class="pc-color-swatch" style="' + swatchStyle(v.color) + '"></div>'
        +   '<div>'
        +     '<div class="pc-color-name">' + (v.color.name || '') + '</div>'
        +     rhs + rgb
        +   '</div>'
        + '</div>'
        + '</div>';
    }

    var habitusSection = '<div class="pc-habitus">'
      + '<div class="pc-detail-label">Habitus · Virágméret · Illat</div>'
      + '<div class="pc-habitus-text">' + (v.habit      || 'n.a.') + '</div>'
      + '<div class="pc-habitus-text">' + (v.flowerSize || 'n.a.') + '</div>'
      + '<div class="pc-habitus-text">' + (v.scent      || 'n.a.') + '</div>'
      + '</div>';

    var divider = colorSection ? '<div class="pc-divider"></div>' : '';

    var mediaSection = '';
    if (v.media) {
      if (v.media.type === 'youtube' && v.media.id) {
        // enablejsapi=1 szükséges a postMessage pause parancshoz
        var ytParams = '?rel=0&playsinline=1&enablejsapi=1'
                     + '&origin=' + encodeURIComponent(window.location.origin);
        var ytSrc = 'https://www.youtube.com/embed/' + v.media.id + ytParams;
        mediaSection = '<div class="pc-media">'
          + '<div class="pc-video-wrap">'
          + '<iframe '
          + 'src="' + ytSrc + '" '
          + 'title="' + name + '" '
          + 'frameborder="0" '
          + 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" '
          + 'allowfullscreen '
          + 'loading="lazy">'
          + '</iframe>'
          + '</div></div>';
      } else if (v.media.type === 'image' && v.media.url) {
        mediaSection = '<div class="pc-media">'
          + '<img src="' + v.media.url + '" alt="' + name + '" loading="lazy"'
          + (v.media.fallbackColor ? ' onerror="this.style.background=\'' + v.media.fallbackColor + '\';this.alt=\'\'"' : '')
          + '></div>';
      }
    }

    return '<div class="pc-card">'
      + '<div class="pc-card-body">'
      +   '<div class="pc-accent-bar" style="background:' + accent + ';"></div>'
      +   '<div class="pc-card-content">'
      +     '<div class="pc-card-header">'
      +       '<div>'
      +         '<div class="pc-series-tag">' + seriesName + '</div>'
      +         '<div class="pc-card-title-row">'
      +           '<div class="pc-card-title">' + name + '</div>'
      +           (marketBadge ? marketBadge : '')
      +         '</div>'
      +         (cultivar ? '<div class="pc-card-subtitle">' + cultivar + '</div>' : '')
      +       '</div>'
      +       patentBadge
      +     '</div>'
      +     '<div class="pc-card-details">'
      +       colorSection + divider + habitusSection
      +     '</div>'
      +   '</div>'
      + '</div>'
      + mediaSection
      + '</div>';
  }

  function buildCarousel(series, carouselId) {
    var seriesDisplayName = series.name ||
      [series.nameUS ? '🇺🇸 ' + series.nameUS : '',
       series.nameEU ? '🇪🇺 ' + series.nameEU : '']
      .filter(Boolean).join(' / ') || '';
    var cards = series.varieties.map(function (v) {
      return buildCard(v, seriesDisplayName);
    }).join('');
    var total = series.varieties.length;

    return '<div class="pc-carousel-section" id="pc-carousel-' + carouselId + '">'
      +   '<div class="pc-track-wrap">'
      +     '<div class="pc-track" id="pc-track-' + carouselId + '">'
      +       cards
      +     '</div>'
      +   '</div>'
      +   '<div class="pc-nav">'
      +     '<button class="pc-btn" id="pc-prev-' + carouselId + '" disabled>←</button>'
      +     '<div class="pc-dots" id="pc-dots-' + carouselId + '"></div>'
      +     '<span class="pc-counter" id="pc-counter-' + carouselId + '">1 / ' + total + '</span>'
      +     '<button class="pc-btn" id="pc-next-' + carouselId + '">→</button>'
      +   '</div>'
      + '</div>';
  }

  /* ---------------------------------------------------------
     Video leállítás — src törlése nélkül
     
     A YouTube iFrame API postMessage protokollja:
     { event: "command", func: "pauseVideo", args: [] }
     Ezt el kell küldeni az iframe contentWindow-ának.
     Ha a videó még nem játszott, a parancs nem csinál semmit — ez rendben van.
  --------------------------------------------------------- */
  function pauseVideosInCard(card) {
    card.querySelectorAll('iframe').forEach(function (iframe) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          'https://www.youtube.com'
        );
      } catch (e) {
        // cross-origin hiba esetén csendben elnyeljük
      }
    });
  }

  var pcState = {};

  function pcInitCarousel(id, total) {
    pcState[id] = { cur: 0, total: total };

    var track   = document.getElementById('pc-track-' + id);
    var dotsEl  = document.getElementById('pc-dots-' + id);
    var prevBtn = document.getElementById('pc-prev-' + id);
    var nextBtn = document.getElementById('pc-next-' + id);

    if (!track || !dotsEl) return;

    var cards = track.querySelectorAll('.pc-card');
    cards.forEach(function (c, i) { c.classList.toggle('active', i === 0); });

    dotsEl.innerHTML = '';
    for (var i = 0; i < total; i++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.className = 'pc-dot' + (idx === 0 ? ' active' : '');
        dot.setAttribute('aria-label', (idx + 1) + '. kártya');
        dot.addEventListener('click', function () { pcGoTo(id, idx); });
        dotsEl.appendChild(dot);
      })(i);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { pcGoTo(id, pcState[id].cur - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { pcGoTo(id, pcState[id].cur + 1); });

    var wrap = document.querySelector('#pc-carousel-' + id + ' .pc-track-wrap');
    if (wrap) {
      var startX = 0;
      wrap.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });
      wrap.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) pcGoTo(id, pcState[id].cur + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }
  }

  function pcGoTo(id, idx) {
    var s = pcState[id];
    if (!s) return;
    idx = Math.max(0, Math.min(s.total - 1, idx));
    s.cur = idx;

    var track = document.getElementById('pc-track-' + id);
    if (track) {
      track.querySelectorAll('.pc-card').forEach(function (c, i) {
        // Elhagyott kártyán pause — src érintése nélkül
        if (c.classList.contains('active') && i !== idx) {
          pauseVideosInCard(c);
        }
        c.classList.toggle('active', i === idx);
      });
    }

    var dotsEl = document.getElementById('pc-dots-' + id);
    if (dotsEl) {
      dotsEl.querySelectorAll('.pc-dot').forEach(function (d, i) {
        d.className = 'pc-dot' + (i === idx ? ' active' : '');
      });
    }

    var counter = document.getElementById('pc-counter-' + id);
    if (counter) counter.textContent = (idx + 1) + ' / ' + s.total;

    var prevBtn = document.getElementById('pc-prev-' + id);
    var nextBtn = document.getElementById('pc-next-' + id);
    if (prevBtn) prevBtn.disabled = (idx === 0);
    if (nextBtn) nextBtn.disabled = (idx === s.total - 1);
  }

  function render(container, data, filterIds) {
    var html = '';
    data.series.forEach(function (series, si) {
      if (filterIds && filterIds.length && filterIds.indexOf(series.id) === -1) return;
      var carouselId = series.id || ('series-' + si);
      html += buildCarousel(series, carouselId);
    });

    container.innerHTML = html;

    if (window.twemoji) {
      twemoji.parse(container, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
        callback: function (icon, options) {
          if (icon.indexOf('1f1') === 0) {
            return ''.concat(options.base, options.size, '/', icon, options.ext);
          }
          return false;
        }
      });
    }

    data.series.forEach(function (series, si) {
      if (filterIds && filterIds.length && filterIds.indexOf(series.id) === -1) return;
      var carouselId = series.id || ('series-' + si);
      if (series.varieties.length > 0) pcInitCarousel(carouselId, series.varieties.length);
    });
  }

  function initContainer(container) {
    if (container.getAttribute('data-pc-init')) return;
    container.setAttribute('data-pc-init', '1');

    var src        = container.getAttribute('data-src');
    var cssUrl     = container.getAttribute('data-css');
    var seriesAttr = container.getAttribute('data-series');
    var filterIds  = seriesAttr ? seriesAttr.trim().split(/\s+/) : [];

    if (cssUrl) {
      loadCSS(cssUrl);
    } else {
      document.querySelectorAll('script[src]').forEach(function (s) {
        if (s.src && s.src.indexOf('plant-cards.js') !== -1) {
          loadCSS(s.src.replace('plant-cards.js', 'plant-cards.css'));
        }
      });
    }

    container.innerHTML = '<div class="pc-loading">Betöltés…</div>';

    fetch(src)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) { render(container, data, filterIds); })
      .catch(function (err) {
        container.innerHTML = '<div class="pc-error">Nem sikerült betölteni az adatokat.<br><small>' + err.message + '</small></div>';
      });
  }

  function init(scope) {
    (scope || document).querySelectorAll('.plant-cards[data-src]').forEach(initContainer);
  }

  window.reinitPlantCards = function (scope) { init(scope); };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('.pc-patent-link');
    if (!el) return;
    var url = el.getAttribute('data-url');
    if (url) window.open(url, '_blank', 'noopener');
  });

  console.log('%c🌿 plant-cards.js v2.4 betöltve', 'color: #7b4ea0; font-weight: bold;');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

})();
