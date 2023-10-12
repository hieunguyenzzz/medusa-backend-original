import {Router} from "express";
import {Request, Response} from "express";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router();

export default (adminRouter: Router) => {
    adminRouter.use("/abandon_cart", router);

    router.get("/:cartId", async (req, res) => {
        const { cartId } = req.params;
        console.log(cartId);
        const data = await prisma.cart.findFirst({where: {id: cartId}})
        const lineItems = await prisma.line_item.findMany({where: {cart_id: cartId}});
        res.json({cart: data, lineItems})
    });

    router.get("/",async (req, res) => {

        let data = await getAllAbandonCart();
        console.log(data);
        res.json(data)
    })

};

const getAllAbandonCart = async () => {
    let orders = await prisma.order.findMany();
    let notAbandoncart =  [];
    for(const order of orders) {
        notAbandoncart.push(order.cart_id || "");
    }
    return await prisma.cart.findMany({where: {id: {notIn: notAbandoncart}}});
}

