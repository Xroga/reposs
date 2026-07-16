/*! Xroga Live AI — free endpoints first; BYOK via Xroga Integrations */
(function (global) {
  'use strict';
  var X = global.XrogaLiveAi || {};

  function pollinationsChat(messages, system) {
    var last = '';
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].role === 'user') { last = String(messages[i].content || ''); break; }
    }
    var prompt = (system ? system + '\n\n' : '') + last;
    var url = 'https://text.pollinations.ai/' + encodeURIComponent(prompt.slice(0, 1800)) + '?model=openai';
    return fetch(url, { method: 'GET' }).then(function (r) {
      if (!r.ok) throw new Error('Pollinations ' + r.status);
      return r.text();
    }).then(function (t) { return (t || '').trim() || 'No reply — try again.'; });
  }

  function imageUrl(prompt, w, h) {
    var width = w || 1024, height = h || 576;
    return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(String(prompt || 'abstract').slice(0, 400))
      + '?width=' + width + '&height=' + height + '&nologo=true';
  }

  /** Optional: call Xroga account proxy when page is opened inside Xroga (cookie auth). */
  function xrogaProxyChat(messages, system) {
    var body = JSON.stringify({ messages: messages, system: system || '' });
    return fetch('/api/integrations/live-ai/chat', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    }).then(function (r) {
      if (!r.ok) throw new Error('proxy ' + r.status);
      return r.json();
    }).then(function (j) { return String(j.reply || j.content || ''); });
  }

  function xrogaProxySearch(query) {
    return fetch('/api/integrations/live-ai/search', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, maxResults: 5 }),
    }).then(function (r) {
      if (!r.ok) throw new Error('search ' + r.status);
      return r.json();
    }).then(function (j) { return j.results || []; });
  }

  X.chat = function (messages, opts) {
    opts = opts || {};
    var system = opts.system || 'You are a helpful assistant inside a website built with Xroga.';
    // Prefer free Pollinations so GitHub/Vercel previews work with zero keys.
    // If Xroga proxy is available (same-origin dashboard preview), try it first for BYOK quality.
    var tryProxy = opts.preferXrogaProxy !== false && typeof location !== 'undefined'
      && /xroga\.(com|dev|localhost)/i.test(location.hostname || '');
    if (tryProxy) {
      return xrogaProxyChat(messages, system).catch(function () {
        return pollinationsChat(messages, system);
      });
    }
    return pollinationsChat(messages, system);
  };

  X.imageUrl = imageUrl;

  X.search = function (query) {
    var tryProxy = typeof location !== 'undefined'
      && /xroga\.(com|dev|localhost)/i.test(location.hostname || '');
    if (tryProxy) {
      return xrogaProxySearch(query).catch(function () { return []; });
    }
    // Public DuckDuckGo Instant Answer (limited, no key)
    return fetch('https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_redirect=1&no_html=1')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var out = [];
        if (data.AbstractText) {
          out.push({ title: data.Heading || 'Result', url: data.AbstractURL || '#', snippet: data.AbstractText });
        }
        (data.RelatedTopics || []).slice(0, 4).forEach(function (t) {
          if (t.Text && t.FirstURL) out.push({ title: t.Text.slice(0, 80), url: t.FirstURL, snippet: t.Text });
        });
        return out;
      })
      .catch(function () { return []; });
  };

  X.speak = function (text) {
    if (!global.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(String(text || ''));
    global.speechSynthesis.speak(u);
  };

  /** Live crypto prices — CoinGecko free, no API key */
  X.cryptoPrices = function (ids) {
    var list = (ids && ids.length ? ids : ['bitcoin', 'ethereum', 'solana', 'arbitrum']).join(',');
    var url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(list)
      + '&vs_currencies=usd&include_24hr_change=true';
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('CoinGecko ' + r.status);
      return r.json();
    });
  };

  X.cryptoMarkets = function (n) {
    var url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page='
      + (n || 8) + '&page=1&sparkline=false';
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('CoinGecko markets ' + r.status);
      return r.json();
    });
  };

  /** Open-Meteo weather — no key */
  X.weather = function (lat, lon) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + (lat || 40.71)
      + '&longitude=' + (lon || -74.01) + '&current_weather=true';
    return fetch(url).then(function (r) { return r.json(); });
  };

  /** Frankfurter FX — no key */
  X.fxRates = function (base) {
    return fetch('https://api.frankfurter.app/latest?from=' + encodeURIComponent(base || 'USD'))
      .then(function (r) { return r.json(); });
  };

  global.XrogaLiveAi = X;
})(typeof window !== 'undefined' ? window : globalThis);
