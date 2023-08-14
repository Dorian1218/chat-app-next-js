import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getSession } from "next-auth/react"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { pusherServer } from "@/app/libs/pusherserver"
import { toPusherKey } from "@/app/libs/utils"

export async function POST(req) {
    const prisma = new PrismaClient()
    const body = await req.json()
    const { isGroup, members, name } = body
    const session = await getServerSession(authOptions)

    const currentUser = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })

    const userNames = [currentUser.name]
    const userImages = [currentUser.image]

    console.log(currentUser)
    
    const conversation = await prisma.conversation.create({
        data: {
            name: name,
            isGroup: isGroup,
            users: {
                connect: [
                    ...members.map((member) => ({
                        id: member.id
                    })),
                    {
                        id: currentUser.id
                    }
                ]
            },
        },
        include: {
            users: true
        }
    })

    pusherServer.trigger(`user_newconversation`, "newconversation", conversation)

    return NextResponse.json(conversation)
}