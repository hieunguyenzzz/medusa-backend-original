import {
    OrderService,
    LineItemService,
    PriceListService,
    ProductVariantService
} from "@medusajs/medusa";
import axios from "axios";
import {gql} from '@apollo/client';
import {ApolloClient, createHttpLink, DefaultOptions, InMemoryCache} from '@apollo/client';
import fetch from 'node-fetch';

const FIFTY_PROMOTION = process.env.FIFTY_PROMOTION;
const SIXTY_PROMOTION = process.env.SIXTY_PROMOTION;
const SEVENTY_PROMOTION = process.env.SEVENTY_PROMOTION;
const EIGHTY_PROMOTION = process.env.EIGHTY_PROMOTION;

const FULL_FILL_AFTER_PLACING_ORDER = gql`
    mutation($sku: String) {
        afterPlacingOrder(sku: $sku) {
            leadtime
            instock
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

class LeadtimeHandleAfterSales {
    private orderService: OrderService;
    private lineItemService: LineItemService;
    private priceListService: PriceListService;
    private productVariantService: ProductVariantService;

    constructor({orderService, lineItemService, eventBusService, priceListService, productVariantService}) {

        this.orderService = orderService
        this.lineItemService = lineItemService;
        this.priceListService = priceListService;
        this.productVariantService = productVariantService;
        eventBusService.subscribe("order.placed", this.handleLeadtime)
    }

    handleLeadtime = async (data) => {
        console.log('start handle leadtime changes');

        const lineItems = await this.lineItemService.list({order_id: data.id});


        for (const item of lineItems) {
            let productVariant = await this.productVariantService.retrieve(item.variant_id);
            let fetchResult = await client.mutate({
                mutation: FULL_FILL_AFTER_PLACING_ORDER,
                variables: {sku: productVariant.sku}
            });

            console.log(fetchResult);
            if (fetchResult.data?.afterPlacingOrder?.leadtime && fetchResult.data?.afterPlacingOrder?.leadtime !== productVariant.metadata.leadtime) {
                await this.productVariantService.update(productVariant.id, {metadata: {leadtime: fetchResult.data?.afterPlacingOrder?.leadtime}})
            }
        }
        console.log('finish handle leadtime changes');
    }
}

export default LeadtimeHandleAfterSales