import {OrderService, LineItemService, ProductVariantService} from "@medusajs/medusa";
import fetch from 'cross-fetch';
import {gql} from '@apollo/client';
import { ApolloClient, createHttpLink, DefaultOptions, InMemoryCache } from '@apollo/client';

const FULL_FILL_AFTER_PLACING_ORDER = gql`
    mutation($sku: String, $quantity: Int) {
        inventoryFullfillAfterOrderPlace(sku: $sku, qty: $quantity) {
            error
        }
    }
`;
const httpLink = createHttpLink({
    uri: process.env.MAGENTO_API_URL,
    fetch
});

const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
});


class OrderNotifierSubscriber {
    private orderService: OrderService;
    private lineItemService: LineItemService;
    private productVariantService: ProductVariantService;
    private
    constructor({orderService, lineItemService, eventBusService, productVariantService}) {
        this.orderService = orderService
        this.lineItemService = lineItemService;
        this.productVariantService = productVariantService;
        eventBusService.subscribe("order.placed", this.handleOrder)
    }

    handleOrder = async (data) => {
        console.log('start syncing stock after sales');

        const lineItems = await this.lineItemService.list({order_id: data.id});

        for (const item of lineItems) {
            let variant = await this.productVariantService.retrieve(item.variant_id);

            if (variant.sku) {
                let fetchResult = await client.mutate({
                    mutation: FULL_FILL_AFTER_PLACING_ORDER,
                    variables: {sku: variant.sku, quantity: item.quantity}
                });


            }

        }
        console.log('done syncing stock after sales');
    }
}

export default OrderNotifierSubscriber