/* ============================================================
   起始页 · 逻辑
   1) 搜索引擎切换（品牌图标 + 记忆）  2) 深色模式
   ============================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var KEY = { theme: 'sp.theme', engine: 'sp.engine' };

  /* ---------------- 品牌图标（内联 SVG，离线可用） ---------------- */
  var ICONS = {
    // 百度：熊掌（simple-icons 官方路径，去掉字标镂空）
    baidu: {
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M9.154 0C7.71 0 6.54 1.658 6.54 3.707c0 2.051 1.171 3.71 2.615 3.71 1.446 0 2.614-1.659 2.614-3.71C11.768 1.658 10.6 0 9.154 0zm7.025.594C14.86.58 13.347 2.589 13.2 3.927c-.187 1.745.25 3.487 2.179 3.735 1.933.25 3.175-1.806 3.422-3.364.252-1.555-.995-3.364-2.362-3.674a1.218 1.218 0 0 0-.261-.03zM3.582 5.535a2.811 2.811 0 0 0-.156.008c-2.118.19-2.428 3.24-2.428 3.24-.287 1.41.686 4.425 3.297 3.864 2.617-.561 2.262-3.68 2.183-4.362-.125-1.018-1.292-2.773-2.896-2.75zm16.534 1.753c-2.308 0-2.617 2.119-2.617 3.616 0 1.43.121 3.425 2.988 3.362 2.867-.063 2.553-3.238 2.553-3.988 0-.745-.62-2.99-2.924-2.99zm-8.264 2.478c-1.424.014-2.708.925-3.323 1.947-1.118 1.868-2.863 3.05-3.112 3.363-.25.309-3.61 2.116-2.864 5.42.746 3.301 3.365 3.237 3.365 3.237s1.93.19 4.171-.31c2.24-.495 4.17.123 4.17.123s5.233 1.748 6.665-1.616c1.43-3.364-.808-5.109-.808-5.109s-2.99-2.306-4.736-4.798c-1.072-1.665-2.348-2.268-3.528-2.257z"/>' +
        '</svg>'
    },
    // 必应：小写 b（官方轮廓，CoreUI 路径 32 视框）
    bing: {
      svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' +
        '<path d="m4.807 0l6.391 2.25v22.495l9.005-5.193l-4.411-2.073l-2.786-6.932l14.188 4.984v7.245L11.204 32l-6.396-3.563z"/>' +
        '</svg>'
    },
    // Google：四色 G
    google: {
      svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M4.76 10.06A7.5 7.5 0 0 1 18.14 7.70" stroke="#EA4335" stroke-width="4"/>' +
        '<path d="M5.20 15.17A7.5 7.5 0 0 1 4.76 10.06" stroke="#FBBC05" stroke-width="4"/>' +
        '<path d="M15.75 18.50A7.5 7.5 0 0 1 5.20 15.17" stroke="#34A853" stroke-width="4"/>' +
        '<path d="M19.50 12.00A7.5 7.5 0 0 1 15.75 18.50" stroke="#4285F4" stroke-width="4"/>' +
        '<rect x="11.6" y="10" width="7.9" height="4" fill="#4285F4"/>' +
        '</svg>'
    },
    // 搜狗：橙圈 + S（simple-icons 官方路径）
    sogou: {
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M16.801 22.74L17.79 24c1.561-.676 2.926-1.62 4.051-2.851l-.946-1.318c-1.11 1.289-2.475 2.279-4.08 2.909h-.014zM12 22.199c-5.775 0-10.455-4.619-10.455-10.35C1.545 6.15 6.225 1.53 12 1.53s10.456 4.65 10.456 10.35c0 2.55-.946 4.891-2.507 6.69l.945 1.261C22.801 17.729 24 14.939 24 11.88 24 5.295 18.63 0 12 0S0 5.311 0 11.85c0 6.57 5.37 11.88 12 11.88 1.71 0 3.33-.346 4.801-.99l-.961-1.26c-1.2.45-2.49.719-3.84.719zM18 12.646c-2.25-1.86-5.34-2.101-7.801-3.556-.75-.479-.148-1.395.602-1.425 2.699-.45 5.369.63 7.889 1.5l.151-2.655c-3.151-1.14-6.57-1.875-9.901-1.35-1.2.3-2.4.675-3.254 1.56-1.171 1.2-.961 3.36.389 4.32 2.236 1.755 5.176 2.011 7.621 3.36.96.39.555 1.68-.391 1.77-2.925.555-5.805-.721-8.325-2.1-.03 1.02-.06 2.01-.06 3 3.195 1.409 6.75 2.069 10.2 1.529 1.17-.225 2.37-.6 3.225-1.454 1.229-1.2 1.111-3.511-.33-4.5H18z"/>' +
        '</svg>'
    },
    // 360 搜索：绿橙分段圆环 + 圆点（按官网 favicon 逐像素测得）
    so360: {
      svg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M2.46 13.83A8.25 8.25 0 1 1 18.54 13.83" stroke="#0FB264" stroke-width="4.50"/>' +
        '<path d="M18.54 13.83A8.25 8.25 0 0 1 2.46 13.83" stroke="#FF9932" stroke-width="4.50"/>' +
        '<circle cx="20.62" cy="19.88" r="2.25" fill="#FF9932"/>' +
        '</svg>'
    }
  };

  /* ---------------- 搜索引擎 ---------------- */
  var ENGINES = [
    { id: 'baidu', name: '百度',     color: '#2932E1', url: 'https://www.baidu.com/s?wd=%s' },
    { id: 'bing',  name: '必应',     color: '#008373', url: 'https://cn.bing.com/search?q=%s' },
    { id: 'google', name: 'Google',  color: '#4285F4', url: 'https://www.google.com/search?q=%s' },
    { id: 'sogou', name: '搜狗',     color: '#FF6A00', url: 'https://www.sogou.com/web?query=%s' },
    { id: 'so360', name: '360 搜索', color: '#0DA740', url: 'https://www.so.com/s?q=%s' }
  ];

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 隐私模式忽略 */ }
  }

  function iconHTML(eng) {
    return '<span class="engine-icon" data-id="' + eng.id + '" style="color:' + eng.color + '">' +
      ICONS[eng.id].svg + '</span>';
  }

  /* ---------------- 主题 ---------------- */
  var themeBtn = $('themeBtn');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    if (themeMeta) themeMeta.setAttribute('content', mode === 'dark' ? '#1e1e1e' : '#ffffff');
    themeBtn.setAttribute('aria-label', mode === 'dark' ? '切换浅色模式' : '切换深色模式');
    themeBtn.setAttribute('title', themeBtn.getAttribute('aria-label'));
  }

  themeBtn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    save(KEY.theme, next);
  });

  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');

  /* ---------------- 引擎切换 ---------------- */
  var form = $('searchForm');
  var input = $('q');
  var engineBtn = $('engineBtn');
  var engineIcon = $('engineIcon');
  var menu = $('engineMenu');
  var current = ENGINES.filter(function (e) { return e.id === load(KEY.engine, 'bing'); })[0] || ENGINES[1];
  var activeIndex = -1;

  ENGINES.forEach(function (eng, i) {
    var li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.innerHTML = iconHTML(eng) +
      '<span class="name">' + eng.name + '</span>' +
      '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5.2L20 6.5"/></svg>';
    li.addEventListener('click', function () { selectEngine(i); closeMenu(); input.focus(); });
    li.addEventListener('mousemove', function () { setActive(i); });
    menu.appendChild(li);
  });

  function selectEngine(i) {
    current = ENGINES[i];
    engineIcon.innerHTML = ICONS[current.id].svg;
    engineIcon.setAttribute('style', 'color:' + current.color);
    engineIcon.dataset.id = current.id;
    engineBtn.setAttribute('aria-label', '当前搜索引擎：' + current.name + '，点击切换');
    engineBtn.setAttribute('title', '当前：' + current.name + '，点击切换');
    input.name = current.id === 'baidu' ? 'wd' : 'q';
    form.action = current.url.split('?')[0];
    Array.prototype.forEach.call(menu.children, function (li, n) {
      li.setAttribute('aria-selected', n === i ? 'true' : 'false');
    });
    save(KEY.engine, current.id);
  }

  function setActive(i) {
    activeIndex = i;
    Array.prototype.forEach.call(menu.children, function (li, n) {
      li.classList.toggle('active', n === i);
    });
  }

  function openMenu() {
    menu.hidden = false;
    engineBtn.setAttribute('aria-expanded', 'true');
    setActive(ENGINES.indexOf(current));
    var li = menu.children[activeIndex];
    if (li) li.scrollIntoView({ block: 'nearest' });
  }

  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    engineBtn.setAttribute('aria-expanded', 'false');
    setActive(-1);
  }

  engineBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.hidden ? openMenu() : closeMenu();
  });

  document.addEventListener('click', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !engineBtn.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (!menu.hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var step = e.key === 'ArrowDown' ? 1 : -1;
        var next = (activeIndex + step + ENGINES.length) % ENGINES.length;
        setActive(next);
        menu.children[next].scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'Enter' && activeIndex > -1) {
        e.preventDefault();
        selectEngine(activeIndex);
        closeMenu();
        input.focus();
        return;
      }
      if (e.key === 'Escape') {
        closeMenu();
        engineBtn.focus();
        return;
      }
    }

    if ((e.key === '/' && !isTyping(e.target)) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  function isTyping(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }

  selectEngine(ENGINES.indexOf(current));

  /* ---------------- 搜索 ---------------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = input.value.trim();
    if (!raw) { input.focus(); return; }
    openInNewTab(searchURL(raw));
    // 起始页本身留在原地，方便连续搜下一个词
    input.select();
  });

  /* 所有跳转都在新标签页打开：
     用临时的 a[target=_blank] 触发，浏览器的用户手势判定比 window.open 更宽松；
     rel 里带 noopener 让新页面拿不到 window.opener，避免被反向控制。 */
  function openInNewTab(url) {
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* 输入什么都在当前引擎里搜，不再把网址当成直达地址 */
  function searchURL(raw) {
    return current.url.replace('%s', encodeURIComponent(raw));
  }

  // 桌面端进入即聚焦，移动端不抢焦点（避免弹出键盘）
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input.focus();
})();
