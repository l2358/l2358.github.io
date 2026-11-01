/* =========================================================
 * Qshot 网页版 v2 —— 无顶栏 / 无分组 / 无 AI 总结
 * 存储：localStorage（key 与扩展版 chrome.storage.local 保持一致）
 * ========================================================= */
(function () {
  "use strict";

  /* ---------- 存储层（替代 chrome.storage.local） ---------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    },
  };

  const KEYS = {
    promptGroups: "promptGroups",
    uiPrefs: "uiPrefs",
    customSites: "customSites",
    searchHistory: "searchHistory",
    cardSizeLevel: "cardSizeLevel",
    selectedSites: "webSelectedSitesV3",
  };

  const $ = (id) => document.getElementById(id);
  const uid = (p) => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 全局状态 ---------- */
  const DEFAULT_SELECTED = ["wenxin", "so360", "sogouai"]; // 默认选中：文心、360so、搜狗ai

  const state = {
    customSites: store.get(KEYS.customSites, []),
    promptGroups: store.get(KEYS.promptGroups, null) || structuredClone(window.QSHOT_DEFAULT_STATE.promptGroups),
    history: store.get(KEYS.searchHistory, []),
    selectedSiteIds: store.get(KEYS.selectedSites, DEFAULT_SELECTED),
    historyFilter: "all",
    currentQuery: "",
  };

  function allSites() {
    const builtin = window.QSHOT_BUILTIN_SITES.map((s) => ({ ...s, custom: false }));
    const custom = state.customSites.map((s) => ({
      id: s.id, name: s.name, url: s.url, enabled: true,
      supportIframe: false,
      supportUrlQuery: s.url.includes("{query}"),
      category: "custom", custom: true,
    }));
    return builtin.concat(custom);
  }
  const siteById = (id) => allSites().find((s) => s.id === id);
  const fillQuery = (url, q) => url.replace("{query}", encodeURIComponent(q));

  // 清理 v1 遗留的已失效站点 id
  state.selectedSiteIds = state.selectedSiteIds.filter((id) => siteById(id));
  if (!state.selectedSiteIds.length) state.selectedSiteIds = [...DEFAULT_SELECTED];
  store.set(KEYS.selectedSites, state.selectedSiteIds);

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
  }

  /* ---------- 剪贴板 ---------- */
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch {}
      ta.remove(); return ok;
    }
  }

  /* ---------- 主题 ---------- */
  function applyTheme() {
    const prefs = store.get(KEYS.uiPrefs, {});
    document.documentElement.setAttribute("data-theme", prefs.darkMode ? "dark" : "light");
    $("btnDarkMode").textContent = prefs.darkMode ? "☀️" : "🌙";
  }

  /* ---------- 布局（卡片宽度固定，仅由宽度菜单调整；始终横向并排） ---------- */
  const CARD_WIDTHS = { 1: "320px", 2: "440px", 3: "580px", 4: "720px", 5: "960px" };
  function applyLayout() {
    const level = store.get(KEYS.cardSizeLevel, 3);
    document.documentElement.style.setProperty("--effective-card-width", CARD_WIDTHS[level] || CARD_WIDTHS[3]);
    document.querySelectorAll("#widthMenu button").forEach((b) => {
      b.classList.toggle("active", +b.dataset.width === +level);
    });
  }

  /* ---------- 已选站点 chips（工具栏同一排） ---------- */
  function renderSelectedChips() {
    const wrap = $("selectedSitesChips");
    wrap.innerHTML = "";
    state.selectedSiteIds.forEach((id) => {
      const s = siteById(id); if (!s) return;
      const chip = document.createElement("span");
      chip.className = "site-chip";
      chip.innerHTML = esc(s.name) + ' <button title="移除">×</button>';
      chip.querySelector("button").onclick = () => {
        state.selectedSiteIds = state.selectedSiteIds.filter((x) => x !== id);
        store.set(KEYS.selectedSites, state.selectedSiteIds);
        renderSelectedChips(); renderSitePicker();
      };
      wrap.appendChild(chip);
    });
  }

  /* ---------- 站点选择弹层 ---------- */
  function renderSitePicker() {
    const cats = { ai: $("spAiList"), other: $("spOtherList"), custom: $("spCustomList") };
    Object.values(cats).forEach((el) => (el.innerHTML = ""));
    allSites().forEach((s) => {
      const el = document.createElement("div");
      const selected = state.selectedSiteIds.includes(s.id);
      el.className = "sp-item" + (selected ? " selected" : "");
      el.innerHTML = esc(s.name) + '<span class="tag">' + (s.supportUrlQuery ? "直达" : s.custom ? "自定" : "AI") + "</span>";
      el.onclick = () => {
        if (state.selectedSiteIds.includes(s.id)) {
          state.selectedSiteIds = state.selectedSiteIds.filter((x) => x !== s.id);
        } else {
          state.selectedSiteIds.push(s.id);
        }
        store.set(KEYS.selectedSites, state.selectedSiteIds);
        renderSelectedChips(); renderSitePicker();
      };
      (cats[s.category] || cats.custom).appendChild(el);
    });
  }

  /* ---------- 卡片 ---------- */
  const cards = new Map(); // siteId -> {el, status}

  function setStatus(siteId, text, cls) {
    const c = cards.get(siteId); if (!c) return;
    c.status.textContent = text;
    c.status.className = "card-status" + (cls ? " " + cls : "");
  }

  function createCard(site, query) {
    const container = $("iframesContainer");
    let rec = cards.get(site.id);
    if (rec) { rec.el.remove(); cards.delete(site.id); }

    const card = document.createElement("article");
    card.className = "iframe-card";
    card.innerHTML = `
      <div class="card-head">
        <span class="card-title">${esc(site.name)}</span>
        <span class="card-status">准备中…</span>
        <div class="card-actions">
          <button class="card-btn act-open" title="新标签页打开">↗</button>
          <button class="card-btn act-refresh" title="重新加载">⟳</button>
          <button class="card-btn act-close" title="关闭卡片">×</button>
        </div>
      </div>
      <div class="card-body"></div>`;
    container.appendChild(card);

    const status = card.querySelector(".card-status");
    rec = { el: card, status };
    cards.set(site.id, rec);

    const openUrl = query
      ? (site.supportUrlQuery ? fillQuery(site.url, query) : site.url)
      : site.url;

    card.querySelector(".act-open").onclick = () => window.open(openUrl, "_blank", "noopener");
    card.querySelector(".act-close").onclick = () => { card.remove(); cards.delete(site.id); updateEmptyState(); };
    card.querySelector(".act-refresh").onclick = () => loadCard(site, query || state.currentQuery);

    loadCard(site, query);
    updateEmptyState();
  }

  function loadCard(site, query) {
    const rec = cards.get(site.id); if (!rec) return;
    const body = rec.el.querySelector(".card-body");
    body.innerHTML = "";

    if (site.supportUrlQuery && query) {
      // URL 模板站点：尝试 iframe 内嵌直达结果页
      const target = fillQuery(site.url, query);
      const frame = document.createElement("iframe");
      frame.src = target;
      frame.setAttribute("referrerpolicy", "no-referrer");
      body.appendChild(frame);
      setStatus(site.id, "已内嵌加载 · 若空白请点 ↗ 新标签打开", "ok");
      frame.addEventListener("error", () => showFallback(site, query, "加载失败"));
      // 部分站点拒绝内嵌但不触发 error，提供手动兜底
      const failBtn = document.createElement("button");
      failBtn.className = "card-btn";
      failBtn.textContent = "打不开？";
      failBtn.style.cssText = "position:absolute;right:8px;bottom:8px;opacity:.75;z-index:2";
      failBtn.onclick = () => showFallback(site, query, "已切换为手动模式");
      body.appendChild(failBtn);
    } else if (query) {
      showFallback(site, query, "");
    } else {
      const frame = document.createElement("iframe");
      frame.src = site.url;
      body.appendChild(frame);
      setStatus(site.id, "已加载首页", "ok");
      frame.addEventListener("error", () => showFallback(site, "", "加载失败"));
    }
  }

  function showFallback(site, query, note) {
    const rec = cards.get(site.id); if (!rec) return;
    const body = rec.el.querySelector(".card-body");
    body.innerHTML = "";
    const div = document.createElement("div");
    div.className = "card-fallback";
    div.innerHTML = `
      <div class="big">🚀</div>
      <div>${site.custom || site.supportUrlQuery ? "该站点不适合内嵌，建议新标签打开" : "AI 站点禁止网页内嵌，需在新标签页中提问"}</div>
      ${query ? '<div style="font-size:12px">点击下面按钮会自动复制问题并打开站点，粘贴发送即可</div>' : ""}`;
    const btn = document.createElement("button");
    btn.textContent = query ? "复制问题并打开 " + site.name : "打开 " + site.name;
    btn.onclick = async () => {
      if (query) {
        const ok = await copyText(query);
        toast(ok ? "问题已复制，到新标签页粘贴即可" : "复制失败，请手动复制问题");
      }
      window.open(site.supportUrlQuery && query ? fillQuery(site.url, query) : site.url, "_blank", "noopener");
    };
    div.appendChild(btn);
    if (!query) {
      const btn2 = document.createElement("button");
      btn2.textContent = "仅打开首页";
      btn2.style.background = "var(--text-muted)";
      btn2.onclick = () => window.open(site.url, "_blank", "noopener");
      div.appendChild(btn2);
    }
    body.appendChild(div);
    setStatus(site.id, note || "待手动打开", note === "加载失败" ? "err" : "");
  }

  function updateEmptyState() {
    $("emptyState").classList.toggle("hidden", cards.size > 0);
  }

  /* ---------- 发送 ---------- */
  async function handleSend() {
    const query = $("queryInput").value.trim();
    if (!query) { toast("请输入问题"); return; }
    const ids = state.selectedSiteIds.filter((id) => siteById(id));
    if (!ids.length) { toast("请先选择至少一个站点"); return; }

    state.currentQuery = query;
    await copyText(query); // 静默复制完整内容，便于在新标签里粘贴

    ids.forEach((id) => createCard(siteById(id), query));
    saveHistory(query, ids);
    if (query.length > 1500) {
      toast("内容较长（" + query.length + " 字），部分站点 URL 可能截断，请到卡片中用「复制问题并打开」粘贴完整内容");
    } else {
      toast("已分发到 " + ids.length + " 个站点，问题已复制到剪贴板");
    }
  }

  /* ---------- 历史 ---------- */
  function saveHistory(query, siteIds) {
    const entry = {
      id: uid("h"),
      query,
      sites: siteIds.map((id) => {
        const s = siteById(id);
        return { id, name: s.name, url: s.supportUrlQuery ? fillQuery(s.url, query) : s.url };
      }),
      createdAt: Date.now(),
    };
    state.history.unshift(entry);
    if (state.history.length > 50) state.history.length = 50;
    store.set(KEYS.searchHistory, state.history);
    renderHistory();
  }

  function renderHistory() {
    const list = $("historyList");
    list.innerHTML = "";
    const now = new Date(); const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayStart = dayStart(now);
    const yesterdayStart = todayStart - 86400000;
    const items = state.history.filter((h) => {
      if (state.historyFilter === "today") return h.createdAt >= todayStart;
      if (state.historyFilter === "yesterday") return h.createdAt >= yesterdayStart && h.createdAt < todayStart;
      return true;
    });
    if (!items.length) {
      list.innerHTML = '<div class="history-empty">暂无历史记录</div>';
      return;
    }
    items.forEach((h) => {
      const el = document.createElement("div");
      el.className = "history-item";
      el.innerHTML = `<button class="h-del" title="删除该条记录">×</button>
        <div class="q">${esc(h.query)}</div>
        <div class="meta">${new Date(h.createdAt).toLocaleString("zh-CN")} · ${h.sites.map((s) => esc(s.name)).join(" / ")}</div>`;
      el.title = "点击复原这次搜索";
      el.querySelector(".h-del").onclick = (e) => {
        e.stopPropagation();
        state.history = state.history.filter((x) => x.id !== h.id);
        store.set(KEYS.searchHistory, state.history);
        renderHistory();
        toast("已删除该条记录");
      };
      el.onclick = () => {
        $("queryInput").value = h.query;
        state.selectedSiteIds = h.sites.map((s) => s.id).filter((id) => siteById(id));
        store.set(KEYS.selectedSites, state.selectedSiteIds);
        renderSelectedChips(); renderSitePicker();
        $("historyPanel").classList.add("hidden");
        handleSend();
      };
      list.appendChild(el);
    });
  }

  /* ---------- 提示词 ---------- */
  function renderPrompts() {
    const wrap = $("promptsList");
    wrap.innerHTML = "";
    state.promptGroups.forEach((g) => {
      const block = document.createElement("div");
      block.className = "prompt-group-block";
      block.innerHTML = `<h4 class="sp-cat">${esc(g.name)}</h4>`;
      g.prompts.forEach((p) => {
        const item = document.createElement("div");
        item.className = "prompt-item";
        item.innerHTML = `<span class="pt" title="${esc(p.content)}">${esc(p.title)}</span>
          <button class="use">使用</button><button class="del">删除</button>`;
        item.querySelector(".use").onclick = () => {
          const ta = $("queryInput");
          ta.value = ta.value ? ta.value + "\n" + p.content : p.content;
          ta.focus();
          $("promptsModal").classList.add("hidden");
          toast("已插入提示词「" + p.title + "」");
        };
        item.querySelector(".del").onclick = () => {
          if (!confirm("删除提示词「" + p.title + "」？")) return;
          g.prompts = g.prompts.filter((x) => x.id !== p.id);
          store.set(KEYS.promptGroups, state.promptGroups);
          renderPrompts();
        };
        block.appendChild(item);
      });
      wrap.appendChild(block);
    });
  }

  /* ---------- 导出 Markdown ---------- */
  function exportMarkdown() {
    const query = state.currentQuery || $("queryInput").value.trim();
    if (!query) { toast("先发送一个问题再导出"); return; }
    const lines = [
      "# Qshot 对比搜索记录", "",
      "- 问题：" + query,
      "- 时间：" + new Date().toLocaleString("zh-CN"),
      "- 站点：", "",
    ];
    state.selectedSiteIds.forEach((id) => {
      const s = siteById(id); if (!s) return;
      const url = s.supportUrlQuery ? fillQuery(s.url, query) : s.url;
      lines.push(`- [${s.name}](${url})`);
    });
    lines.push("", "---", "", "## 回答摘录", "", "> 网页版无法自动抓取各站回答，请手动粘贴到下方。", "");
    state.selectedSiteIds.forEach((id) => {
      const s = siteById(id); if (!s) return;
      lines.push(`### ${s.name}`, "", "（在此粘贴回答）", "");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qshot-" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + ".md";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("已导出 Markdown");
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    $("btnSend").onclick = handleSend;
    $("queryInput").addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        // Ctrl+Enter / Shift+Enter：在光标处插入换行
        e.preventDefault();
        const ta = e.target;
        const { selectionStart: s, selectionEnd: t, value: v } = ta;
        ta.value = v.slice(0, s) + "\n" + v.slice(t);
        ta.selectionStart = ta.selectionEnd = s + 1;
      } else {
        // Enter：直接发送
        e.preventDefault();
        handleSend();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== $("queryInput") &&
          !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault(); $("queryInput").focus();
      }
      if (e.key === "Escape") $("widthMenu").classList.add("hidden");
    });

    $("btnDarkMode").onclick = () => {
      const prefs = store.get(KEYS.uiPrefs, {});
      prefs.darkMode = !prefs.darkMode;
      store.set(KEYS.uiPrefs, prefs);
      applyTheme();
    };

    // 卡片宽度：按钮 + 弹出菜单
    $("btnCardWidth").onclick = (e) => {
      e.stopPropagation();
      $("widthMenu").classList.toggle("hidden");
    };
    document.querySelectorAll("#widthMenu button").forEach((b) => {
      b.onclick = () => {
        store.set(KEYS.cardSizeLevel, +b.dataset.width);
        applyLayout();
        $("widthMenu").classList.add("hidden");
        toast("卡片宽度已设为 " + b.textContent);
      };
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".width-picker")) $("widthMenu").classList.add("hidden");
    });

    // 输入框放大/缩小（200%）
    $("btnExpand").onclick = () => {
      const wrap = $("inputWrap");
      const expanded = wrap.classList.toggle("expanded");
      $("btnExpand").textContent = expanded ? "⤡" : "⤢";
      $("btnExpand").title = expanded ? "缩小输入框" : "放大输入框";
    };

    $("btnClearCards").onclick = () => {
      cards.forEach((c) => c.el.remove()); cards.clear(); updateEmptyState();
    };

    // 弹层开合
    $("btnSitePicker").onclick = () => { renderSitePicker(); $("sitePickerModal").classList.remove("hidden"); };
    $("btnPrompts").onclick = () => { renderPrompts(); $("promptsModal").classList.remove("hidden"); };
    $("btnHistory").onclick = () => { renderHistory(); $("historyPanel").classList.toggle("hidden"); };
    $("btnExport").onclick = exportMarkdown;

    document.querySelectorAll("[data-close]").forEach((b) => {
      b.onclick = () => $(b.dataset.close).classList.add("hidden");
    });
    document.querySelectorAll(".modal").forEach((m) => {
      m.addEventListener("click", (e) => { if (e.target === m) m.classList.add("hidden"); });
    });

    // 历史筛选
    document.querySelectorAll(".hf-btn[data-filter]").forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll(".hf-btn[data-filter]").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        state.historyFilter = b.dataset.filter;
        renderHistory();
      };
    });
    $("btnClearHistory").onclick = () => {
      if (!confirm("清空全部历史记录？")) return;
      state.history = [];
      store.set(KEYS.searchHistory, []);
      renderHistory();
    };

    // 站点选择快捷按钮
    $("spSelectAll").onclick = () => { state.selectedSiteIds = allSites().map((s) => s.id); store.set(KEYS.selectedSites, state.selectedSiteIds); renderSelectedChips(); renderSitePicker(); };
    $("spSelectNone").onclick = () => { state.selectedSiteIds = []; store.set(KEYS.selectedSites, []); renderSelectedChips(); renderSitePicker(); };
    $("spSelectAi").onclick = () => { state.selectedSiteIds = allSites().filter((s) => s.category === "ai").map((s) => s.id); store.set(KEYS.selectedSites, state.selectedSiteIds); renderSelectedChips(); renderSitePicker(); };
    $("spSelectOther").onclick = () => { state.selectedSiteIds = allSites().filter((s) => s.category === "other").map((s) => s.id); store.set(KEYS.selectedSites, state.selectedSiteIds); renderSelectedChips(); renderSitePicker(); };

    // 自定义站点
    $("btnAddCustomSite").onclick = () => {
      const name = $("customSiteName").value.trim();
      let url = $("customSiteUrl").value.trim();
      if (!name || !url) { toast("请填写名称和 URL"); return; }
      if (!/^https?:\/\//.test(url)) url = "https://" + url;
      state.customSites.push({ id: uid("custom"), name, url });
      store.set(KEYS.customSites, state.customSites);
      $("customSiteName").value = ""; $("customSiteUrl").value = "";
      renderSitePicker();
      toast("已添加站点「" + name + "」");
    };

    // 提示词新建
    $("btnAddPrompt").onclick = () => {
      const title = $("newPromptTitle").value.trim();
      const content = $("newPromptContent").value.trim();
      if (!title || !content) { toast("请填写标题和内容"); return; }
      if (!state.promptGroups.length) state.promptGroups.push({ id: uid("pg"), name: "默认", prompts: [] });
      state.promptGroups[0].prompts.push({ id: uid("prompt"), title, content });
      store.set(KEYS.promptGroups, state.promptGroups);
      $("newPromptTitle").value = ""; $("newPromptContent").value = "";
      renderPrompts();
      toast("已添加提示词");
    };
  }

  /* ---------- 启动 ---------- */
  function start() {
    applyTheme();
    applyLayout();
    renderSelectedChips();
    renderHistory();
    bindEvents();
    updateEmptyState();

    // 兼容 URL 参数：?q=...&autosend=1
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      $("queryInput").value = q;
      if (params.get("autosend") === "1") handleSend();
    }
  }

  start();
})();
