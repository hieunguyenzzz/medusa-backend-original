import {
    OrderService,
    LineItemService,
    PriceListService,
    ProductVariantService
} from "@medusajs/medusa";
import axios from "axios";
const FIFTY_PROMOTION = process.env.FIFTY_PROMOTION;
const SIXTY_PROMOTION = process.env.SIXTY_PROMOTION;
const SEVENTY_PROMOTION = process.env.SEVENTY_PROMOTION;
const EIGHTY_PROMOTION = process.env.EIGHTY_PROMOTION;


class PromotionHandlingSubscriber {
    private orderService: OrderService;
    private lineItemService: LineItemService;
    private priceListService: PriceListService;
    private productVariantService: ProductVariantService;

    constructor({orderService, lineItemService, eventBusService, priceListService, productVariantService}) {

        this.orderService = orderService
        this.lineItemService = lineItemService;
        this.priceListService = priceListService;
        this.productVariantService = productVariantService;
        eventBusService.subscribe("order.placed", this.handlePromotion)
    }

    handlePromotion = async (data) => {
        console.log('start handle Promotion');
        const lineItems = await this.lineItemService.list({order_id: data.id});


        for (const item of lineItems) {
            let productVariant = await this.productVariantService.retrieve(item.variant_id);
            console.log(item.variant_id);

            if (productVariant && productVariant.inventory_quantity && productVariant.inventory_quantity <= 0) {
                console.log('start removing promotion');
                let result1 = await this.priceListService.deleteVariantPrices(SIXTY_PROMOTION, [item.variant_id]);
                let result2 = await this.priceListService.deleteVariantPrices(SEVENTY_PROMOTION, [item.variant_id]);
                let result3 = await this.priceListService.deleteVariantPrices(EIGHTY_PROMOTION, [item.variant_id]);
                console.log(result1, result2, result3);
                if (!result1[0].length || !result2[0].length || !result3[0].length) {
                    console.log('rebuild required');
                    const url = process.env.URL_TO_REBUILD_BACKEND;

                    try {
                        const response = await axios.get(url);

                        // Do something with the response data
                        console.log("Response Data:", response.data);
                    } catch (error) {
                        console.error("Error occurred:", error.message);
                    }
                    break;
                }
            }
        }
        console.log('finish handle Promotion');
    }
}

export default PromotionHandlingSubscriber