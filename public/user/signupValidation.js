//=============SIGNUP VALIDATION=================

document.getElementById('regSubmit').addEventListener('click', function(e){
    e.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const number = document.getElementById('Number').value;
    const con_password = document.getElementById('con_password').value;
    const message = document.getElementById('error-message')

    $.ajax({
        url: "/register",
        data: {
          email: email,
          name: name,
          number: number,
          con_password: con_password,
          password: password
        },
        method: "post",
        success: (response) => {
          if (response.require) {
            message.style.display = "block";
            message.textContent = "Must fillout all the fields."
          }else if(response.emailPatt){
            message.style.display = "block";
            message.textContent = "Enter the valid email address."
          }else if(response.mobile){
            message.style.display = "block";
            message.textContent = "Enter valid mobile number."
          }else if(response.password){
            message.style.display = "block";
            message.textContent = "Uh-oh! Password must contain 4 digits."
          }else if(response.emailalready){
            message.style.display = "block";
            message.textContent = "Uh-oh! You already have an account please Log In."
          }else if(response.wrongpass){
            message.style.display = "block";
            message.textContent = "Uh-oh! Confirm the correct password."
          }else if(response.notsaved){
            message.style.display = "block";
            message.textContent = "Uh-oh! Got some issues please try again."
          }else if(response.name){
            message.style.display = "block";
            message.textContent = "Uh-oh! Fullname atleast contain 3 letters."
          }else{
            window.location.href = "/otpPage"
          }
        },
      });
})