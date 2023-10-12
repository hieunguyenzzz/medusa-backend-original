import {OrderService, CustomerGroupService} from "@medusajs/medusa";

class OrderNotifierSubscriber {
    private orderService: OrderService;

    private customerGroupService: CustomerGroupService

    constructor({orderService, lineItemService, eventBusService, customerGroupService}) {
        this.orderService = orderService

        this.customerGroupService = customerGroupService;

        eventBusService.subscribe("order.placed", this.afterSalesHandle)
    }

    afterSalesHandle = async (data) => {
        console.log('start removing customer out of zero purchase customer group');
        try {
            let order = await this.orderService.retrieve(data.id);
            await this.customerGroupService.removeCustomer(process.env.ZERO_PURCHASE_CUSTOMER_GROUP, order.customer_id);
            await this.customerGroupService.addCustomers(process.env.ALREADY_PURCHASE_CUSTOMER_GROUP, order.customer_id);
            console.log('done removing customer out of zero purchase customer group');
        } catch (e) {
            console.log(' customer does not belong to zero purchase group ');
        }


    }
}

export default OrderNotifierSubscriber