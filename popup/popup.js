const materialSymbolsLink = document.createElement("link");
materialSymbolsLink.href =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
materialSymbolsLink.rel = "stylesheet";
document.head.appendChild(materialSymbolsLink);

const urlInput = document.getElementById("urlInput");
const addButton = document.getElementById("addButton");
const siteList = document.getElementById("siteList");

const NUMBER_OF_TASKS = 3;

function createMathTasks() {
  return Array.from({ length: NUMBER_OF_TASKS }, () => {
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let a, b, answer;

    if (operator === "+") {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
    } else if (operator === "-") {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      if (b > a) [a, b] = [b, a];
      answer = a - b;
    } else if (operator === "*") {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
    } else {
      b = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 10) + 1;
      a = b * answer;
    }

    return {
      question: `${a} ${operator === "*" ? "×" : operator === "/" ? "÷" : operator} ${b}`,
      answer,
    };
  });
}

async function getSites() {
  const result = await chrome.storage.sync.get({ blockedSites: [] });
  return result.blockedSites;
}

async function saveSites(sites) {
  await chrome.storage.sync.set({ blockedSites: sites });
}

function normalizeUrl(input) {
  let value = input.trim().toLowerCase();

  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/^www\./, "");
  value = value.split("/")[0];
  value = value.split(".")[0];

  return value;
}

function lockSettings() {
  urlInput.disabled = true;
  addButton.disabled = true;
  urlInput.style.display = "none";
  addButton.style.display = "none";
  siteList.style.display = "none";
}

function unlockSettings() {
  urlInput.disabled = false;
  addButton.disabled = false;
  urlInput.style.display = "block";
  addButton.style.display = "block";
  siteList.style.display = "block";
}

function createUnlockTest() {
  lockSettings();

  const mathTasks = createMathTasks();

  const wrapper = document.createElement("section");
  wrapper.id = "unlockTest";
  wrapper.style.marginBottom = "16px";
  wrapper.style.padding = "18px";
  wrapper.style.border = "1px solid #e0ded8";
  wrapper.style.borderRadius = "18px";
  wrapper.style.background = "#fef9f5";
  wrapper.style.boxShadow = "0 14px 40px rgba(23, 48, 71, 0.12)";
  wrapper.style.textAlign = "center";

  const title = document.createElement("h2");
  title.textContent = "Focus check";
  title.style.margin = "0 0 8px";
  title.style.fontSize = "18px";
  title.style.fontWeight = "600";
  title.style.color = "#173047";

  const description = document.createElement("p");
  description.textContent =
    "Solve the short tasks before changing your blocked sites.";
  description.style.margin = "0 0 14px";
  description.style.fontSize = "13px";
  description.style.lineHeight = "1.5";
  description.style.color = "#52616b";

  const taskList = document.createElement("div");
  taskList.style.display = "grid";
  taskList.style.gap = "10px";
  taskList.style.textAlign = "left";

  let currentTaskIndex = 0;
  let correctAnswers = 0;

  const row = document.createElement("label");
  row.style.display = "grid";
  row.style.gridTemplateColumns = "1fr 80px";
  row.style.alignItems = "center";
  row.style.gap = "10px";
  row.style.padding = "10px";
  row.style.border = "1px solid #e0ded8";
  row.style.borderRadius = "12px";
  row.style.background = "#ffffff";
  row.style.fontSize = "13px";
  row.style.color = "#173047";

  const question = document.createElement("span");
  question.textContent = `${mathTasks[currentTaskIndex].question} =`;

  const answerInput = document.createElement("input");
  answerInput.type = "number";
  answerInput.inputMode = "numeric";
  answerInput.style.width = "100%";
  answerInput.style.boxSizing = "border-box";
  answerInput.style.padding = "8px";
  answerInput.style.border = "1px solid #cfd8d3";
  answerInput.style.borderRadius = "10px";
  answerInput.style.background = "#f7f5ef";
  answerInput.style.fontSize = "13px";
  answerInput.style.color = "#173047";
  answerInput.style.outline = "none";

  row.appendChild(question);
  row.appendChild(answerInput);
  taskList.appendChild(row);

  const progress = document.createElement("div");
  progress.textContent = `0 / ${NUMBER_OF_TASKS} correct`;
  progress.style.marginTop = "10px";
  progress.style.fontSize = "12px";
  progress.style.color = "#7a8a93";

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Unlock changes";
  confirmButton.disabled = true;
  confirmButton.style.marginTop = "12px";
  confirmButton.style.padding = "10px 16px";
  confirmButton.style.border = "none";
  confirmButton.style.borderRadius = "10px";
  confirmButton.style.background = "#8bb8a8";
  confirmButton.style.color = "#fef9f5";
  confirmButton.style.fontSize = "14px";
  confirmButton.style.fontWeight = "600";
  confirmButton.style.opacity = "0.55";
  confirmButton.style.cursor = "not-allowed";

  function updateProgress() {
    const value = Number(answerInput.value);
    const hasValue = answerInput.value.trim() !== "";
    const isCorrect = hasValue && value === mathTasks[currentTaskIndex].answer;

    if (!isCorrect) {
      answerInput.style.borderColor = hasValue ? "#d68b8b" : "#cfd8d3";
      return;
    }

    correctAnswers += 1;
    progress.textContent = `${correctAnswers} / ${NUMBER_OF_TASKS} richtig`;
    answerInput.style.borderColor = "#8bb8a8";

    if (correctAnswers === NUMBER_OF_TASKS) {
      confirmButton.disabled = false;
      confirmButton.style.opacity = "1";
      confirmButton.style.cursor = "pointer";
      answerInput.disabled = true;
      return;
    }

    currentTaskIndex += 1;
    question.textContent = `${mathTasks[currentTaskIndex].question} =`;
    answerInput.value = "";
    answerInput.style.borderColor = "#cfd8d3";
    answerInput.focus();
  }

  answerInput.addEventListener("input", updateProgress);

  confirmButton.onclick = () => {
    if (correctAnswers !== NUMBER_OF_TASKS) return;

    unlockSettings();
    wrapper.remove();
    renderSites();
    urlInput.focus();
  };

  wrapper.appendChild(title);
  wrapper.appendChild(description);
  wrapper.appendChild(taskList);
  wrapper.appendChild(progress);
  wrapper.appendChild(confirmButton);

  document.body.insertBefore(wrapper, urlInput);
  answerInput.focus();
}

async function renderSites() {
  const sites = await getSites();
  siteList.innerHTML = "";

  sites.forEach((site, index) => {
    const li = document.createElement("li");
    li.style.background = "#fef9f5";
    li.style.border = "1px solid #e0ded8";
    li.style.borderRadius = "12px";
    li.style.padding = "10px";
    li.style.marginBottom = "8px";

    const span = document.createElement("span");
    span.textContent = site;

    const removeButton = document.createElement("button");
    removeButton.innerHTML =
      '<span class="material-symbols-outlined">delete</span>';
    removeButton.className = "remove";
    removeButton.style.display = "inline-flex";
    removeButton.style.alignItems = "center";
    removeButton.style.justifyContent = "center";
    removeButton.style.width = "32px";
    removeButton.style.height = "32px";
    removeButton.style.borderRadius = "8px";
    removeButton.style.border = "1px solid #e5e7eb";
    removeButton.style.background = "#ffffff";
    removeButton.style.color = "#6b7280";
    removeButton.style.cursor = "pointer";
    removeButton.style.transition = "all 0.15s ease";

    removeButton.onmouseenter = () => {
      removeButton.style.background = "#f9fafb";
      removeButton.style.color = "#111827";
      removeButton.style.borderColor = "#d1d5db";
    };

    removeButton.onmouseleave = () => {
      removeButton.style.background = "#ffffff";
      removeButton.style.color = "#6b7280";
      removeButton.style.borderColor = "#e5e7eb";
    };

    removeButton.onclick = async () => {
      const updatedSites = sites.filter((_, i) => i !== index);
      await saveSites(updatedSites);
      renderSites();
    };

    li.appendChild(span);
    li.appendChild(removeButton);
    siteList.appendChild(li);
  });
}

addButton.onclick = async () => {
  const site = normalizeUrl(urlInput.value);

  if (!site) return;

  const sites = await getSites();

  if (!sites.includes(site)) {
    sites.push(site);
    await saveSites(sites);
  }

  urlInput.value = "";
  renderSites();
};

createUnlockTest();
renderSites();
