function addToCart(prodId) {
   $.ajax({
      url: "/add-to-cart/" + prodId,
      method: "get",
      success: (response) => {
         console.log(response)
         if (response.status) {
            swal("This item successfully added to your cart", "", "success");
            if(response.incNumber){
               console.log('hello')
               let count = $("#cart-count").html();
               count = parseInt(count) + 1;
              console.log(count)
               $("#cart-count").html(count);
            }
            
         } else {
            swal("Sorry, this item is currently out of stock", "", "info");
         }
      },
   });
}

function addwishlist(prodId) {
   console.log(prodId);
   $.ajax({
      url: "/addToWishlist/" + prodId,
      method: "get",
      success: (response) => {
         if (response.status) {
         } else {
            swal(response.message,"", "info");
         }
      },
   });
}

function deletefromwishlist(prodId) {
   console.log(prodId);
   $.ajax({
      url: "/deleteFromWishlist",
      type: "DELETE",
      data: { prodId: prodId },
      success: (response) => {
         if (response) {
            document.getElementById(prodId).style.display = "none";
         }
      },
   });
}

function changeQuantity(cart, product, count, maxQnty) {
   console.log(maxQnty);
   var quantity = parseInt(document.getElementById(`${product}quantity`).textContent);
   if ((quantity == 1 && count == -1) || quantity >= parseInt(maxQnty)) {
   } else {
      var Add;
      if (parseInt(count) < 0) {
         Add = false;
      } else {
         Add = true;
      }
      $.ajax({
         url: "/change-product-quantity",
         data: {
            cart: cart,
            product: product,
            count: count,
            quantity: quantity,
         },
         method: "post",
         success: (response) => {
            let count = $(`#${product}quantity`).html();
            if (Add) {
               count = parseInt(count) + 1;
               $(`#${product}quantity`).html(count);
            } else {
               let count = $(`#${product}quantity`).html();
               count = parseInt(count) - 1;
               $(`#${product}quantity`).html(count);
            }
            var quantity = parseInt(document.getElementById(`${product}quantity`).textContent);
            var price = parseInt(document.getElementById(`${product}p`).textContent);
            var offer = parseInt(document.getElementById(`${product}offer`).textContent);
            document.getElementById(`${product}tpp`).innerHTML = (price - price * (offer / 100)) * quantity;
            document.getElementById("grandtotal").innerHTML = response.grandtotal;
            document.getElementById('grandtotalUnder').innerHTML = response.grandtotal
         },
      });
   }
}

function deleteProduct(product) {
   swal({
      title: "Are you sure?",
      text: "Once deleted, the action is irreversible!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         document.getElementById(product).style.display = "none";
         $.ajax({
            url: "/delete-from-cart",
            data: {
               product: product,
            },
            method: "delete",
            success: (response) => {
               document.getElementById("grandtotal").innerHTML = response.grandTotal;
               if (response.grandTotal != 0) {
                 
                  document.getElementById("proceedtocheckout").style.display = "block";
                  let count = $("#cart-count").html();
                  count = parseInt(count) - 1;
                  $("#cart-count").html(count);
               } else {
                  document.getElementById("proceedtocheckout").style.display = "none";
                  let count = $("#cart-count").html();
                  count = parseInt(count) - 1;
                  $("#cart-count").html(count);
                  
               }
            },
         });
        
      } else {
         swal("Your product is safe!");
      }
   });

   
}

function getAddress(addressId) {
   console.log(addressId);
   $.ajax({
      url: "/get-address/" + addressId,
      type: "post",
      success: (response) => {
         $("#addressid").val(response._id);
         $("#firstName").val(response.firstName);
         $("#lastName").val(response.lastName);
         $("#companyName").val(response.companyName);
         $("#country").val(response.country);
         $("#housenumberORStreetname").val(response.housenumberorstreetname);
         $("#appartment").val(response.appartment);
         $("#townorcity").val(response.townorcity);
         $("#stateorcounty").val(response.stateorcounty);
         $("#postal").val(response.postcode);
         $("#phone").val(response.phone);
         $("#email").val(response.email);
         $("#editModal").modal("show");
      },
   });
}

function deleteAddress(addressId) {
   swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this imaginary file!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         $.ajax({
            url: "/delete-address",
            type: "delete",
            data: {
               addressId: addressId,
            },
            success: (response) => {
               location.reload();
            },
         });
         swal("Poof! Your address  has been deleted!", {
            icon: "success",
         });
      } else {
         swal("Your address is safe!");
      }
   });
   console.log(addressId);
}

function orderDetails(orderId) {
   console.log(orderId);
   $.ajax({
      url: "/get-one-order-detail/" + orderId,
      method: "get",
      success: (response) => {
         if (response) {
            location.href = "/getorderdetails";
         }
      },
   });
}

function adminOrderDetails(orderId) {
   $.ajax({
      url: "/admin/getOneOrder/" + orderId,
      type: "POST",
      success: (response) => {
         if (response.status) {
            location.href = "/admin/order-details";
         }
      },
   });
}

function cancelOrder(product, order, quantity, offerprice ,userId) {
   $.ajax({
      url: "/cancel-order",
      type: "POST",
      data: {
         prodId: product,
         orderId: order,
         quantity:quantity,
         price:offerprice,
         userId:userId
      },
      success: (response) => {
         if (response.status) {
            document.getElementById(product).innerHTML = "Canceled";
         }
      },
   });
}

function returnOrder(prodId, orderId) {
   $.ajax({
      url: "/returnOrder",
      type: "post",
      data: {
         prodId,
         orderId,
      },
      success: (response) => {
         $("#retunOrder" + response).val("Return requested");
      },
   });
}

function changePassword() {
   //newPass = $('#newPassword').val()
   newPass = document.getElementById("newPassword").value;
   //renewPass = $('#renewPassword').val()
   renewPass = document.getElementById("renewPassword").value;
   //oldPass = $('#currentPassword').val()
   oldPass = document.getElementById("currentPassword").value;

   $.ajax({
      url: "/changepassword",
      type: "post",
      data: {
         oldPass: oldPass,
         newPass: newPass,
      },
      success: (response) => {
         console.log("hello");
         alert(response);
      },
      error: () => {
         alert("err");
      },
   });
}

function confirmDelete(proId){
   swal({
      title: "Are you sure?",
      text: "Once deleted, the action is irreversible!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         location.href = href="/admin/delete-product/"+proId
      } else {
         
      }
   });        
}

function search(event) {
   let searcresult = document.getElementById('searchResults')
   if(event.target.value == null || event.target.value == "" || event.target.value == " " ){
       searcresult.innerHTML = "Sorry no items found"
   }else{
       $.ajax({
       url:'/searchproducts',
       type:'post',
       data:{
           searchkey:event.target.value
       },
       success:(response)=>{
           let products = response
           console.log(products    )
           searcresult.innerHTML = ''
           if(products.length < 1){
               searcresult.innerHTML = "<p>Sorry no items found</p>"
               return
           }
           products.forEach((each,index)=>{
               if(index > 0){
                   searcresult.innerHTML += '<hr>'
               }
               
               searcresult.innerHTML += `<a href="/product-details/${each._id}"><span style="display:flex;align-items:center;justify-content:flex-start"><img style="display:flex; width:50px" src="/productImages/${each.img[0]}" alt=""><p style="margin-left:5px">${each.Book}</p></span></a>`
              
           })
           return
       }
   })
   }
   
}

