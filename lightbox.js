(function(win, doc) {
  // SFW fractals from Reddit
  var API_URL = 'http://www.reddit.com/r/FractalPorn/.json?jsonp=processResults&count=125',
      // Corresponding thumbnail to image in lightbox.
      curEl,
      // Convenience references for DOM nodes.
      content,
      overlay,
      // JSONP script refrence for clean up.
      script;

  // Hide image elements to prevent additional requests.
  function cacheEl(el) {
    el.classList.add('hidden');
    // Imgur keys are unique.
    el.id = imgurKey(el.src);
  }

  function clearLightBox() {
    overlay.classList.add('hidden');
    // Target the current visible image displayed in lightbox.
    cacheEl(doc.querySelector('.full:not(.hidden)'));
    curEl.focus();
  }

  function createImg(src, opts) {
    var img = doc.createElement('img');
    img.src = src;

    if (opts) {
      // Only thumbnail images pass options.
      img.classList.add('thumbnail');
      img.setAttribute('data-key', opts.key);
      img.setAttribute('tabindex', 0);
      img.setAttribute('title', opts.title);
    } else {
      // Assume it's the full image.
      img.classList.add('full');
    }

    return img;
  }

  // Listen to specific events on a node higher up in hierarchy.
  function delegateEvent(nodeType, callback) {
    return function(evt) {
      var el = evt.target;
      if (el.tagName === nodeType) {
        // Pass event to allow use with other functions.
        callback(el, evt);
      }
    };
  }

  // Append script to get JSONP to work.
  function getJSON() {
    script = doc.createElement('script');
    script.src = API_URL;
    doc.body.appendChild(script);
  }

  // Manage click handlers and link state.
  function handleNav(direction) {
    var nav = doc.getElementById(direction + '-link'),
        sibling = curEl[direction + 'Sibling'],
        clone;

    if (sibling) {
      nav.classList.remove('hidden');
      // Removing event listener directly didn't work.
      clone = nav.cloneNode(true);
      nav.parentNode.replaceChild(clone, nav);
      clone.addEventListener('click', navListener(direction));
    } else {
      nav.classList.add('hidden');
    }
  }

  // Listen to key events and respond with callback.
  function handleKey(code, callback) {
    var keyMap;
    // Allow multiple handlers to be passed in.
    if (typeof code !== 'object') {
      (keyMap = {})[code] = callback;
    } else {
      keyMap = code;
    }

    return function(el, evt) {
      var method = keyMap[evt.keyCode];
      if (method) {
        method(el);
      }
    };
  }

  // Hack up the full image location for Imgur posts.
  function imgurKey(url) {
    return url.split('/').pop().split('.').shift();
  }

  function makeLightBox(el) {
    var key = el.getAttribute('data-key'),
        img = doc.getElementById(key);

    // Track top level to keep function signatures simple.
    curEl = el;

    if (img) {
      // Used the cached image.
      img.classList.remove('hidden');
    } else {
      // Fetch image since it's new.
      img = createImg('http://i.imgur.com/' + key + '.jpg');
      doc.getElementById('nav-links').insertAdjacentHTML('beforebegin', img.outerHTML);
    }

    setupFields();
    overlay.classList.remove('hidden');
    doc.querySelector('.nav-links > a:not(.hidden)').focus();
  }

  // DRY up navigation logic.
  function navListener(direction) {
    return function listener() {
      var el = curEl[direction + 'Sibling'];
      // Check element to make method reusable for keyboard events.
      if (el) {
        clearLightBox();
        makeLightBox(el);
      }
    };
  }

  // Pull fields out of JSONP response.
  function parseResults(resp) {
    var data, imgSrc, imgEl, imgFull, imgTitle;

    resp.forEach(function(el) {
      data = el.data;
      imgSrc = data.thumbnail;
      imgFull = data.url;
      imgTitle = data.title;
      // Cheap test to see if there's an image extension.
      if (imgSrc.indexOf('.') !== -1 && imgFull.indexOf('imgur') !== -1) {
        imgEl = createImg(imgSrc, {key: imgurKey(imgFull), title: imgTitle});
        content.appendChild(imgEl);
      }
    });
  }

  function setupFields() {
    var sep = doc.getElementById('separator');

    doc.getElementById('nav-title').innerHTML = curEl.title;
    // Manage nav handlers and state.
    handleNav('previous');
    handleNav('next');

    // Remove the separator if we're on a boundary image.
    if (curEl.previousSibling && curEl.nextSibling) {
      sep.classList.remove('hidden');
    } else {
      sep.classList.add('hidden');
    }
  }

  // JSONP callback
  win.processResults = function(resp) {
    var data = resp.data.children;
    parseResults(data);
    doc.body.removeChild(script);
  };

  doc.addEventListener('DOMContentLoaded', function() {
    // Store common nodes.
    content = doc.getElementById('content');
    overlay = doc.getElementById('overlay');

    getJSON();
    content.addEventListener('click', delegateEvent('IMG', makeLightBox));
    content.addEventListener('keyup', delegateEvent('IMG', handleKey(13, makeLightBox)));
    overlay.addEventListener('click', delegateEvent('DIV', clearLightBox));
    overlay.addEventListener('keyup', delegateEvent('A', handleKey({
      // Enter
      27: clearLightBox,
      // Left arrow
      37: navListener('previous'),
      // Right arrow
      39: navListener('next')
    })));
  });

}(window, document));
