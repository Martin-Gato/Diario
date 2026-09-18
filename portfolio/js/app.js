/**
 * app.js
 * Renderiza el contenido de projects-data.js: hero, tarjetas de proyecto,
 * grid de habilidades (derivado del stack de cada proyecto) y contacto.
 */
(function () {
  "use strict";

  const els = {
    heroName: document.getElementById("hero-name"),
    heroRole: document.getElementById("hero-role"),
    heroTagline: document.getElementById("hero-tagline"),
    statsBar: document.getElementById("stats-bar"),
    projectsGrid: document.getElementById("projects-grid"),
    projectTemplate: document.getElementById("project-template"),
    skillsGrid: document.getElementById("skills-grid"),
    contactEmail: document.getElementById("contact-email"),
    contactGithub: document.getElementById("contact-github"),
    footerYear: document.getElementById("footer-year"),
  };

  function allTags() {
    const set = new Set();
    PROJECTS.forEach((p) => p.stack.forEach((t) => set.add(t)));
    return [...set];
  }

  function renderHero() {
    els.heroName.textContent = CONFIG.name;
    els.heroName.setAttribute("data-text", CONFIG.name);
    els.heroRole.textContent = `${CONFIG.role} · ${CONFIG.company}`;
    els.heroTagline.textContent = CONFIG.tagline;
  }

  function renderStats() {
    const totalHighlights = PROJECTS.reduce((sum, p) => sum + p.highlights.length, 0);

    const stats = [
      { value: PROJECTS.length, label: "proyectos" },
      { value: allTags().length, label: "tecnologías" },
      { value: totalHighlights, label: "logros documentados" },
    ];

    els.statsBar.innerHTML = "";
    stats.forEach((s) => {
      const box = document.createElement("div");
      box.className = "stat-box";
      box.innerHTML = `<span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span>`;
      els.statsBar.appendChild(box);
    });
  }

  function renderProjects() {
    els.projectsGrid.innerHTML = "";

    PROJECTS.forEach((project) => {
      const node = els.projectTemplate.content.cloneNode(true);

      node.querySelector(".project-cmd").textContent = `$ cat proyecto_${project.id}.log`;
      node.querySelector(".project-title").textContent = project.title;
      node.querySelector(".project-period").textContent = project.periodLabel;
      node.querySelector(".project-status").textContent = project.status;
      node.querySelector(".project-summary").textContent = project.summary;

      const stackList = node.querySelector(".project-stack");
      project.stack.forEach((tech) => {
        const li = document.createElement("li");
        li.textContent = tech;
        stackList.appendChild(li);
      });

      const highlightsList = node.querySelector(".project-highlights");
      project.highlights.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        highlightsList.appendChild(li);
      });

      els.projectsGrid.appendChild(node);
    });
  }

  function renderSkills() {
    const counts = new Map();
    PROJECTS.forEach((p) =>
      p.stack.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
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

  function renderContact() {
    els.contactEmail.textContent = CONFIG.email;
    els.contactEmail.href = `mailto:${CONFIG.email}`;
    els.contactGithub.textContent = CONFIG.github.replace(/^https?:\/\//, "");
    els.contactGithub.href = CONFIG.github;
  }

  function init() {
    els.footerYear.textContent = new Date().getFullYear();
    renderHero();
    renderStats();
    renderProjects();
    renderSkills();
    renderContact();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
