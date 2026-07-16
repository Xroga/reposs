/*! Xroga Live AI — free endpoints first; BYOK via Xroga Integrations */
(function (global) {
  'use strict';
  var X = global.XrogaLiveAi || {};

  function pollinationsChat(messages, system) {
    var last = '';
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].role === 'user') { last = String(messages[i].content || ''); break; }
    }
    var prompt = (system ? system + '

' : '') + last;
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


/*! Xroga Live AI — free endpoints first; BYOK via Xroga Integrations */
(function (global) {
  'use strict';
  var X = global.XrogaLiveAi || {};

  function pollinationsChat(messages, system) {
    var last = '';
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].role === 'user') { last = String(messages[i].content || ''); break; }
    }
    var prompt = (system ? system + '

' : '') + last;
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


// ===== STATE =====
const STATE = {
  chats: JSON.parse(localStorage.getItem('flowchat_chats') || '[]'),
  activeChatId: localStorage.getItem('flowchat_active') || null,
  theme: localStorage.getItem('flowchat_theme') || 'light',
  aiName: localStorage.getItem('flowchat_ai_name') || 'Assistant',
  speed: localStorage.getItem('flowchat_speed') || 'normal',
  typing: false,
};

// ===== DOM REFS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const messagesEl = $('#messages');
const chatForm = $('#chat-form');
const chatInput = $('#chat-input');
const typingIndicator = $('#typing-indicator');
const historyList = $('#history-list');
const newChatBtn = $('#new-chat-btn');
const themeToggle = $('#theme-toggle');
const clearHistoryBtn = $('#clear-history-btn');
const menuToggle = $('#menu-toggle');
const sidebar = $('#sidebar');
const settingsBtn = $('#settings-btn');
const settingsModal = $('#settings-modal');
const closeSettings = $('#close-settings');
const saveSettings = $('#save-settings');
const settingsTheme = $('#settings-theme');
const settingsSpeed = $('#settings-speed');
const settingsAiName = $('#settings-ai-name');
const headerTitle = $('.header-info h1');

// ===== HELPERS =====
function saveState() {
  localStorage.setItem('flowchat_chats', JSON.stringify(STATE.chats));
  localStorage.setItem('flowchat_active', STATE.activeChatId);
  localStorage.setItem('flowchat_theme', STATE.theme);
  localStorage.setItem('flowchat_ai_name', STATE.aiName);
  localStorage.setItem('flowchat_speed', STATE.speed);
}

function getActiveChat() {
  return STATE.chats.find(c => c.id === STATE.activeChatId);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function timeNow() {
  return new Date().toISOString();
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== THEME =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  STATE.theme = theme;
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.setAttribute('data-lucide', 'moon');
  } else {
    icon.setAttribute('data-lucide', 'sun');
  }
  lucide.createIcons();
  saveState();
}

themeToggle.addEventListener('click', () => {
  const next = STATE.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
});

// ===== CHAT MANAGEMENT =====
function createChat(title = 'New chat') {
  const chat = {
    id: generateId(),
    title: title,
    messages: [],
    created: timeNow(),
  };
  STATE.chats.unshift(chat);
  STATE.activeChatId = chat.id;
  saveState();
  renderHistory();
  renderMessages();
  updateHeader();
  return chat;
}

function switchChat(id) {
  STATE.activeChatId = id;
  saveState();
  renderHistory();
  renderMessages();
  updateHeader();
  // close sidebar on mobile
  sidebar.classList.remove('open');
}

function deleteChat(id) {
  STATE.chats = STATE.chats.filter(c => c.id !== id);
  if (STATE.activeChatId === id) {
    STATE.activeChatId = STATE.chats.length > 0 ? STATE.chats[0].id : null;
    if (!STATE.activeChatId) createChat();
  }
  saveState();
  renderHistory();
  renderMessages();
  updateHeader();
}

function clearAllChats() {
  if (!confirm('Delete all conversations?')) return;
  STATE.chats = [];
  createChat();
  saveState();
  renderHistory();
  renderMessages();
  updateHeader();
}

newChatBtn.addEventListener('click', () => {
  createChat();
});

clearHistoryBtn.addEventListener('click', clearAllChats);

// ===== MESSAGES =====
function addMessage(role, content) {
  const chat = getActiveChat();
  if (!chat) return;
  const msg = {
    id: generateId(),
    role,
    content,
    time: timeNow(),
  };
  chat.messages.push(msg);
  // update title from first user message
  if (chat.title === 'New chat' && role === 'user') {
    chat.title = content.slice(0, 40) + (content.length > 40 ? '…' : '');
  }
  saveState();
  renderMessages();
  renderHistory();
}

function renderMessages() {
  const chat = getActiveChat();
  messagesEl.innerHTML = '';
  if (!chat || chat.messages.length === 0) {
    messagesEl.innerHTML = `
      <div class="empty-state" style="text-align:center;margin-top:60px;color:var(--text-secondary);">
        <i data-lucide="message-circle" style="width:48px;height:48px;opacity:0.3;margin-bottom:12px;"></i>
        <p style="font-size:15px;">Start a conversation</p>
        <p style="font-size:13px;margin-top:4px;">Type something below</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  chat.messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `message ${msg.role}`;
    div.innerHTML = `
      <div class="message-avatar">${msg.role === 'user' ? 'U' : STATE.aiName[0]}</div>
      <div>
        <div class="message-bubble">${escapeHtml(msg.content)}</div>
        <div class="message-time">${formatTime(msg.time)}</div>
      </div>
    `;
    messagesEl.appendChild(div);
  });
  lucide.createIcons();
  scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ===== HISTORY =====
function renderHistory() {
  historyList.innerHTML = '';
  STATE.chats.forEach(chat => {
    const div = document.createElement('div');
    div.className = 'history-item' + (chat.id === STATE.activeChatId ? ' active' : '');
    const label = chat.title === 'New chat' ? 'Empty chat' : chat.title;
    div.innerHTML = `<i data-lucide="message-square" style="width:14px;height:14px;flex-shrink:0;"></i><span>${escapeHtml(label)}</span>`;
    div.addEventListener('click', () => switchChat(chat.id));
    // right-click delete
    div.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (STATE.chats.length > 1) {
        deleteChat(chat.id);
      }
    });
    historyList.appendChild(div);
  });
  lucide.createIcons();
}

function updateHeader() {
  const chat = getActiveChat();
  headerTitle.textContent = chat ? STATE.aiName : 'Assistant';
}

// ===== AI REPLY =====
function simulateAiReply(userMessage) {
  if (STATE.typing) return;
  STATE.typing = true;
  typingIndicator.classList.remove('hidden');
  scrollToBottom();

  const speedMap = { fast: 400, normal: 900, slow: 1800 };
  const delay = speedMap[STATE.speed] || 900;

  const replies = [
    "That's a great question! Let me think about it.",
    "Here's what I can tell you about that.",
    "Interesting point. Here's my perspective.",
    "I understand what you're asking. Let me break it down.",
    "Thanks for sharing! Here's my response.",
    "That's something I can help with. Here goes:",
    "Let me provide some insight on that.",
    "I appreciate the question. Here's what I know.",
  ];

  const followUps = [
    "In short, it depends on the context and your specific needs.",
    "I hope that gives you a clearer picture.",
    "Let me know if you'd like more details on any part.",
    "Does that answer your question?",
    "Feel free to ask more — I'm happy to help.",
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const reply = `${pick(replies)}

${pick(followUps)}`;

  setTimeout(() => {
    typingIndicator.classList.add('hidden');
    STATE.typing = false;
    addMessage('ai', reply);
  }, delay);
}

// ===== SEND HANDLER =====
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || STATE.typing) return;

  // ensure active chat exists
  let chat = getActiveChat();
  if (!chat) {
    chat = createChat();
  }

  addMessage('user', text);
  chatInput.value = '';
  chatInput.focus();

  simulateAiReply(text);
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// ===== SIDEBAR TOGGLE =====
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// ===== SETTINGS =====
settingsBtn.addEventListener('click', () => {
  settingsTheme.value = STATE.theme;
  settingsSpeed.value = STATE.speed;
  settingsAiName.value = STATE.aiName;
  settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add('hidden');
  }
});

saveSettings.addEventListener('click', () => {
  const newTheme = settingsTheme.value;
  const newSpeed = settingsSpeed.value;
  const newName = settingsAiName.value.trim() || 'Assistant';

  if (newTheme !== STATE.theme) applyTheme(newTheme);
  STATE.speed = newSpeed;
  STATE.aiName = newName;

  saveState();
  updateHeader();
  renderMessages();
  settingsModal.classList.add('hidden');
});

// ===== INIT =====
function init() {
  // apply saved theme
  applyTheme(STATE.theme);

  // ensure at least one chat
  if (STATE.chats.length === 0) {
    createChat();
  } else if (!STATE.activeChatId || !getActiveChat()) {
    STATE.activeChatId = STATE.chats[0].id;
    saveState();
  }

  renderHistory();
  renderMessages();
  updateHeader();
  chatInput.focus();

  // lucide icons
  lucide.createIcons();
}

init();

(() => {
  const messages = document.getElementById('messages');
  const history = document.getElementById('history');
  function add(role, text) {
    const d = document.createElement('div');
    d.className = 'bubble ' + (role === 'user' ? 'user' : '');
    d.textContent = text;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
  }
  add('bot', 'Hi — I am Xroga Assistant. Live replies use free open AI (Pollinations). Add your own encrypted API key in Xroga → Integrations for faster models.');
  const thread = [];
  document.getElementById('chat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const q = String(fd.get('q') || '').trim();
    if (!q) return;
    add('user', q);
    thread.push({ role: 'user', content: q });
    const li = document.createElement('li');
    li.textContent = q.slice(0, 40);
    history?.appendChild(li);
    e.target.reset();
    add('bot', 'Thinking…');
    const pending = messages.lastElementChild;
    try {
      const reply = await (window.XrogaLiveAi?.chat
        ? window.XrogaLiveAi.chat(thread, { system: 'You are Xroga Assistant, a helpful product assistant.' })
        : Promise.resolve('Live AI client missing — refresh preview.'));
      if (pending) pending.textContent = reply;
      thread.push({ role: 'assistant', content: reply });
    } catch (err) {
      if (pending) pending.textContent = 'Could not reach free AI — check network and retry.';
    }
  });
  document.getElementById('new-chat')?.addEventListener('click', () => {
    messages.innerHTML = '';
    thread.length = 0;
    add('bot', 'New chat started.');
  });
})();