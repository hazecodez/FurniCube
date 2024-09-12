//=============LOGIN VALIDATION==================
document.getElementById('submitBtn').addEventListener('click', function(event){
    event.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('myAlert1')

    $.ajax({
        url: "/login",
        data: {
          email: email,
          password: password
        },
        method: "post",
        success: (response) => {
          if ((response.register)) {
            message.style.display = "block";
            message.textContent = "Uh-oh! This account is not registered yet please register."
          }else if(response.wrong){
            message.style.display = "block";
            message.textContent = "Uh-oh! Wrong password."
          }else if(response.blocked){
            message.style.display = "block";
            message.textContent = "Uh-oh! You can't access this account."
          }else if(response.success){
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
            })
            
            Toast.fire({
              icon: 'success',
              title: 'Welcome to FurniCube.'
            })
            setTimeout(() => {
              window.location.href = "/home"
            }, 2000);
           
          }else if(response.verify){
            window.location.href = "/otpPage"
          }
        },
      });
})

