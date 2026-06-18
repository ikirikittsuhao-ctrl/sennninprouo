async function initCommonComponents(activeSection = 'home') {
  const headerEl = document.querySelector("header");
  if (headerEl) {
    try {
      const res = await fetch("/components/header.html");
      headerEl.innerHTML = await res.text();
    } catch (e) {
      console.error("Header load failed:", e);
    }
  }

  const asideEl = document.querySelector("aside");
  if (asideEl) {
    try {
      const res = await fetch("/components/sidebar.html");
      asideEl.innerHTML = await res.text();
    } catch (e) {
      console.error("Sidebar load failed:", e);
    }
  }

  const queryInput = document.getElementById("query");
  const searchBtn = document.getElementById("searchBtn");
  if (queryInput && searchBtn) {
    const triggerSearch = () => {
      const q = queryInput.value.trim();
      if (q) window.location.href = `/?q=${encodeURIComponent(q)}`;
    };
    searchBtn.onclick = triggerSearch;
    queryInput.onkeydown = (e) => { if (e.key === 'Enter') triggerSearch(); };
    
    // 現在の検索クエリを保持
    const urlParams = new URLSearchParams(window.location.search);
    const currentQ = urlParams.get("q");
    if (currentQ) queryInput.value = currentQ;
  }

  // 4. サイドバー開閉（トグル）イベントの設定
  const menuBtn = document.getElementById("globalMenuBtn");
  const appLayout = document.querySelector(".app-layout");
  if (menuBtn && appLayout) {
    menuBtn.onclick = () => {
      appLayout.classList.toggle("sidebar-collapsed");
    };
  }

  document.querySelectorAll("aside .side-item").forEach(el => el.classList.remove("active"));
  if (activeSection === 'home') {
    const btn = document.getElementById("sideHomeBtn");
    if (btn) btn.classList.add("active");
  } else if (activeSection === 'history') {
    const btn = document.getElementById("sideHistoryBtn");
    if (btn) btn.classList.add("active");
  } else if (activeSection === 'favorites') {
    const btn = document.getElementById("sideFavBtn");
    if (btn) btn.classList.add("active");
  } else if (activeSection === 'watch-later') {
    const btn = document.getElementById("sideLaterBtn");
    if (btn) btn.classList.add("active");
  }

  if (typeof renderSidebarPlaylists === "function") {
    renderSidebarPlaylists();
  }
}
