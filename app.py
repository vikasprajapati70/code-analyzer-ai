import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from groq import Groq

load_dotenv()

app = Flask(__name__)

MAX_CODE_LENGTH = 50_000

SYSTEM_PROMPT = """
You are a senior software engineer, code reviewer and application
security expert.

Analyze the supplied source code for:

1. Bugs and logic errors
2. Security vulnerabilities
3. Performance problems
4. Code-quality problems
5. Best-practice suggestions
6. An improved version of the code

Return only valid JSON with exactly this structure:

{
  "score": 75,
  "bugs": [
    {
      "line": 10,
      "severity": "error",
      "message": "Description of the bug",
      "fix": "How to fix it"
    }
  ],
  "security": [
    {
      "line": 5,
      "severity": "warning",
      "message": "Description of the security issue",
      "fix": "How to fix it"
    }
  ],
  "performance": [],
  "quality": [],
  "suggestions": [
    "Suggestion number one"
  ],
  "improved_code": "Complete improved source code"
}

Important rules:

- score must be an integer between 0 and 100.
- severity must be one of: error, warning, info.
- line is optional if an exact line is not available.
- bugs, security, performance and quality must always be arrays.
- suggestions must always be an array of strings.
- improved_code must contain complete corrected code.
- Return empty arrays when no issues are found.
- Do not return Markdown code fences.
- Do not write any text before or after the JSON.
""".strip()


@app.get("/")
def home():
    """Render the main Code Analyzer page."""
    return render_template("index.html")


@app.post("/api/analyze")
def analyze_code():
    """Receive code from the frontend and analyze it with Groq."""
    data = request.get_json(silent=True) or {}

    code = data.get("code", "")
    language = data.get("language", "")

    if not isinstance(code, str) or not code.strip():
        return jsonify({
            "error": "Code is required."
        }), 400

    if not isinstance(language, str) or not language.strip():
        return jsonify({
            "error": "Programming language is required."
        }), 400

    if len(code) > MAX_CODE_LENGTH:
        return jsonify({
            "error": "Code cannot exceed 50,000 characters."
        }), 413

    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        return jsonify({
            "error": (
                "GROQ_API_KEY was not found. "
                "Please add it to your .env file."
            )
        }), 503

    try:
        client = Groq(api_key=groq_api_key)

        response = client.chat.completions.create(
            model=os.getenv(
                "GROQ_MODEL",
                "openai/gpt-oss-120b"
            ),
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": (
                        f"Programming language: {language}\n\n"
                        f"Analyze the following source code:\n\n"
                        f"{code}"
                    )
                }
            ],
            temperature=0.1,
            max_tokens=8192,
            response_format={
                "type": "json_object"
            }
        )

        content = response.choices[0].message.content

        if not content:
            raise ValueError("Groq returned an empty response.")

        cleaned_content = remove_markdown_fences(content)
        analysis_result = json.loads(cleaned_content)
        normalized_result = normalize_result(analysis_result)

        return jsonify(normalized_result), 200

    except json.JSONDecodeError:
        app.logger.exception("Groq returned invalid JSON")

        return jsonify({
            "error": (
                "Groq returned an invalid JSON response. "
                "Please try again."
            )
        }), 502

    except Exception as error:
        app.logger.exception("Groq code analysis failed")

        if app.debug:
            return jsonify({
                "error": f"Groq analysis failed: {str(error)}"
            }), 500

        return jsonify({
            "error": (
                "Code analysis failed. "
                "Please check your Groq API key and try again."
            )
        }), 500


def remove_markdown_fences(content: str) -> str:
    """Remove accidental JSON Markdown fences from the AI response."""
    content = content.strip()

    return re.sub(
        r"^```(?:json)?\s*|\s*```$",
        "",
        content,
        flags=re.IGNORECASE
    )


def normalize_result(result: dict[str, Any]) -> dict[str, Any]:
    """Validate and normalize the result used by frontend JavaScript."""
    if not isinstance(result, dict):
        raise ValueError("Analysis result must be a JSON object.")

    try:
        score = int(result.get("score", 0))
    except (TypeError, ValueError):
        score = 0

    score = max(0, min(100, score))

    suggestions = result.get("suggestions", [])

    if not isinstance(suggestions, list):
        suggestions = []

    improved_code = result.get("improved_code", "")

    if not isinstance(improved_code, str):
        improved_code = str(improved_code)

    return {
        "score": score,
        "bugs": normalize_issues(result.get("bugs", [])),
        "security": normalize_issues(
            result.get("security", [])
        ),
        "performance": normalize_issues(
            result.get("performance", [])
        ),
        "quality": normalize_issues(
            result.get("quality", [])
        ),
        "suggestions": [
            str(suggestion).strip()
            for suggestion in suggestions
            if str(suggestion).strip()
        ],
        "improved_code": improved_code
    }


def normalize_issues(issues: Any) -> list[dict[str, Any]]:
    """Normalize bugs, security, performance and quality issues."""
    if not isinstance(issues, list):
        return []

    normalized_issues = []

    for issue in issues:
        if not isinstance(issue, dict):
            continue

        severity = str(
            issue.get("severity", "info")
        ).lower()

        if severity not in {"error", "warning", "info"}:
            severity = "info"

        normalized_issue = {
            "severity": severity,
            "message": str(
                issue.get("message", "Issue found.")
            ),
            "fix": str(issue.get("fix", ""))
        }

        line = issue.get("line")

        if line is not None:
            try:
                normalized_issue["line"] = max(
                    1,
                    int(line)
                )
            except (TypeError, ValueError):
                pass

        normalized_issues.append(normalized_issue)

    return normalized_issues


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "1") == "1"
    )