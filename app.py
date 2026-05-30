from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

# ==========================================
# CONFIGURATION
# ==========================================

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

APPLICATIONS_FILE = "applications.json"

# ==========================================
# PAGE ROUTES
# ==========================================

@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/careers")
def careers():
    return render_template("careers.html")


# ==========================================
# ESG DATA API
# ==========================================

@app.route("/api/esg")
def get_esg_data():

    try:

        with open(
            "static/data/esg_data.json",
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# APPLICATION SUBMISSION
# ==========================================

@app.route("/api/apply", methods=["POST"])
def apply():

    try:

        # ---------------------------
        # GET FORM DATA
        # ---------------------------

        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        role = request.form.get("role")
        linkedin = request.form.get("linkedin")
        message = request.form.get("message")

        resume = request.files.get("resume")

        # ---------------------------
        # REQUIRED FIELD CHECK
        # ---------------------------

        if not all([
            name,
            email,
            phone,
            role,
            message,
            resume
        ]):

            return jsonify({
                "success": False,
                "message": "Please fill all required fields."
            }), 400

        # ---------------------------
        # FILE TYPE VALIDATION
        # ---------------------------

        allowed_extensions = [
            ".pdf",
            ".docx"
        ]

        extension = os.path.splitext(
            resume.filename
        )[1].lower()

        if extension not in allowed_extensions:

            return jsonify({
                "success": False,
                "message": "Only PDF and DOCX files are allowed."
            }), 400

        # ---------------------------
        # SAVE RESUME
        # ---------------------------

        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        filename = (
            f"{timestamp}_{resume.filename}"
        )

        filepath = os.path.join(
            UPLOAD_FOLDER,
            filename
        )

        resume.save(filepath)

        # ---------------------------
        # APPLICATION OBJECT
        # ---------------------------

        application = {
            "name": name,
            "email": email,
            "phone": phone,
            "role": role,
            "linkedin": linkedin,
            "message": message,
            "resume_file": filepath,
            "submitted_at": datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        }

        # ---------------------------
        # LOAD OLD APPLICATIONS
        # ---------------------------

        if os.path.exists(
            APPLICATIONS_FILE
        ):

            with open(
                APPLICATIONS_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                applications = json.load(
                    file
                )

        else:

            applications = []

        # ---------------------------
        # APPEND NEW APPLICATION
        # ---------------------------

        applications.append(
            application
        )

        # ---------------------------
        # SAVE APPLICATIONS
        # ---------------------------

        with open(
            APPLICATIONS_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                applications,
                file,
                indent=4
            )

        # ---------------------------
        # LOG TO TERMINAL
        # ---------------------------

        print("\n")
        print("=" * 50)
        print("NEW APPLICATION RECEIVED")
        print("=" * 50)
        print(application)
        print("=" * 50)

        return jsonify({
            "success": True,
            "message": "Application submitted successfully!"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/api/health")
def health():

    return jsonify({
        "status": "running"
    })


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )