import {CustomerService, OrderService} from "@medusajs/medusa";
import Mailjet from 'node-mailjet';

const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);


interface IMessageRecipient {
    Email: string;
    Name: string;
}

interface IMessage {
    From: IMessageRecipient;
    To: IMessageRecipient[];
    Subject: string;
    TextPart: string;
    HTMLPart: string;
}


class OrderNotifierSubscriber {
    private customerService: CustomerService;
    private orderService: OrderService;
    sendgridService: any;
    constructor({ customerService, eventBusService, sendgridService }) {
        this.customerService = customerService;
        this.sendgridService = sendgridService;
        eventBusService.subscribe("customer.created", this.handleCustomer)
    }

    /**
     * data object look like this
     * {
     *   id: 'cus_01H5P0ZA6W8TR5085KZQBWAAH3',
     *   email: 'hieunguyenel+11112222@gmail.com',
     *   phone: '8128918',
     *   metadata: null,
     *   last_name: 'nguyen',
     *   created_at: '2023-07-19T02:51:52.915Z',
     *   deleted_at: null,
     *   first_name: 'hieu',
     *   updated_at: '2023-07-19T02:51:52.915Z',
     *   has_account: true,
     *   password_hash: 'c2NyeXB0AAEAAAABAAAAAUA6IHLmvxtvYsDXXKyN+2waGIm9YwKyr6XgiAVhNon3w1UlKLu1M7PUrGLwJyRIVHdGkmURV9Sww+l9oFtTFUkn2a27JalqlGeikGZL5zhV',
     *   billing_address_id: null
     * }
     * @param data
     */
    handleCustomer = async (data) => {
        const guestAccount = await this.customerService.retrieveUnregisteredByEmail(data.email);
        console.log('guestAccount',guestAccount);
        if (guestAccount) {
            const orders = await this.orderService.list({customer_id: guestAccount.id})
            // if (orders) {
            //     orders.map(async o => {
            //         console.log('o.id',o.id);
            //         await this.orderService.update(o.id, {customer_id: data.id});
            //     });
            // }
            // await this.customerService.update(data.id, {metadata: guestAccount.metadata});
            // await this.customerService.update(guestAccount.id, {metadata: {}});
        }

        await this.sendEmail(data.email);
    }

    sendEmail = async (
        toEmail: string
    ) => {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.MAILJET_EMAIL_FROM,
                        Name: process.env.MAILJET_EMAIL_NAME,
                    },
                    To: [
                        {
                            Email: toEmail,
                            Name: toEmail,
                        },
                    ],
                    "TemplateID": 4772844,
                    "TemplateLanguage": true,
                    "Subject":  process.env.MAILJET_EMAIL_SUBJECT_CUSTOMER_WELCOME,
                },
            ],
        });

        try {
            const response = await request;
        } catch (err) {
            console.error(err.statusCode, err.message);
        }
    };

}

export default OrderNotifierSubscriber
