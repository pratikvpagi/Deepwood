document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("applicationForm");
    const responseMessage = document.getElementById("responseMessage");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        responseMessage.innerHTML = "";
        responseMessage.className = "response-message";

        const resumeInput = document.getElementById("resume");

        if (!resumeInput.files.length) {
            showError("Please upload your resume.");
            return;
        }

        const file = resumeInput.files[0];

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
        ];

        if (!allowedTypes.includes(file.type)) {
            showError("Only PDF or DOCX files are allowed.");
            return;
        }

        const formData = new FormData(form);

        const submitBtn = form.querySelector("button");

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {

            const response = await fetch("/api/apply", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {

                showSuccess(data.message);

                form.reset();

            } else {

                showError(data.message || "Submission failed.");

            }

        } catch (error) {

            console.error(error);

            showError("Server error. Please try again.");

        } finally {

            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Application";

        }

    });

    function showSuccess(message) {

        responseMessage.classList.add("success");

        responseMessage.innerHTML = `
            <div>
                ✅ ${message}
            </div>
        `;
    }

    function showError(message) {

        responseMessage.classList.add("error");

        responseMessage.innerHTML = `
            <div>
                ❌ ${message}
            </div>
        `;
    }

});