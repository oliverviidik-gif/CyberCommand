"use strict";

// CYBER COMMAND 2.1
// This dashboard displays simulated events only.
// It never scans external networks or contacts other computers.

const locations = [
  { name: "Tallinn", x: 535, y: 135 },
  { name: "New York", x: 270, y: 165 },
  { name: "São Paulo", x: 330, y: 350 },
  { name: "Tokyo", x: 845, y: 190 },
  { name: "Sydney", x: 870, y: 390 },
  { name: "London", x: 485, y: 145 },
  { name: "Singapore", x: 760, y: 315 },
  { name: "Cape Town", x: 555, y: 390 }
];

const eventTypes = [
  "Kahtlane sisselogimiskatse",
  "Portide skannimise simulatsioon",
  "Ebatavaline võrguliiklus",
  "Tulemüüri hoiatus",
  "Võimalik andmepäring"
];

const threatLevels = [
  { name: "LOW", color: "#5ce5ad", count: 0 },
  { name: "MEDIUM", color: "#f5cf69", count: 0 },
  { name: "HIGH", color: "#ff9969", count: 0 },
  { name: "CRITICAL", color: "#ff607d", count: 0 }
];

const statistics = {
  total: 0,
  blocked: 0,
  active: 0
};

const history = [];
let simulationRunning = true;
let selectedFilter = "all";

function getElement(id) {
  return document.getElementById(id);
}

function chooseRandom(items) {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function updateClock() {
  const currentTime = new Date();

  getElement("clock").textContent =
    currentTime.toLocaleString("et-EE");
}

function updateStatistics() {
  getElement("total").textContent = statistics.total;
  getElement("blocked").textContent = statistics.blocked;
  getElement("active").textContent = statistics.active;
}

function chooseThreatLevel() {
  const chance = Math.random();

  if (chance < 0.5) return threatLevels[0];
  if (chance < 0.8) return threatLevels[1];
  if (chance < 0.95) return threatLevels[2];

  return threatLevels[3];
}

function createEvent() {
  const source = chooseRandom(locations);
  const possibleTargets = locations.filter(
    (location) => location !== source
  );

  const target = chooseRandom(possibleTargets);
  const blocked = Math.random() > 0.25;
  const level = chooseThreatLevel();

  const event = {
    id: statistics.total + 1,
    time: new Date().toLocaleTimeString("et-EE"),
    source,
    target,
    blocked,
    level: level.name,
    description: chooseRandom(eventTypes)
  };

  statistics.total += 1;
  level.count += 1;

  if (blocked) {
    statistics.blocked += 1;
  } else {
    statistics.active += 1;
  }

  history.unshift(event);

  if (history.length > 50) {
    history.pop();
  }

  updateStatistics();
  renderEvents();
  renderThreatLevels();
  animateConnection(event);

  if (!blocked) {
    setTimeout(() => {
      statistics.active = Math.max(0, statistics.active - 1);
      updateStatistics();
    }, 2400);
  }
}

function createEventRow(event) {
  const row = document.createElement("div");
  row.className = event.blocked ? "event ok" : "event";

  const time = document.createElement("time");
  time.textContent = event.time;

  const title = document.createElement("strong");
  title.textContent = event.blocked
    ? "✓ BLOKEERITUD"
    : "⚠ JÄLGIMISEL";

  const description = document.createElement("p");
  description.textContent =
    event.description +
    " · " +
    event.source.name +
    " → " +
    event.target.name +
    " · " +
    event.level;

  row.append(time, title, description);
  return row;
}

function renderEvents() {
  const container = getElement("events");

  const visibleEvents = history.filter((event) => {
    if (selectedFilter === "blocked") return event.blocked;
    if (selectedFilter === "active") return !event.blocked;

    return true;
  });

  const rows = visibleEvents
    .slice(0, 12)
    .map(createEventRow);

  container.replaceChildren(...rows);
}

function setupEventFilters() {
  const container = getElement("events");
  const toolbar = document.createElement("div");

  toolbar.className = "event-filters";

  const filters = [
    { value: "all", label: "Kõik" },
    { value: "blocked", label: "Blokeeritud" },
    { value: "active", label: "Jälgimisel" }
  ];

  filters.forEach((filter) => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = filter.label;
    button.dataset.filter = filter.value;
    button.classList.toggle(
      "selected",
      filter.value === selectedFilter
    );

    button.addEventListener("click", () => {
      selectedFilter = filter.value;

      toolbar.querySelectorAll("button").forEach((item) => {
        item.classList.toggle(
          "selected",
          item.dataset.filter === selectedFilter
        );
      });

      renderEvents();
    });

    toolbar.append(button);
  });

  container.before(toolbar);
}

function renderThreatLevels() {
  const container = getElement("threatBars");
  const maximum = Math.max(
    1,
    ...threatLevels.map((level) => level.count)
  );

  const rows = threatLevels.map((level) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";

    const name = document.createElement("span");
    name.textContent = level.name;

    const count = document.createElement("span");
    count.textContent = level.count;

    label.append(name, count);

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.background = level.color;
    fill.style.width =
      (level.count / maximum) * 100 + "%";

    track.append(fill);
    row.append(label, track);

    return row;
  });

  container.replaceChildren(...rows);
}

function createSvgElement(tagName, attributes) {
  const namespace = "http://www.w3.org/2000/svg";
  const element = document.createElementNS(namespace, tagName);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  return element;
}

function animateConnection(event) {
  const line = createSvgElement("line", {
    x1: event.source.x,
    y1: event.source.y,
    x2: event.target.x,
    y2: event.target.y,
    stroke: event.blocked ? "#5ce5ad" : "#ff657d"
  });

  const marker = createSvgElement("circle", {
    cx: event.target.x,
    cy: event.target.y,
    r: 6,
    fill: event.blocked ? "#5ce5ad" : "#ff657d"
  });

  getElement("routes").append(line);
  getElement("nodes").append(marker);

  setTimeout(() => {
    line.remove();
    marker.remove();
  }, 2400);
}

function setSimulationRunning(running) {
  simulationRunning = running;

  getElement("toggle").textContent = running
    ? "⏸ Peata simulatsioon"
    : "▶ Jätka simulatsiooni";
}

function printTerminal(message) {
  const output = getElement("terminalOutput");

  output.append(document.createTextNode("\n" + message));
  output.scrollTop = output.scrollHeight;
}

function executeCommand(command) {
  switch (command) {
    case "help":
      printTerminal(
        "Käsud: help, status, scan, clear, pause, resume"
      );
      break;

    case "status":
      printTerminal(
        "Simulatsioon: " +
        (simulationRunning ? "AKTIIVNE" : "PEATATUD") +
        " | Sündmused: " +
        statistics.total +
        " | Blokeeritud: " +
        statistics.blocked
      );
      break;

    case "scan":
      createEvent();
      printTerminal(
        "Näidisskann lõpetatud. Päris võrke ei skannitud."
      );
      break;

    case "clear":
      getElement("terminalOutput").textContent = "";
      break;

    case "pause":
      setSimulationRunning(false);
      printTerminal("Simulatsioon peatatud.");
      break;

    case "resume":
      setSimulationRunning(true);
      printTerminal("Simulatsioon jätkub.");
      break;

    default:
      printTerminal("Tundmatu käsk. Proovi help.");
  }
}

function setupControls() {
  getElement("toggle").addEventListener("click", () => {
    setSimulationRunning(!simulationRunning);
  });

  getElement("add").addEventListener("click", createEvent);

  getElement("terminalForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const input = getElement("terminalInput");
    const command = input.value.trim().toLowerCase();

    input.value = "";

    if (!command) return;

    printTerminal("> " + command);
    executeCommand(command);
  });
}

function startDashboard() {
  setupControls();
  setupEventFilters();
  updateClock();
  updateStatistics();
  renderThreatLevels();
  createEvent();

  setInterval(updateClock, 1000);

  setInterval(() => {
    if (simulationRunning) {
      createEvent();
    }
  }, 2200);
}

startDashboard();
