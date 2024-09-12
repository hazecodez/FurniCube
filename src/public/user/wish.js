function addWishlist(productId) {
    $.ajax({
      url: "/addToWishlist",
      method: "post",
      data: {
        id: productId,
      },
      success: (response) => {
        if (response.login == true) {
          swal
            .fire({
              icon: "warning",
              title: "Please Login",
              confirmButtonText: "Login",
              showCancelButton: true,
              cancelButtonColor: "#d33",
              text: response.message,
            })
            .then((result) => {
              if (result.isConfirmed) {
                window.location.href = "/loadLogin";
              }
            });
        } else if (response.exist == true) {
          swal.fire({
            position: "center",
            icon: "warning",
            title: "This product already in your wishlist",
            showConfirmButton: false,
            timer: 1500,
          });
        } else if (response.success) {
          swal.fire({
            position: "center",
            icon: "success",
            title: "Product added to your Wishlist",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
    });
  }