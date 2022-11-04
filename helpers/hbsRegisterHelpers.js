var hbs = require("hbs");

module.exports = {
   inc: () =>
        hbs.registerHelper("inc", (value) => {
            return parseInt(value) + 1;
        }
    ),
    isZero:(value)=>{
        hbs.registerHelper('isZero', function (value) {
            return value === 0 ? true : false
        });
    },
    isShipped:(value)=>{
        hbs.registerHelper('isShipped', function(value){
            return value === 'Delivered' ? true : false
        })
    },
    isReturnReq:(value)=>{
        hbs.registerHelper('isReturnReq',function(value){
            return value === 'Return-requested' || value === 'Return-Approved' ? true : false
        })
    },
    checkButton:(value)=>{
        hbs.registerHelper('checkButton',function (value){
            return value === 'Return-Approved' ? false : true
        })
    },
    checkStock:(value)=>{
        hbs.registerHelper('checkStock',function (value){
            return parseInt(value)>0 ? true : false
        })
    },
    checkNull:(value)=>{
        hbs.registerHelper('checkNull',function (value){
            return value == null ? true : false
        })
    },
    deliveryOver:(value)=>{
        hbs.registerHelper('deliveryOver',function (value){
            return value == "Delivered" ?true : false
        })
    },
    afterReturnAccepted:(value)=>{
        hbs.registerHelper('afterReturnAccepted',function (value){
            console.log(value);
            return value == 'Return-Approved' ? false : true
        })
    },
    topsellingrevenue:(price,count)=>{
        hbs.registerHelper('topsellingrevenue',function(price, count){
            return parseInt(price) * parseInt(count)
        })
    },
    isStatusPending:(value)=>{
        hbs.registerHelper('isStatusPending',function(status){
            if (status == 'Pending') {
              return true
            } else {
              return false
            }
        })
    },
    isInitiated:(value)=>{
        hbs.registerHelper('isInitiated',function (value){
            return value == 'Initiated' || value == 'Return-requested' ? true : false
        })
    },
    isReturnApproved:(value)=>{
        hbs.registerHelper('isReturnApproved',function (value){
            return value == 'Shipped' || value == 'Return-Approved' ? true : false
        })
    },
    isCancelled:(value)=>{
        hbs.registerHelper('isCancelled',function (value){
            return value == 'Cancelled' || value == 'Return-requested' || value == 'Return-Approved' ? true : false
        })
    }
};
