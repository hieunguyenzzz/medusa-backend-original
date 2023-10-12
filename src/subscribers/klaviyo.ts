import { LineItem, LineItemService, Order, OrderService } from "@medusajs/medusa";
import fetch from "node-fetch";

class KlaviyoSubscriber {
    private orderService: OrderService;
    private lineItemService: LineItemService;
    constructor({ orderService, lineItemService, eventBusService }) {
        this.orderService = orderService
        this.lineItemService = lineItemService;

        eventBusService.subscribe("order.placed", this.sendEvent)
    }

    sendEvent = async (data) => {
        console.log("NNNNew Orderrrrrrrrr: " + data.id)

        console.log(data);
        const order = await this.orderService.retrieve(data.id, {
            select: [
                "shipping_total",
                "discount_total",
                "tax_total",
                "refunded_total",
                "gift_card_total",
                "subtotal",
                "total",
            ],
            relations: [
                "customer",
                "billing_address",
                "shipping_address",
                "discounts",
                "discounts.rule",
                "shipping_methods",
                "payments",
                "fulfillments",
                "returns",
                "items",
                "gift_cards",
                "gift_card_transactions",
                "swaps",
                "swaps.return_order",
                "swaps.payment",
                "swaps.shipping_methods",
                "swaps.shipping_address",
                "swaps.additional_items",
                "swaps.fulfillments",
            ],
        })
        // console.log(order.customer);
        // console.log(order.items);
        // console.log(order.billing_address);

        await sendEventToKlaviyo(order);
        await sendOrderProductEventToKlaviyo(order);
    }
}

async function sendEventToKlaviyo(order: Order) {
    try {
        const API_KEY = process.env.KLAVIYO_API_KEY;
        const eventName = "Placed Order";
        const customerProperties = {
            $email: order.email,
            $first_name: order.customer.first_name,
            $last_name: order.customer.last_name,
            Address: order.shipping_address.address_1,
            City: order.shipping_address.city,
            State: order.shipping_address.province,
            Zip: order.shipping_address.postal_code,
            Country: order.shipping_address.country
        };
        const properties = {
            "$event_id": order.id,
            "$value": order.total / 100,
            "OrderId": order.id,
            "Categories": [],
            "ItemNames": order.items.map(item => item.title),
            "DiscountCode": order.discounts.map(code => code.code),
            "DiscountValue": order.discount_total,
            "Items": order.items.map(item => ({
                "ProductID": item.variant_id,
                "SKU": item?.variant?.sku || "",
                "ProductName": item.variant.product.title + " " + item.variant.title,
                "Quantity": item.quantity,
                "ItemPrice": item.unit_price / 100,
                "RowTotal": item.total / 100,
                "Categories": [],

            })),
            "BillingAddress": {
                "FirstName": order.billing_address.first_name,
                "LastName": order.billing_address.last_name,
                "Company": order.billing_address.company,
                "Address1": order.billing_address.address_1,
                "Address2": order.billing_address.address_2,
                "City": order.billing_address.city,
                "Region": order.billing_address.province,
                "RegionCode": order.billing_address.province,
                "Country": order.billing_address.country,
                "CountryCode": order.billing_address.country_code,
                "Zip": order.billing_address.postal_code,
                "Phone": order.billing_address.phone
            },
            "ShippingAddress": {
                "FirstName": order.shipping_address.first_name,
                "LastName": order.shipping_address.last_name,
                "Company": order.shipping_address.company,
                "Address1": order.shipping_address.address_1,
                "Address2": order.shipping_address.address_2,
                "City": order.shipping_address.city,
                "Region": order.shipping_address.province,
                "RegionCode": order.shipping_address.province,
                "Country": order.shipping_address.country,
                "CountryCode": order.shipping_address.country_code,
                "Zip": order.shipping_address.postal_code,
                "Phone": order.shipping_address.phone
            }
        };
        const eventData = { token: API_KEY, event: eventName, customer_properties: customerProperties, properties };
        const encodedData = Buffer.from(JSON.stringify(eventData)).toString("base64");
        const response = await fetch(
            `https://a.klaviyo.com/api/track?data=${encodedData}`
        );
        const jsonResponse = await response.json();

    } catch (error) {
        console.error(error);
    }
}

async function sendOrderProductEventToKlaviyo(order: Order) {
    for (const item of order.items) {
        try {
            const API_KEY = process.env.KLAVIYO_API_KEY;
            const eventName = "Ordered Product";
            const customerProperties = {
                $email: order.email,
                $first_name: order.customer.first_name,
                $last_name: order.customer.last_name,

            };

            const properties = {
                "$event_id": item.id,
                "$value": item.total /100,
                "OrderId": order.id,
                "ProductID": item.variant_id,
                "SKU": item.variant.sku,
                "ProductName": item.variant.product.title + ' ' + item.variant.title,
                "Quantity": item.quantity,
            };
            const eventData = { token: API_KEY, event: eventName, customer_properties: customerProperties, properties };
            const encodedData = Buffer.from(JSON.stringify(eventData)).toString("base64");
            const response = await fetch(
                `https://a.klaviyo.com/api/track?data=${encodedData}`
            );
            console.log(`https://a.klaviyo.com/api/track?data=${encodedData}`);
            const jsonResponse = await response.json();



        } catch (error) {
            console.error(error);
        }
    }


}



export default KlaviyoSubscriber