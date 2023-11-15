"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

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