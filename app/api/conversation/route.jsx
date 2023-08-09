import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function POST(
    req
) {
    const prisma = new PrismaClient()
    const body = await req.json()

    const conversation = await prisma.conversation.create({
        data: {

        }
    })

    return NextResponse.json(conversation)
}