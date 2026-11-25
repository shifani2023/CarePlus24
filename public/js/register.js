const registerForm = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    message.textContent = "";
    message.className = "";

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check whether passwords match
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.className = "error-message";
        return;
    }

    // Collect registration information
    const formData = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        dateOfBirth: document.getElementById("dateOfBirth").value || null,
        gender: document.getElementById("gender").value || null,
        address: document.getElementById("address").value.trim(),
        password: password
    };

    try {

        registerButton.disabled = true;
        registerButton.textContent = "Creating Account...";

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {

            message.textContent = result.message;
            message.className = "success-message";

            registerForm.reset();

        } else {

            message.textContent = result.message;
            message.className = "error-message";

        }

    } catch (error) {

        message.textContent = "Unable to connect to the server.";
        message.className = "error-message";

        console.error(error);

    } finally {

        registerButton.disabled = false;
        registerButton.textContent = "Create Account";

    }

});