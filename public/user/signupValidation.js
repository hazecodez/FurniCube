document.getElementById("signupForm").addEventListener("submit", function (event) {
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Check if the email is empty
    if (emailInput.value.trim() === "") {
        emailError.textContent = "Email is required.";
        event.preventDefault();
    } else if (!emailPattern.test(emailInput.value)) {
        // Check if the email follows a valid pattern
        emailError.textContent = "Invalid email format.";
        event.preventDefault();
    } else {
        emailError.textContent = "";
    }
});
