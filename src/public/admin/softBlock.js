function blockBanner(id) {
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      background: "#191c24",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes !",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/admin/block-banner",
          data: {
            id: id,
          },
          method: "get",
          success: (response) => {
            if ((response.success)) {
              $("#banners").load("/admin/bannerDetails #banners");
            }
          },
        });
      }
    });
  }

  //================coupon block=======================

  function blockCoupon(id) {
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      background: "#191c24",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes !",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/admin/block-coupons",
          data: {
            id: id,
          },
          method: "get",
          success: (response) => {
            if ((response.success)) {
              $("#coupons").load("/admin/showCoupon #coupons");
            }
          },
        });
      }
    });
  }

  //=============product block==================

  function blockProduct(id) {
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      background: "#191c24",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes !",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/admin/block-pro",
          data: {
            id: id,
          },
          method: "get",
          success: (response) => {
            if ((response.success)) {
              $("#products").load("/admin/product #products");
            }
          },
        });
      }
    });
  }

  //=================user block============================

  function userBlock(id) {
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      background: "#191c24",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes !",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/admin/block-user",
          data: {
            id: id,
          },
          method: "get",
          success: (response) => {
            if ((response.success)) {
              $("#users").load("/admin/userDetails #users");
            }
          },
        });
      }
    });
  }

  //============category block=====================

  function categoryBlock(id) {
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      background: "#191c24",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes !",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/admin/block-cat",
          data: {
            id: id,
          },
          method: "get",
          success: (response) => {
            if ((response.success)) {
              $("#category").load("/admin/category #category");
            }
          },
        });
      }
    });
  }


  //===================admin logout====================

  function adminlogout() {
    
    Swal.fire({
      title: "Are you sure?",
      text: "See you next time.",
      background: "#191c24",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Logout !",
      cancelButtonText: "Not now.",
    }).then((result)=> {
      if(result.isConfirmed){
          window.location.href = "/admin/logout"
      }
  })
  }
