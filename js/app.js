/**
 * app.js
 * Renderiza el contenido de entries-data.js: línea de tiempo, filtros,
 * estadísticas, pestaña de habilidades y pestaña "acerca de".
 */
(function () {
  "use strict";

  const state = {
    activeTags: new Set(),
    query: "",
  };

  const els = {
    timeline: document.getElementById("timeline"),
    template: document.getElementById("entry-template"),
    tagFilters: document.getElementById("tag-filters"),
    searchInput: document.getElementById("search-input"),
    emptyState: document.getElementById("empty-state"),
    statsBar: document.getElementById("stats-bar"),
    skillsGrid: document.getElementById("skills-grid"),
    aboutCard: document.getElementById("about-card"),
    footerYear: document.getElementById("footer-year"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    tabPanels: document.querySelectorAll(".tab-panel"),
  };

  function formatDate(iso) {
    const [y, m, d] = iso.split("-");
    const meses = [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic",
    ];
    return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
  }

  function dateRangeLabel(entry) {
    if (entry.dateStart === entry.dateEnd) return formatDate(entry.dateStart);
    return `${formatDate(entry.dateStart)} → ${formatDate(entry.dateEnd)}`;
  }

  function daysBetween(startIso, endIso) {
    const start = new Date(startIso + "T00:00:00");
    const end = new Date(endIso + "T00:00:00");
    return Math.round((end - start) / 86400000) + 1;
  }

  function sortedEntries() {
    return [...ENTRIES].sort((a, b) => (a.dateStart < b.dateStart ? 1 : -1));
  }

  function allTags() {
    const set = new Set();
    ENTRIES.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }

  function entryMatchesFilters(entry) {
    if (state.activeTags.size > 0) {
      const hasTag = entry.tags.some((t) => state.activeTags.has(t));
      if (!hasTag) return false;
    }

    if (state.query) {
      const haystack = [
        entry.project,
        entry.summary,
        ...entry.tags,
        ...(entry.tasks || []),
        ...(entry.findings || []),
        ...(entry.pending || []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(state.query)) return false;
    }

    return true;
  }

  function renderTagFilters() {
    els.tagFilters.innerHTML = "";
    allTags().forEach((tag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-chip";
      btn.textContent = tag;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        if (state.activeTags.has(tag)) {
          state.activeTags.delete(tag);
          btn.classList.remove("is-active");
          btn.setAttribute("aria-pressed", "false");
        } else {
          state.activeTags.add(tag);
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");
        }
        renderTimeline();
      });
      els.tagFilters.appendChild(btn);
    });
  }

  function fillList(ul, items) {
    ul.innerHTML = "";
    (items || []).forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
    ul.closest(".entry-details").hidden = !items || items.length === 0;
  }

  function renderTimeline() {
    const entries = sortedEntries().filter(entryMatchesFilters);
    els.timeline.innerHTML = "";
    els.emptyState.hidden = entries.length > 0;

    entries.forEach((entry) => {
      const node = els.template.content.cloneNode(true);

      node.querySelector(".entry-range").textContent =
        `${entry.dateStart}_a_${entry.dateEnd}`;
      node.querySelector(".entry-project").textContent = entry.project;
      node.querySelector(".entry-dates").textContent = dateRangeLabel(entry);
      node.querySelector(".entry-summary").textContent = entry.summary;

      const tagsList = node.querySelector(".entry-tags");
      entry.tags.forEach((tag) => {
        const li = document.createElement("li");
        li.textContent = tag;
        tagsList.appendChild(li);
      });

      fillList(node.querySelector(".entry-tasks"), entry.tasks);
      fillList(node.querySelector(".entry-findings"), entry.findings);
      fillList(node.querySelector(".entry-pending"), entry.pending);

      els.timeline.appendChild(node);
    });
  }

  function renderStats() {
    const totalEntries = ENTRIES.length;
    const totalProjects = new Set(ENTRIES.map((e) => e.project)).size;
    const totalDays = ENTRIES.reduce(
      (sum, e) => sum + daysBetween(e.dateStart, e.dateEnd),
      0
    );
    const totalTags = allTags().length;

    const stats = [
      { value: totalEntries, label: "entradas" },
      { value: totalProjects, label: "proyectos" },
      { value: totalDays, label: "días documentados" },
      { value: totalTags, label: "habilidades" },
    ];

    els.statsBar.innerHTML = "";
    stats.forEach((s) => {
      const box = document.createElement("div");
      box.className = "stat-box";
      box.innerHTML = `<span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span>`;
      els.statsBar.appendChild(box);
    });
  }

  function renderSkills() {
    const counts = new Map();
    ENTRIES.forEach((e) =>
      e.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
    );

    const maxCount = Math.max(1, ...counts.values());
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    els.skillsGrid.innerHTML = "";
    sorted.forEach(([tag, count]) => {
      const card = document.createElement("div");
      card.className = "skill-card";
      const pct = Math.round((count / maxCount) * 100);
      card.innerHTML = `
        <div class="skill-name">
          <span>${tag}</span>
          <span class="skill-count">x${count}</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width:${pct}%"></div>
        </div>
      `;
      els.skillsGrid.appendChild(card);
    });
  }

  function renderAbout() {
    const rows = [
      ["nombre", CONFIG.name],
      ["puesto", CONFIG.role],
      ["empresa", CONFIG.company],
      ["inicio", formatDate(CONFIG.startDate)],
      ["notas", CONFIG.intro],
    ];

    els.aboutCard.innerHTML = rows
      .map(
        ([key, value]) => `
          <div class="about-row">
            <span class="about-key">${key}</span>
            <span class="about-value">${value}</span>
          </div>`
      )
      .join("");
  }

  function initTabs() {
    els.tabButtons.forEach((btn) => {
      btn.id = `tab-btn-${btn.dataset.tab}`;
      btn.addEventListener("click", () => {
        els.tabButtons.forEach((b) => b.classList.remove("is-active"));
        els.tabPanels.forEach((p) => p.classList.remove("is-active"));
        btn.classList.add("is-active");
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add("is-active");
      });
    });
  }

  function initSearch() {
    els.searchInput.addEventListener("input", (e) => {
      state.query = e.target.value.trim().toLowerCase();
      renderTimeline();
    });
  }

  function init() {
    els.footerYear.textContent = new Date().getFullYear();
    initTabs();
    initSearch();
    renderTagFilters();
    renderTimeline();
    renderStats();
    renderSkills();
    renderAbout();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
