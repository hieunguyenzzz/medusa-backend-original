import {Router} from "express";
import {Request, Response} from "express";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router();

export default (adminRouter: Router) => {
    adminRouter.use("/export_orders", router);

    router.get("/abandon_cart/:cartId", async (req, res) => {
        const { cartId } = req.params;
        console.log(cartId);
        const data = await prisma.cart.findFirst({where: {id: cartId}})
        const lineItems = await prisma.line_item.findMany({where: {cart_id: cartId}});
        res.json({cart: data, lineItems})
    });

    router.get("/", async (req, res) => {
        const productService = req.scope.resolve("productService")
        const [product] = await productService.list({}, { take: 999 })
        const lineItems = await prisma.line_item.findMany({where: {order_id: {not:null}}});
        let lineItemsfull = await prisma.line_item.findMany(
            {
                where: {order_id: {not:null}},
                include: {
                    order: {include: {address_order_shipping_address_idToaddress: true}},
                    product_variant: {select: {sku: true}}
                }
            });
        let notes = await prisma.note.findMany();
        lineItemsfull = lineItemsfull.map(lineitem => ({...lineitem, note: notes.find(n => n.resource_id === lineitem.order_id)})).filter(l => !!l.order)

        res.json(lineItemsfull);
    });

};
