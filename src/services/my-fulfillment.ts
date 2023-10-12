import { Cart } from "@medusajs/medusa";
import { FulfillmentService } from "medusa-interfaces"

class MyFulfillmentService extends FulfillmentService {
    static identifier = "my-fulfillment"
    constructor() {
        super()
      }
    // ...
    async getFulfillmentOptions() {
        return [
            {
                id: "my-fulfillment",
            },
            {
              id: "my-fulfillment-return",
              is_return: true,
            },
        ]
    }

    canCalculate() {
      return true;
    }

    
    validateOption(data) {
        return true
      }
    
     
    
      createOrder() {
        // No data is being sent anywhere
        return Promise.resolve({})
      }
    
      createReturn() {
        // No data is being sent anywhere
        return Promise.resolve({})
      }
    
      createFulfillment() {
        // No data is being sent anywhere
        return Promise.resolve({})
      }
    
      cancelFulfillment() {
        return Promise.resolve({})
      }

    calculatePrice(optionData, data, cart: Cart) {
      console.log('calculatePrice');
      console.log(data);
      console.log(cart.region);


      let totals = cart.items.reduce((total, item) => total += item.total, 0);
      let correctTotal = totals / 100;
        if (cart.region.currency_code == 'gbp') {
            if (correctTotal < 1000) {
                return Math.round(totals / 10);
            } else if (correctTotal < 1499) {
                return Math.round(totals * 0.07);
            } else if (correctTotal < 2000) {
                return Math.round(totals * 0.05);
            } else if (correctTotal < 3000) {
                return Math.round(totals * 0.05);
            } else {
                return Math.round(totals * 0.04);
            }
        }

        if (cart.region.currency_code == 'eur') {
            if (correctTotal < 1150) {
                return Math.round(totals / 10);
            } else if (correctTotal < 1723) {
                return Math.round(totals * 0.07);
            } else if (correctTotal < 2300) {
                return Math.round(totals * 0.05);
            } else if (correctTotal < 3450) {
                return Math.round(totals * 0.05);
            } else {
                return Math.round(totals * 0.04);
            }
        }

        if (cart.region.currency_code == 'nok' || cart.region.currency_code == 'sek') {
            if (correctTotal < 13000) {
                return Math.round(totals / 10);
            } else if (correctTotal < 20000) {
                return Math.round(totals * 0.07);
            } else if (correctTotal < 26000) {
                return Math.round(totals * 0.05);
            } else if (correctTotal < 39000) {
                return Math.round(totals * 0.05);
            } else {
                return Math.round(totals * 0.04);
            }
        }

        return Math.round(totals / 10);
    }

    async validateFulfillmentData(optionData, data, cart) {

        return {
            ...data,
        }
    }

}

export default MyFulfillmentService