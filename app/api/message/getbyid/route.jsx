import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"

export async function POST(req){

    const prisma = new PrismaClient()

    const body = await req.json()
    const {conversationId} = body

    const messages = await prisma.message.findMany({
        where: {
            conversationId: conversationId
        },
        include: {
            sender: true,
            seen: true,
        }
    })

    return NextResponse.json(messages)
}