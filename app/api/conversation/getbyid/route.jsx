import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function POST(req) {
    const prisma = new PrismaClient()
    const body = await req.json()
    const { id } = body

    const convo = await prisma.conversation.findUnique({
        where: {
            id: id
        },
        include: {
            users: true,
            messages: {
                include: {
                    sender: true,
                    seen: true
                }
            }
        }
    })

    return NextResponse.json(convo)
}