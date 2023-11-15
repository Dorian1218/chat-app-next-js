import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getSession } from "next-auth/react"

export async function POST(req) {
    const prisma = new PrismaClient()
    const body = await req.json()
    const { members} = body


    const conversations = await prisma.conversation.findMany({
        include: {
            users: true
        },
        where:{
            userIds:{
                hasEvery: [...members.map((member) => member.id)]
            }
        }

    })

    if (conversations) {
        return new NextResponse("Conversation Already Exists", {status: 401})
    }

    return NextResponse.json(conversations)
}
