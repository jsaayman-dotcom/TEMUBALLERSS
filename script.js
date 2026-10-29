"use strict";

/* =====================================================
   TEMU BALLERS — THE SINGLE SOURCE OF CLUB DATA
   Update this object when the team's records change.
   ===================================================== */

const TEAM = {
  players: [
    { name: "Josh",    appearances: 2, goals: 2, assists: 0, green: 0, yellow: 0 },
    { name: "Ethan",   appearances: 2, goals: 0, assists: 1, green: 1, yellow: 0 },
    { name: "Jose",    appearances: 2, goals: 0, assists: 2, green: 0, yellow: 0 },
    { name: "Abdou",   appearances: 2, goals: 0, assists: 0, green: 0, yellow: 0 },
    { name: "Adam",    appearances: 2, goals: 2, assists: 0, green: 2, yellow: 0 },
    { name: "Alex",    appearances: 0, goals: 0, assists: 0, green: 0, yellow: 0 },
    { name: "Brandon", appearances: 2, goals: 0, assists: 0, green: 0, yellow: 0 },
    { name: "Lathi",   appearances: 0, goals: 0, assists: 0, green: 0, yellow: 0 },
    { name: "Zach",    appearances: 2, goals: 1, assists: 0, green: 1, yellow: 1 },
    { name: "Manu",    appearances: 0, goals: 0, assists: 0, green: 0, yellow: 0 }
  ],

  results: [
    {
      opponent: "Dark Knights",
      teamGoals: 3,
      opponentGoals: 3,
      scorers: ["Josh", "Zach", "Adam"],
      date: 0
    },
    {
      opponent: "FC Sparta",
      teamGoals: 2,
      opponentGoals: 1,
      scorers: ["Josh", "Adam"],
      date: 0
    }
  ],

  fixtures: [
    { date: "2026-11-04", time: "18:15", opponent: "Superstrikers", venue: "Fairview Action Arena" },
    { date: "2026-11-11", time: "20:30", opponent: "Depot Utd FC", venue: "Fairview Action Arena" },
    { date: "2026-11-18", time: "19:00", opponent: "Von-Boeties FC", venue: "Fairview Action Arena" },
    { date: "2026-11-25", time: "18:15", opponent: "Teknology FC", venue: "Fairview Action Arena" },
    { date: "2026-12-02", time: "19:45", opponent: "The Unknowns", venue: "Fairview Action Arena" },
    { date: "2026-12-09", time: "21:15", opponent: "Quality Control", venue: "Fairview Action Arena" },
    { date: "2026-12-16", time: "20:30", opponent: "Toray Logistics", venue: "Fairview Action Arena" }
  ],

  injuries: [
    { player: "Alex", injury: "Ear injury", status: "Reported" }
  ],

  teamOfWeek: {
    player: "Jose",
    gameweek: 1
  },

  rules: [
    "A yellow card results in one shot.",
    "A green card results in one shot.",
    "An own goal results in one shot.",
    "Not scoring results in one shot.",
    "Missing an open goal results in one shot.",
    "Finishing below fourth place means everyone takes a shot.",
    "The injury rule applies only if the team agrees."
  ]
};


/* =====================================================
   GENERAL HELPERS
   ===================================================== */

const $ = (selector, root = document) => root.querySelector(selector);

const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

function safeText(value) {
  return String(value ?? 0).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getStats(player) {
  const goals = Number(player.goals) || 0;
  const assists = Number(player.assists) || 0;

  return {
    appearances: Number(player.appearances) || 0,
    goals,
    assists,
    contributions: goals + assists,
    green: Number(player.green) || 0,
    yellow: Number(player.yellow) || 0
  };
}

function initials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function getPlayer(name) {
  return TEAM.players.find(player => player.name === name);
}

function formatDate(dateString, year = false) {
  if (!dateString) return "Date not recorded";

  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" } : {})
  });
}

function resultOutcome(match) {
  if (match.teamGoals > match.opponentGoals) return "Win";
  if (match.teamGoals < match.opponentGoals) return "Loss";
  return "Draw";
}

function seasonStats() {
  const played = TEAM.results.length;

  const wins = TEAM.results.filter(
    match => match.teamGoals > match.opponentGoals
  ).length;

  const draws = TEAM.results.filter(
    match => match.teamGoals === match.opponentGoals
  ).length;

  const losses = TEAM.results.filter(
    match => match.teamGoals < match.opponentGoals
  ).length;

  const goalsFor = TEAM.results.reduce(
    (sum, match) => sum + match.teamGoals, 0
  );

  const goalsAgainst = TEAM.results.reduce(
    (sum, match) => sum + match.opponentGoals, 0
  );

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws
  };
}

function sortPlayers(metric = "goals") {
  return [...TEAM.players].sort((a, b) => {
    if (metric === "name") {
      return a.name.localeCompare(b.name);
    }

    const A = getStats(a);
    const B = getStats(b);

    return B[metric] - A[metric]
      || B.appearances - A.appearances
      || a.name.localeCompare(b.name);
  });
}


/* =====================================================
   SEASON DASHBOARD
   ===================================================== */

function renderSeasonStats() {
  const mount = $("#seasonStats");
  if (!mount) return;

  const s = seasonStats();

  const cards = [
    ["Played", s.played],
    ["Wins", s.wins],
    ["Draws", s.draws],
    ["Losses", s.losses],
    ["Goals for", s.goalsFor],
    ["Goals against", s.goalsAgainst],
    ["Goal difference", s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference],
    ["Points", s.points]
  ];

  mount.innerHTML = cards.map(([label, value], index) => `
    <article class="stat-card ${index === 7 ? "stat-card-accent" : ""}">
      <span>${safeText(label)}</span>
      <strong>${safeText(value)}</strong>
    </article>
  `).join("");
}


/* =====================================================
   MATCH CENTRE
   ===================================================== */

function renderMatches() {
  const resultsBody = $("#resultsTable");
  const fixturesBody = $("#fixturesTable");

  if (resultsBody) {
    resultsBody.innerHTML = [...TEAM.results].reverse().map(match => `
      <tr>
        <td>${safeText(match.opponent)}</td>
        <td>${match.teamGoals}–${match.opponentGoals}</td>
        <td>${resultOutcome(match)}</td>
        <td>${match.scorers.length
          ? match.scorers.map(safeText).join(", ")
          : "0"}</td>
      </tr>
    `).join("");
  }

  if (fixturesBody) {
    fixturesBody.innerHTML = TEAM.fixtures.map(fixture => `
      <tr>
        <td>${formatDate(fixture.date, true)}</td>
        <td>${safeText(fixture.time)}</td>
        <td>${safeText(fixture.opponent)}</td>
        <td>${safeText(fixture.venue)}</td>
      </tr>
    `).join("");
  }

  // The last result in the current dataset is the most recent
  // result entered. No match date is invented.
  const latest = TEAM.results[TEAM.results.length - 1];

  if (latest) {
    const mount = $("#latestResult");

    if (mount) {
      mount.innerHTML = `
        <div class="scoreboard">
          <div class="team-side">
            <span class="mini-crest">TB</span>
            <strong>TEMU BALLERS</strong>
          </div>
          <div class="score">${latest.teamGoals} <span>–</span> ${latest.opponentGoals}</div>
          <div class="opponent-side">
            <strong>${safeText(latest.opponent.toUpperCase())}</strong>
            <span class="opponent-crest">FC</span>
          </div>
        </div>
        <p class="match-meta">
          Scorers: ${latest.scorers.length
            ? latest.scorers.map(safeText).join(", ")
            : "0"}
        </p>
      `;
    }
  }

  const next = TEAM.fixtures[0];

  if (next) {
    $("#nextOpponent").textContent = next.opponent.toUpperCase();
    $("#nextDate").textContent = formatDate(next.date, true).toUpperCase();
    $("#nextTime").textContent = next.time;
    $("#nextVenue").textContent = next.venue;
  }
}


/* =====================================================
   PLAYER CARDS AND SEARCH
   ===================================================== */

function playerCard(player) {
  const stats = getStats(player);

  return `
    <button class="player-card" type="button"
      data-player="${safeText(player.name)}"
      aria-label="View ${safeText(player.name)} profile">
      <span class="player-avatar">${safeText(initials(player.name))}</span>
      <strong>${safeText(player.name)}</strong>
      <span>${stats.goals} GOALS · ${stats.assists} ASSISTS</span>
    </button>
  `;
}

function renderPlayers() {
  const grid = $("#playersGrid");
  if (!grid) return;

  const search = $("#playerSearch");
  const count = $("#playerCount");
  const empty = $("#noPlayersMessage");

  function update() {
    const query = (search?.value || "").trim().toLowerCase();

    const players = TEAM.players.filter(player =>
      player.name.toLowerCase().includes(query)
    );

    grid.innerHTML = players.map(playerCard).join("");

    if (count) {
      count.textContent = `${players.length} PLAYER${players.length === 1 ? "" : "S"}`;
    }

    if (empty) empty.hidden = players.length !== 0;
  }

  search?.addEventListener("input", update);
  update();
}


/* =====================================================
   PLAYER PROFILE DIALOG
   ===================================================== */

function openPlayerProfile(name) {
  const player = getPlayer(name);
  const dialog = $("#playerDialog");
  const mount = $("#playerProfile");

  if (!player || !dialog || !mount) return;

  const s = getStats(player);

  mount.innerHTML = `
    <div class="profile-header">
      <span class="player-avatar player-avatar-large">${safeText(initials(player.name))}</span>
      <div>
        <span class="eyebrow">Temu Ballers player</span>
        <h2 id="profileName">${safeText(player.name)}</h2>
        <span class="status-pill">SQUAD MEMBER</span>
      </div>
    </div>

    <div class="profile-body">
      <div class="profile-stats">
        <div class="profile-stat"><strong>${s.appearances}</strong><span>Appearances</span></div>
        <div class="profile-stat"><strong>${s.goals}</strong><span>Goals</span></div>
        <div class="profile-stat"><strong>${s.assists}</strong><span>Assists</span></div>
        <div class="profile-stat"><strong>${s.contributions}</strong><span>Contributions</span></div>
        <div class="profile-stat"><strong>${s.green}</strong><span>Green cards</span></div>
        <div class="profile-stat"><strong>${s.yellow}</strong><span>Yellow cards</span></div>
      </div>
      <p style="font-size:11px;margin-top:17px">
        Player statistics reflect the current Temu Ballers dataset.
      </p>
    </div>
  `;

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function setupPlayerProfiles() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-player]");
    if (!button) return;

    openPlayerProfile(button.dataset.player);
  });

  const dialog = $("#playerDialog");
  const close = $("#closeDialog");

  close?.addEventListener("click", () => {
    if (dialog?.open) dialog.close();
    else dialog?.removeAttribute("open");
  });

  dialog?.addEventListener("click", event => {
    if (event.target === dialog && dialog.open) dialog.close();
  });
}


/* =====================================================
   LEADERBOARDS
   Every player is included, even on zero.
   ===================================================== */

function renderLeaderboard(metric, targetId) {
  const mount = document.getElementById(targetId);
  if (!mount) return;

  mount.innerHTML = sortPlayers(metric).map((player, index) => {
    const stats = getStats(player);

    return `
      <div class="leader-row">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${safeText(player.name)}</strong>
        <b>${stats[metric]}</b>
      </div>
    `;
  }).join("");
}


/* =====================================================
   FULL SQUAD STATISTICS TABLE
   ===================================================== */

function renderStatistics() {
  const table = $("#statsTable");
  if (!table) return;

  const search = $("#statsSearch");
  const sortSelect = $("#statsSort");

  let activeSort = "goals";
  let query = "";

  function draw() {
    let players = TEAM.players.filter(player =>
      player.name.toLowerCase().includes(query)
    );

    players = players.sort((a, b) => {
      if (activeSort === "name") {
        return a.name.localeCompare(b.name);
      }

      const A = getStats(a);
      const B = getStats(b);

      return B[activeSort] - A[activeSort]
        || B.appearances - A.appearances
        || a.name.localeCompare(b.name);
    });

    table.innerHTML = players.map((player, index) => {
      const s = getStats(player);

      return `
        <tr>
          <td class="rank">${index + 1}</td>
          <td>
            <button class="table-player-button" type="button"
              data-player="${safeText(player.name)}">
              ${safeText(player.name)}
            </button>
          </td>
          <td class="numeric">${s.appearances}</td>
          <td class="numeric">${s.goals}</td>
          <td class="numeric">${s.assists}</td>
          <td class="numeric">${s.contributions}</td>
          <td class="numeric">${s.green}</td>
          <td class="numeric">${s.yellow}</td>
        </tr>
      `;
    }).join("") || `
      <tr><td colspan="8">No players match your search.</td></tr>
    `;
  }

  search?.addEventListener("input", () => {
    query = search.value.trim().toLowerCase();
    draw();
  });

  sortSelect?.addEventListener("change", () => {
    activeSort = sortSelect.value;
    draw();
  });

  draw();
}


/* =====================================================
   CLUB RECORDS
   ===================================================== */

function renderRecords() {
  const greenTotal = TEAM.players.reduce(
    (sum, player) => sum + getStats(player).green, 0
  );

  const yellowTotal = TEAM.players.reduce(
    (sum, player) => sum + getStats(player).yellow, 0
  );

  $("#greenCards").textContent = greenTotal;
  $("#yellowCards").textContent = yellowTotal;
  $("#injuryCount").textContent = TEAM.injuries.length;

  // Current shot rule: one shot per recorded card.
  $("#totalShots").textContent = greenTotal + yellowTotal;

  $("#teamOfWeekPlayer").textContent =
    TEAM.teamOfWeek.player.toUpperCase();

  const injuries = $("#injuriesList");

  if (injuries) {
    injuries.innerHTML = TEAM.injuries.length
      ? TEAM.injuries.map(injury => `
          <p>
            <strong>${safeText(injury.player)}</strong>
            — ${safeText(injury.injury)}
            — ${safeText(injury.status)}
          </p>
        `).join("")
      : "<p>0 injuries recorded.</p>";
  }

  const rules = $("#rulesList");

  if (rules) {
    rules.innerHTML = TEAM.rules.map(rule =>
      `<li>${safeText(rule)}</li>`
    ).join("");
  }

  const fines = $("#finesTable");

  if (fines) {
    fines.innerHTML = TEAM.players.map(player => {
      const s = getStats(player);

      return `
        <tr>
          <td>${safeText(player.name)}</td>
          <td>${s.green}</td>
          <td>${s.yellow}</td>
          <td>0</td>
        </tr>
      `;
    }).join("");
  }
}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setupNavigation() {
  const toggle = $("#menuToggle");
  const nav = $("#mainNav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      toggle.textContent = open ? "×" : "☰";
    });

    $$(".nav-link", nav).forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        toggle.textContent = "☰";
      });
    });
  }

  const sections = $$(".page-section, main > .section[id]");

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.id;

      $$(".nav-link").forEach(link => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
      });
    }, {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 0.1, 0.3]
    });

    sections.forEach(section => observer.observe(section));
  }
}


/* =====================================================
   START THE WEBSITE
   ===================================================== */

function initialiseTemuBallers() {
  $("#currentYear").textContent = new Date().getFullYear();

  renderSeasonStats();
  renderMatches();
  renderPlayers();

  renderLeaderboard("goals", "goalsLeaderboard");
  renderLeaderboard("assists", "assistsLeaderboard");

  renderStatistics();
  renderRecords();

  setupPlayerProfiles();
  setupNavigation();
}

initialiseTemuBallers();
