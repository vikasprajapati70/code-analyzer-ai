import os
import json

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)


# =========================================================
# SUPPORTED LANGUAGES
# =========================================================

SUPPORTED_LANGUAGES = [
    "C",
    "C++",
    "Python",
    "Java",
    "JavaScript",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Dart",
    "Kotlin",
    "SQL",
    "HTML/CSS"
]


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# LLM ANALYSIS FUNCTION
# =========================================================

def analyze_code_with_llm(code, language):

    """
    This function sends the code to your LLM API.

    IMPORTANT:
    Replace the API section below with the API provider
    you are using.

    The function must return a Python dictionary.
    """

    api_key = os.getenv("API_KEY")

    if not api_key:
        raise Exception(
            "LLM_API_KEY is not configured. "
            "Please add your API key to the .env file."
        )


    # -----------------------------------------------------
    # IMPORTANT
    # -----------------------------------------------------
    #
    # Put your LLM API call here.
    #
    # The prompt below defines the JSON format expected
    # by the frontend JavaScript.
    # -----------------------------------------------------

    prompt = f"""
You are an expert software code reviewer.

Analyze the following {language} code.

CODE:
----------------
{code}
----------------

Return ONLY valid JSON.

Use exactly this structure:

{{
    "score": 0,
    "summary": "Short overall analysis",

    "bugs": [
        {{
            "title": "Bug title",
            "description": "Detailed explanation",
            "line": "Line number if available",
            "severity": "HIGH/MEDIUM/LOW",
            "fix": "How to fix it"
        }}
    ],

    "security": [
        {{
            "title": "Security issue",
            "description": "Detailed explanation",
            "line": "Line number if available",
            "severity": "HIGH/MEDIUM/LOW",
            "fix": "How to fix it"
        }}
    ],

    "performance": [
        {{
            "title": "Performance issue",
            "description": "Detailed explanation",
            "line": "Line number if available",
            "severity": "HIGH/MEDIUM/LOW",
            "fix": "How to improve it"
        }}
    ],

    "quality": [
        {{
            "title": "Code quality issue",
            "description": "Detailed explanation",
            "line": "Line number if available",
            "severity": "HIGH/MEDIUM/LOW",
            "fix": "How to improve it"
        }}
    ],

    "suggestions": [
        {{
            "title": "Suggestion",
            "description": "Useful improvement"
        }}
    ],

    "improvedCode": "Return the improved version of the code"
}}

Rules:

1. score must be between 0 and 100.
2. Do not invent issues that are not present.
3. If a category has no issues, return [].
4. Keep the summary short.
5. Return valid JSON only.
"""


    # =====================================================
    # LLM API CALL
    # =====================================================
    #
    # Example placeholder:
    #
    # response = requests.post(...)
    #
    # You need to put your selected LLM provider's
    # endpoint and request format here.
    #
    # =====================================================


    # -----------------------------------------------------
    # TEMPORARY DEMO RESPONSE
    # -----------------------------------------------------
    #
    # REMOVE this section after connecting your real API.
    #
    # It allows you to test whether the frontend and
    # Flask backend are working correctly.
    # -----------------------------------------------------

    return {
        "score": 72,

        "summary": (
            "The code works but contains some "
            "security, performance, or quality issues."
        ),

        "bugs": [
            {
                "title": "Potential runtime issue",
                "description": (
                    "The code should validate input and "
                    "handle possible runtime errors."
                ),
                "line": "Detected during analysis",
                "severity": "MEDIUM",
                "fix": "Add proper input validation and error handling."
            }
        ],

        "security": [
            {
                "title": "Sensitive data handling",
                "description": (
                    "Avoid storing passwords or other sensitive "
                    "information directly in source code."
                ),
                "line": "Detected during analysis",
                "severity": "HIGH",
                "fix": (
                    "Use environment variables or a secure "
                    "secret-management system."
                )
            }
        ],

        "performance": [
            {
                "title": "Possible unnecessary computation",
                "description": (
                    "Review repeated operations and loops "
                    "for unnecessary work."
                ),
                "line": "Detected during analysis",
                "severity": "LOW",
                "fix": "Optimize repeated operations where possible."
            }
        ],

        "quality": [
            {
                "title": "Code maintainability",
                "description": (
                    "The code can be made easier to maintain "
                    "by improving structure and naming."
                ),
                "line": "Detected during analysis",
                "severity": "LOW",
                "fix": "Use clear names and separate responsibilities."
            }
        ],

        "suggestions": [
            {
                "title": "Improve error handling",
                "description": (
                    "Add appropriate error handling for "
                    "unexpected input and runtime failures."
                )
            },
            {
                "title": "Use secure configuration",
                "description": (
                    "Keep API keys and passwords outside "
                    "the source code."
                )
            }
        ],

        "improvedCode": code
    }


# =========================================================
# ANALYZE API ROUTE
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        # -------------------------------------------------
        # CHECK JSON REQUEST
        # -------------------------------------------------

        data = request.get_json(silent=True)


        if not data:

            return jsonify({
                "success": False,
                "error": "Request body must contain valid JSON."
            }), 400


        # -------------------------------------------------
        # GET CODE
        # -------------------------------------------------

        code = data.get("code", "")

        language = data.get(
            "language",
            "Python"
        )


        # -------------------------------------------------
        # VALIDATE CODE
        # -------------------------------------------------

        if not isinstance(code, str):

            return jsonify({
                "success": False,
                "error": "Code must be a string."
            }), 400


        code = code.strip()


        if not code:

            return jsonify({
                "success": False,
                "error": "Please enter some code."
            }), 400


        # -------------------------------------------------
        # VALIDATE LANGUAGE
        # -------------------------------------------------

        if language not in SUPPORTED_LANGUAGES:

            return jsonify({
                "success": False,
                "error": (
                    f"Unsupported language: {language}. "
                    f"Supported languages are: "
                    f"{', '.join(SUPPORTED_LANGUAGES)}"
                )
            }), 400


        # -------------------------------------------------
        # ANALYZE CODE
        # -------------------------------------------------

        result = analyze_code_with_llm(
            code,
            language
        )


        # -------------------------------------------------
        # RETURN RESULT
        # -------------------------------------------------

        return jsonify({

            "success": True,

            "language": language,

            "analysis": result

        })


    except Exception as error:

        print(
            "ANALYZE ERROR:",
            str(error)
        )


        return jsonify({

            "success": False,

            "error": str(error)

        }), 500


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({

        "status": "ok",

        "service": "Code Analyzer AI",

        "supported_languages":
            SUPPORTED_LANGUAGES

    })


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):

    return jsonify({

        "success": False,

        "error": "Endpoint not found."

    }), 404


@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({

        "success": False,

        "error": "Internal server error."

    }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True
    )
