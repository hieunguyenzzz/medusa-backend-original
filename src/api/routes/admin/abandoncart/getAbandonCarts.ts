import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function getAbandonCarts(req: Request, res: Response) {
    let data = await getAllAbandonCart();
    res.status(200).json(data)
}

const getAllAbandonCart = async () => {
    let orders = await prisma.order.findMany();
    let notAbandoncart =  [];
    for(const order of orders) {
        notAbandoncart.push(order.cart_id || "");
    }
    return await prisma.cart.findMany({where: {id: {notIn: notAbandoncart}}});
}
