import {CustomerGroupService, CustomerService} from "@medusajs/medusa";


class OrderNotifierSubscriber {
    private customerService: CustomerService;
    private customerGroupService: CustomerGroupService
    sendgridService: any;
    constructor({ customerService, eventBusService, sendgridService, customerGroupService }) {
        this.customerGroupService = customerGroupService;
        this.customerService = customerService;
        this.sendgridService = sendgridService;
        eventBusService.subscribe("customer.created", this.handleCustomer)
    }

    /**
     * data look like this
     * {
     *   id: 'cus_01H04X3Q9RGD8SM53AS50TEY0P',
     *   email: 'hieunguyenel+9191919334@gmail.com',
     *   phone: '23123123',
     *   metadata: null,
     *   last_name: 'nguyen',
     *   created_at: '2023-05-11T07:58:48.621Z',
     *   deleted_at: null,
     *   first_name: 'hieu',
     *   updated_at: '2023-05-11T07:58:48.621Z',
     *   has_account: true,
     *   password_hash: 'c2NyeXB0AAEAAAABAAAAAeoao2EOm1J2gWeaWBP78mWRvVq8qZv3bI0iKaJg30qACUJam2Z90pQhPSpZ9GsvQw1CPw87dwTJ1HsERaFI5CCwIE2cNAEely7nsCrU18n7',
     *   billing_address_id: null
     * }
     * @param data
     */
    handleCustomer = async (data) => {
        await this.customerGroupService.addCustomers(process.env.ZERO_PURCHASE_CUSTOMER_GROUP, data.id);


    }

}

export default OrderNotifierSubscriber
