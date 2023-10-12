import {OrderService} from "@medusajs/medusa";

class OrderSubscriber {
    private orderService_: OrderService;
    constructor({orderService, eventBusService}) {
        this.orderService_ = orderService;

        eventBusService.subscribe('order.placed', this.handleAutomaticCapture);
    }

    handleAutomaticCapture = async (data) => {
        const order = await this.orderService_.retrieve(data.id);
        await this.orderService_.capturePayment(order.id);
    };
}

export default OrderSubscriber