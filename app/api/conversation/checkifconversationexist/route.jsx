import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getSession } from "next-auth/react"
import { getServerSession } from "next-auth"
import { pusherServer } from "@/app/libs/pusherserver"
import { toPusherKey } from "@/app/libs/utils"

export async function POST(req) {
    const prisma = new PrismaClient()
    const body = await req.json()
    const { isGroup, members, name } = body


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
