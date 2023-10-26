import { wrapHandler } from "@medusajs/utils";
import {Router} from "express";
import {Request, Response} from "express";
import { PrismaClient } from '@prisma/client'
import getAbandonCarts from "./getAbandonCarts";
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

    router.get("/",wrapHandler(getAbandonCarts));
};

