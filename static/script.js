const form = document.getElementById("analyzeForm");
const codeInput = document.getElementById("codeInput");
const languageInput = document.getElementById("language");
const analyzeButton = document.getElementById("analyzeButton");
const clearButton = document.getElementById("clearButton");
const characterCount = document.getElementById("characterCount");
const formError = document.getElementById("formError");
const resultContent = document.getElementById("resultContent");
const scoreCard = document.getElementById("scoreCard");
const scoreNumber = document.getElementById("scoreNumber");
const scoreMessage = document.getElementById("scoreMessage");
const tabButtons = document.querySelectorAll(".tab");

let analysisResult = null;
let activeTab = "bugs";

codeInput.addEventListener("input", () => {
  characterCount.textContent =
    `${codeInput.value.length.toLocaleString()} characters`;

  formError.textContent = "";
});

clearButton.addEventListener("click", () => {
  codeInput.value = "";
  characterCount.textContent = "0 characters";
  formError.textContent = "";
  analysisResult = null;
  scoreCard.classList.add("hidden");

  resultContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">&lt;/&gt;</div>
      <h3>Ready to analyze</h3>
      <p>
        Paste your code, select its programming language and
        click Analyze Code.
      </p>
    </div>
  `;
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeTab = button.dataset.tab;

    tabButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    if (analysisResult) {
      renderActiveTab();
    }
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const code = codeInput.value.trim();
  const language = languageInput.value;

  if (!code) {
    formError.textContent = "Please paste some code first.";
    codeInput.focus();
    return;
  }

  setLoading(true);
  formError.textContent = "";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        language
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Code analysis failed.");
    }

    analysisResult = data;
    activeTab = "bugs";

    tabButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.tab === activeTab
      );
    });

    showScore(data.score);
    renderActiveTab();
  } catch (error) {
    scoreCard.classList.add("hidden");

    resultContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Analysis failed</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading
    ? "Analyzing..."
    : "Analyze Code";

  if (isLoading) {
    resultContent.innerHTML = `
      <div class="loading">
        <h3>Analyzing your code...</h3>
        <p>Checking bugs, security and performance.</p>
      </div>
    `;
  }
}

function showScore(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  scoreCard.classList.remove("hidden");
  scoreNumber.textContent = safeScore;

  if (safeScore >= 80) {
    scoreMessage.textContent = "Excellent code quality";
    scoreNumber.style.color = "#55c790";
  } else if (safeScore >= 60) {
    scoreMessage.textContent = "Good, but improvements are possible";
    scoreNumber.style.color = "#f0a030";
  } else {
    scoreMessage.textContent = "Important problems need attention";
    scoreNumber.style.color = "#ff6b6b";
  }
}

function renderActiveTab() {
  if (!analysisResult) {
    return;
  }

  if (activeTab === "suggestions") {
    renderSuggestions(analysisResult.suggestions || []);
    return;
  }

  if (activeTab === "improved_code") {
    renderImprovedCode(analysisResult.improved_code || "");
    return;
  }

  renderIssues(analysisResult[activeTab] || []);
}

function renderIssues(issues) {
  if (!issues.length) {
    resultContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">OK</div>
        <h3>No issues found</h3>
        <p>No problems were detected in this category.</p>
      </div>
    `;

    return;
  }

  resultContent.innerHTML = issues
    .map((issue) => {
      const severity = ["error", "warning", "info"].includes(
        issue.severity
      )
        ? issue.severity
        : "info";

      const line = issue.line
        ? `<span class="line-number">Line ${issue.line}</span>`
        : "";

      const fix = issue.fix
        ? `<div class="fix"><strong>Fix:</strong> ${escapeHtml(issue.fix)}</div>`
        : "";

      return `
        <article class="issue-card ${severity}">
          <div class="issue-top">
            <span class="severity">${escapeHtml(severity)}</span>
            ${line}
          </div>

          <p>${escapeHtml(issue.message || "Issue found.")}</p>
          ${fix}
        </article>
      `;
    })
    .join("");
}

function renderSuggestions(suggestions) {
  if (!suggestions.length) {
    resultContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">OK</div>
        <h3>No suggestions</h3>
        <p>Your code does not require additional suggestions.</p>
      </div>
    `;

    return;
  }

  resultContent.innerHTML = suggestions
    .map((suggestion, index) => `
      <div class="suggestion">
        <strong>${index + 1}.</strong>
        ${escapeHtml(suggestion)}
      </div>
    `)
    .join("");
}

function renderImprovedCode(code) {
  resultContent.innerHTML = `
    <div class="code-header">
      <strong>Improved code</strong>

      <button class="copy-button" id="copyButton" type="button">
        Copy code
      </button>
    </div>

    <pre class="code-block">${escapeHtml(code)}</pre>
  `;

  document
    .getElementById("copyButton")
    .addEventListener("click", async (event) => {
      await navigator.clipboard.writeText(code);
      event.currentTarget.textContent = "Copied";

      setTimeout(() => {
        event.currentTarget.textContent = "Copy code";
      }, 1500);
    });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}