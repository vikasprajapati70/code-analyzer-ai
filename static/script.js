(function () {

    "use strict";


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const els = {

        languageSelect:
            document.getElementById("languageSelect"),

        codeInput:
            document.getElementById("codeInput"),

        lineCount:
            document.getElementById("lineCount"),

        charCount:
            document.getElementById("charCount"),

        lineNumbers:
            document.getElementById("lineNumbers"),

        clearBtn:
            document.getElementById("clearBtn"),

        exampleBtn:
            document.getElementById("exampleBtn"),

        analyzeBtn:
            document.getElementById("analyzeBtn"),

        analysisEmpty:
            document.getElementById("analysisEmpty"),

        analysisResult:
            document.getElementById("analysisResult"),

        score:
            document.getElementById("score"),

        grade:
            document.getElementById("grade"),

        summary:
            document.getElementById("summary"),

        bugCount:
            document.getElementById("bugCount"),

        securityCount:
            document.getElementById("securityCount"),

        performanceCount:
            document.getElementById("performanceCount"),

        qualityCount:
            document.getElementById("qualityCount"),

        suggestionCount:
            document.getElementById("suggestionCount"),

        bugTabCount:
            document.getElementById("bugTabCount"),

        securityTabCount:
            document.getElementById("securityTabCount"),

        performanceTabCount:
            document.getElementById("performanceTabCount"),

        qualityTabCount:
            document.getElementById("qualityTabCount"),

        suggestionTabCount:
            document.getElementById("suggestionTabCount"),

        bugs:
            document.getElementById("bugs"),

        security:
            document.getElementById("security"),

        performance:
            document.getElementById("performance"),

        quality:
            document.getElementById("quality"),

        suggestions:
            document.getElementById("suggestions"),

        improvedCode:
            document.getElementById("improvedCode"),

        toast:
            document.getElementById("toast"),

        tabs:
            document.querySelectorAll(".tab")

    };


    /* =====================================================
       EXAMPLE CODE
       ===================================================== */

    const exampleCode = {

        C: `#include <stdio.h>

int main() {

    int numbers[5];

    for(int i = 0; i <= 5; i++) {
        printf("%d", numbers[i]);
    }

    return 0;
}`,


        "C++": `#include <iostream>
using namespace std;

int main() {

    int number;

    cin >> number;

    if(number = 10) {
        cout << "Number is 10";
    }

    return 0;
}`,


        Python: `import sqlite3

def get_user(username, password):

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'"

    cursor.execute(query)

    user = cursor.fetchone()

    password_plain = password

    temp = []

    for i in range(1000):
        temp.append(i * i)

    if user != None:
        return user
    else:
        return None`,


        Java: `public class Main {

    public static void main(String[] args) {

        String password = "123456";

        System.out.println(password);

    }
}`,


        JavaScript: `function getUser(username, password) {

    const query =
        "SELECT * FROM users WHERE username='" +
        username +
        "' AND password='" +
        password +
        "'";

    console.log(query);

    return query;
}`,


        Rust: `fn main() {

    let password = "123456";

    println!("{}", password);

    let mut numbers = vec![1, 2, 3];

    for i in 0..=numbers.len() {
        println!("{}", numbers[i]);
    }
}`,


        PHP: `<?php

$username = $_GET["username"];
$password = $_GET["password"];

$query = "SELECT * FROM users WHERE username='$username' AND password='$password'";

echo $query;

?>`,


        Ruby: `def get_user(username, password)

    query = "SELECT * FROM users WHERE username='#{username}' AND password='#{password}'"

    puts query

end

password = "123456"

get_user("admin", password)`,



        Swift: `import Foundation

let password = "123456"

print(password)

var numbers = [1, 2, 3, 4, 5]

for i in 0...numbers.count {
    print(numbers[i])
}`,



        Dart: `void main() {

    String password = "123456";

    print(password);

    List<int> numbers = [1, 2, 3];

    for (int i = 0; i <= numbers.length; i++) {
        print(numbers[i]);
    }

}`,



        Kotlin: `fun main() {

    val password = "123456"

    println(password)

    val numbers = listOf(1, 2, 3)

    for (i in 0..numbers.size) {
        println(numbers[i])
    }

}`,



        SQL: `SELECT *

FROM users

WHERE username = 'admin'

AND password = '123456';`,



        "HTML/CSS": `<!DOCTYPE html>

<html>

<head>

    <title>My Website</title>

    <style>

        body {
            background: white;
        }

        .button {
            color: red;
        }

    </style>

</head>

<body>

    <h1>Hello World</h1>

    <img src="image.jpg">

    <button class="button">
        Click Me
    </button>

</body>

</html>`

    };


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    let lastAnalysis = null;


    /* =====================================================
       UTILITY
       ===================================================== */

    function safeArray(value) {

        if (Array.isArray(value)) {
            return value;
        }

        if (value === null || value === undefined) {
            return [];
        }

        if (typeof value === "string") {
            return [value];
        }

        return [value];
    }


    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getNumber(value, fallback = 0) {

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function getText(value, fallback = "") {

        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value);
    }


    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer = null;


    function showToast(message) {

        if (!els.toast) {
            return;
        }

        els.toast.textContent = message;

        els.toast.hidden = false;

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            els.toast.hidden = true;

        }, 3000);

    }


    /* =====================================================
       LINE COUNTER
       ===================================================== */

    function updateStats() {

        const code = els.codeInput
            ? els.codeInput.value
            : "";

        const lines = code.length === 0
            ? 0
            : code.split("\n").length;

        const chars = code.length;


        if (els.lineCount) {

            els.lineCount.textContent =
                `${lines} lines`;

        }


        if (els.charCount) {

            els.charCount.textContent =
                `${chars} chars`;

        }


        updateLineNumbers(lines);

    }


    /* =====================================================
       LINE NUMBERS
       ===================================================== */

    function updateLineNumbers(lines) {

        if (!els.lineNumbers) {
            return;
        }


        if (lines === 0) {

            els.lineNumbers.innerHTML =
                "<div>1</div>";

            return;

        }


        let html = "";

        for (let i = 1; i <= lines; i++) {

            html += `<div>${i}</div>`;

        }

        els.lineNumbers.innerHTML = html;

    }


    /* =====================================================
       SYNC EDITOR SCROLL
       ===================================================== */

    function syncLineScroll() {

        if (!els.codeInput || !els.lineNumbers) {
            return;
        }

        els.lineNumbers.scrollTop =
            els.codeInput.scrollTop;

    }


    /* =====================================================
       SCORE GRADE
       ===================================================== */

    function getGrade(score) {

        if (score >= 90) {
            return "Excellent Code";
        }

        if (score >= 80) {
            return "Good Code";
        }

        if (score >= 70) {
            return "Fair Code";
        }

        if (score >= 50) {
            return "Needs Improvement";
        }

        return "Poor Code";

    }


    /* =====================================================
       SCORE COLOR
       ===================================================== */

    function updateScore(score) {

        score = Math.max(
            0,
            Math.min(
                100,
                Math.round(score)
            )
        );


        if (els.score) {
            els.score.textContent = score;
        }


        if (els.grade) {
            els.grade.textContent =
                getGrade(score);
        }

    }


    /* =====================================================
       COUNTS
       ===================================================== */

    function updateCounts(data) {

        const bugs =
            safeArray(data.bugs);

        const security =
            safeArray(data.security);

        const performance =
            safeArray(data.performance);

        const quality =
            safeArray(
                data.quality ||
                data.code_quality
            );

        const suggestions =
            safeArray(data.suggestions);


        setText(
            els.bugCount,
            bugs.length
        );

        setText(
            els.securityCount,
            security.length
        );

        setText(
            els.performanceCount,
            performance.length
        );

        setText(
            els.qualityCount,
            quality.length
        );

        setText(
            els.suggestionCount,
            suggestions.length
        );


        setText(
            els.bugTabCount,
            bugs.length
        );

        setText(
            els.securityTabCount,
            security.length
        );

        setText(
            els.performanceTabCount,
            performance.length
        );

        setText(
            els.qualityTabCount,
            quality.length
        );

        setText(
            els.suggestionTabCount,
            suggestions.length
        );

    }


    function setText(element, value) {

        if (element) {
            element.textContent =
                String(value);
        }

    }


    /* =====================================================
       NORMALIZE API RESPONSE
       ===================================================== */

    function normalizeResult(data) {

        if (!data || typeof data !== "object") {

            return {

                score: 0,

                summary:
                    "No analysis result received.",

                bugs: [],

                security: [],

                performance: [],

                quality: [],

                suggestions: [],

                improvedCode: ""

            };

        }


        const result =
            data.analysis ||
            data.result ||
            data.data ||
            data;


        return {

            score:
                getNumber(
                    result.score ??
                    result.overall_score ??
                    result.quality_score ??
                    result.overallScore,
                    0
                ),


            summary:
                getText(
                    result.summary ??
                    result.overall_summary ??
                    result.description,
                    "Analysis completed successfully."
                ),


            bugs:
                safeArray(
                    result.bugs ??
                    result.errors ??
                    result.issues
                ),


            security:
                safeArray(
                    result.security ??
                    result.security_issues
                ),


            performance:
                safeArray(
                    result.performance ??
                    result.performance_issues
                ),


            quality:
                safeArray(
                    result.quality ??
                    result.code_quality ??
                    result.quality_issues
                ),


            suggestions:
                safeArray(
                    result.suggestions ??
                    result.recommendations
                ),


            improvedCode:
                getText(
                    result.improvedCode ??
                    result.improved_code ??
                    result.fixed_code ??
                    result.fixedCode,
                    ""
                )

        };

    }


    /* =====================================================
       FORMAT ISSUE
       ===================================================== */

    function formatIssue(issue, index) {

        if (typeof issue === "string") {

            return {

                title:
                    `Issue ${index + 1}`,

                description:
                    issue,

                line:
                    "",

                severity:
                    "INFO",

                fix:
                    ""

            };

        }


        if (!issue || typeof issue !== "object") {

            return {

                title:
                    `Issue ${index + 1}`,

                description:
                    String(issue),

                line:
                    "",

                severity:
                    "INFO",

                fix:
                    ""

            };

        }


        return {

            title:
                issue.title ??
                issue.message ??
                issue.name ??
                issue.issue ??
                `Issue ${index + 1}`,

            description:
                issue.description ??
                issue.details ??
                issue.explanation ??
                issue.message ??
                "",

            line:
                issue.line ??
                issue.line_number ??
                issue.lineNumber ??
                "",

            severity:
                issue.severity ??
                issue.type ??
                "INFO",

            fix:
                issue.fix ??
                issue.solution ??
                issue.recommendation ??
                ""

        };

    }


    /* =====================================================
       RENDER ISSUE CARD
       ===================================================== */

    function renderIssueCard(issue, index) {

        const item =
            formatIssue(
                issue,
                index
            );


        let html = `

            <article class="result-card">

                <h4>
                    ${escapeHTML(item.title)}
                </h4>

        `;


        if (item.line !== "") {

            html += `

                <p>
                    <strong>Line:</strong>
                    ${escapeHTML(item.line)}
                </p>

            `;

        }


        if (item.severity) {

            html += `

                <p>
                    <strong>Severity:</strong>
                    ${escapeHTML(item.severity)}
                </p>

            `;

        }


        if (item.description) {

            html += `

                <p>
                    ${escapeHTML(item.description)}
                </p>

            `;

        }


        if (item.fix) {

            html += `

                <p>
                    <strong>Fix:</strong>
                    ${escapeHTML(item.fix)}
                </p>

            `;

        }


        html += `
            </article>
        `;


        return html;

    }


    /* =====================================================
       RENDER ISSUE SECTION
       ===================================================== */

    function renderIssueSection(
        element,
        title,
        icon,
        items,
        emptyMessage
    ) {

        if (!element) {
            return;
        }


        const list =
            safeArray(items);


        let html = `

            <div class="result-card">

                <h4>
                    ${icon}
                    ${escapeHTML(title)}
                </h4>

                <p>
                    ${
                        list.length
                        ? `Found ${list.length} issue(s).`
                        : escapeHTML(emptyMessage)
                    }
                </p>

            </div>

        `;


        if (list.length > 0) {

            list.forEach(
                function (issue, index) {

                    html +=
                        renderIssueCard(
                            issue,
                            index
                        );

                }
            );

        }


        element.innerHTML = html;

    }


    /* =====================================================
       RENDER IMPROVED CODE
       ===================================================== */

    function renderImprovedCode(code) {

        if (!els.improvedCode) {
            return;
        }


        if (!code) {

            els.improvedCode.innerHTML = `

                <article class="result-card">

                    <h4>
                        ✨ Improved Code
                    </h4>

                    <p>
                        No improved code was returned by the AI.
                    </p>

                </article>

            `;

            return;

        }


        els.improvedCode.innerHTML = `

            <article class="result-card">

                <h4>
                    ✨ Improved Code
                </h4>

                <p>
                    AI-generated improved version of your code:
                </p>

                <pre><code>${escapeHTML(code)}</code></pre>

                <button
                    type="button"
                    id="copyImprovedBtn"
                    class="example-btn"
                    style="margin-top:10px;"
                >
                    Copy Improved Code
                </button>

            </article>

        `;


        const copyButton =
            document.getElementById(
                "copyImprovedBtn"
            );


        if (copyButton) {

            copyButton.addEventListener(
                "click",
                function () {

                    copyText(
                        code,
                        "Improved code copied!"
                    );

                }
            );

        }

    }


    /* =====================================================
       RENDER COMPLETE RESULT
       ===================================================== */

    function renderAnalysisResult(rawData) {

        const data =
            normalizeResult(rawData);


        lastAnalysis = data;


        /* SCORE */

        updateScore(data.score);


        /* SUMMARY */

        if (els.summary) {

            els.summary.textContent =
                data.summary;

        }


        /* COUNTS */

        updateCounts(data);


        /* BUGS */

        renderIssueSection(

            els.bugs,

            "Bugs",

            "🐞",

            data.bugs,

            "No bugs detected."

        );


        /* SECURITY */

        renderIssueSection(

            els.security,

            "Security",

            "🔒",

            data.security,

            "No security issues detected."

        );


        /* PERFORMANCE */

        renderIssueSection(

            els.performance,

            "Performance",

            "⚡",

            data.performance,

            "No performance issues detected."

        );


        /* QUALITY */

        renderIssueSection(

            els.quality,

            "Code Quality",

            "📊",

            data.quality,

            "No code quality issues detected."

        );


        /* SUGGESTIONS */

        renderIssueSection(

            els.suggestions,

            "Suggestions",

            "💡",

            data.suggestions,

            "No additional suggestions."

        );


        /* IMPROVED CODE */

        renderImprovedCode(
            data.improvedCode
        );


        /* SHOW RESULT */

        if (els.analysisEmpty) {

            els.analysisEmpty.style.display =
                "none";

        }


        if (els.analysisResult) {

            els.analysisResult.style.display =
                "block";

        }


        /* SHOW FIRST TAB */

        activateTab("bugs");

    }


    /* =====================================================
       TABS
       ===================================================== */

    function activateTab(tabName) {

        if (!els.analysisResult) {
            return;
        }


        const sections = {

            bugs:
                els.bugs,

            security:
                els.security,

            performance:
                els.performance,

            quality:
                els.quality,

            suggestions:
                els.suggestions,

            improvedCode:
                els.improvedCode

        };


        Object.keys(sections)
            .forEach(function (key) {

                const section =
                    sections[key];

                if (!section) {
                    return;
                }


                section.style.display =
                    key === tabName
                        ? "block"
                        : "none";

            });


        els.tabs.forEach(
            function (tab) {

                const isActive =
                    tab.dataset.tab === tabName;


                tab.classList.toggle(
                    "active",
                    isActive
                );

            }
        );

    }


    function setupTabs() {

        els.tabs.forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        const tabName =
                            tab.dataset.tab;

                        activateTab(tabName);

                    }
                );

            }
        );

    }


    /* =====================================================
       ANALYZE CODE
       ===================================================== */

    async function analyzeCode() {

        const code =
            els.codeInput
                ? els.codeInput.value.trim()
                : "";


        const language =
            els.languageSelect
                ? els.languageSelect.value
                : "Python";


        if (!code) {

            showToast(
                "Please enter some code first."
            );

            if (els.codeInput) {
                els.codeInput.focus();
            }

            return;

        }


        /* BUTTON LOADING */

        setAnalyzeLoading(true);


        try {

            /*
             * Flask backend endpoint
             *
             * POST /analyze
             *
             * Body:
             * {
             *     code: "...",
             *     language: "Python"
             * }
             */

            const response =
                await fetch(
                    "/analyze",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                code:
                                    code,

                                language:
                                    language

                            })

                        }
                );


            /* READ RESPONSE */

            let data = null;


            try {

                data =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "Server returned an invalid JSON response."
                );

            }


            /* HTTP ERROR */

            if (!response.ok) {

                const message =
                    data?.error ||
                    data?.message ||
                    `Server error (${response.status})`;

                throw new Error(message);

            }


            /* BACKEND ERROR */

            if (
                data &&
                data.success === false
            ) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Analysis failed."
                );

            }


            /* RENDER */

            renderAnalysisResult(data);


            showToast(
                "Code analysis completed!"
            );

        }


        catch (error) {

            console.error(
                "Code Analyzer Error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong while analyzing the code."
            );

        }


        finally {

            setAnalyzeLoading(false);

        }

    }


    /* =====================================================
       LOADING STATE
       ===================================================== */

    function setAnalyzeLoading(loading) {

        if (!els.analyzeBtn) {
            return;
        }


        els.analyzeBtn.disabled =
            loading;


        if (loading) {

            els.analyzeBtn.innerHTML =
                "⏳ Analyzing...";

        } else {

            els.analyzeBtn.innerHTML =
                "⚡ Analyze Code";

        }

    }


    /* =====================================================
       ERROR DISPLAY
       ===================================================== */

    function showError(message) {

        if (els.analysisEmpty) {

            els.analysisEmpty.style.display =
                "none";

        }


        if (els.analysisResult) {

            els.analysisResult.style.display =
                "block";

        }


        if (els.bugs) {

            els.bugs.style.display =
                "block";


            els.bugs.innerHTML = `

                <article
                    class="result-card"
                    style="border-color:rgba(255,80,80,.35);"
                >

                    <h4>
                        ❌ Analysis Error
                    </h4>

                    <p>
                        ${escapeHTML(message)}
                    </p>

                    <p style="margin-top:10px;">

                        Check that Flask is running
                        and the <strong>/analyze</strong>
                        endpoint is working.

                    </p>

                </article>

            `;

        }


        [
            els.security,
            els.performance,
            els.quality,
            els.suggestions,
            els.improvedCode
        ].forEach(function (element) {

            if (element) {
                element.style.display =
                    "none";
            }

        });


        activateTab("bugs");

        showToast(
            message
        );

    }
    /* this is normal commit */

    function clearCode() {

        if (els.codeInput) {

            els.codeInput.value = "";

            els.codeInput.focus();

        }


        updateStats();


        resetResults();


        showToast(
            "Code cleared"
        );

    }


    /* =====================================================
       RESET RESULTS
       ===================================================== */

    function resetResults() {

        lastAnalysis = null;


        updateScore(0);


        if (els.grade) {

            els.grade.textContent =
                "Ready to Analyze";

        }


        if (els.summary) {

            els.summary.textContent =
                "Paste your code and click Analyze Code.";

        }


        [
            els.bugCount,
            els.securityCount,
            els.performanceCount,
            els.qualityCount,
            els.suggestionCount,
            els.bugTabCount,
            els.securityTabCount,
            els.performanceTabCount,
            els.qualityTabCount,
            els.suggestionTabCount

        ].forEach(function (element) {

            setText(element, 0);

        });


        if (els.analysisEmpty) {

            els.analysisEmpty.style.display =
                "flex";

        }


        if (els.analysisResult) {

            els.analysisResult.style.display =
                "none";

        }


        activateTab("bugs");

    }


    /* =====================================================
       LOAD EXAMPLE
       ===================================================== */

    function loadExample() {

        const language =
            els.languageSelect
                ? els.languageSelect.value
                : "Python";


        const code =
            exampleCode[language];


        if (!code) {

            showToast(
                `No example available for ${language}`
            );

            return;

        }


        if (els.codeInput) {

            els.codeInput.value =
                code;

        }


        updateStats();


        resetResults();


        showToast(
            `${language} example loaded`
        );


        if (els.codeInput) {
            els.codeInput.focus();
        }

    }


    /* =====================================================
       COPY TEXT
       ===================================================== */

    async function copyText(
        text,
        message
    ) {

        try {

            await navigator.clipboard.writeText(
                text
            );

            showToast(
                message ||
                "Copied!"
            );

        }

        catch (error) {

            console.error(
                "Copy failed:",
                error
            );

            showToast(
                "Copy failed"
            );

        }

    }


    /* =====================================================
       KEYBOARD SHORTCUT
       ===================================================== */

    function setupKeyboardShortcuts() {

        document.addEventListener(
            "keydown",
            function (event) {

                /*
                 * Ctrl + Enter
                 * Analyze Code
                 */

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    analyzeCode();

                }


                /*
                 * Ctrl + L
                 * Clear Code
                 */

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() === "l"
                ) {

                    event.preventDefault();

                    clearCode();

                }

            }
        );

    }


    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    function setupEvents() {


        /* CODE INPUT */

        if (els.codeInput) {

            els.codeInput.addEventListener(
                "input",
                updateStats
            );


            els.codeInput.addEventListener(
                "scroll",
                syncLineScroll
            );

        }


        /* CLEAR */

        if (els.clearBtn) {

            els.clearBtn.addEventListener(
                "click",
                clearCode
            );

        }


        /* EXAMPLE */

        if (els.exampleBtn) {

            els.exampleBtn.addEventListener(
                "click",
                loadExample
            );

        }


        /* ANALYZE */

        if (els.analyzeBtn) {

            els.analyzeBtn.addEventListener(
                "click",
                analyzeCode
            );

        }


        /* LANGUAGE CHANGE */

        if (els.languageSelect) {

            els.languageSelect.addEventListener(
                "change",
                function () {

                    resetResults();

                }
            );

        }


        /* TABS */

        setupTabs();


        /* SHORTCUTS */

        setupKeyboardShortcuts();

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init() {

        updateStats();

        resetResults();

        setupEvents();

        console.log(
            "CodeAnalyzer AI JavaScript loaded successfully."
        );

    }


    /* =====================================================
       START APP
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


})();

