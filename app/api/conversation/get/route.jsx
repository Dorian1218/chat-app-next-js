"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST() {
     
    const session = await getServerSession(authOptions)
    const prisma = new PrismaClient()

    const currentUser = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })
    const getConversations = await prisma.conversation.findMany({
        orderBy: {
            lastMessageAt: "desc"
        },
        where: {
            userIds: {
                has: currentUser.id
            }
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

    return NextResponse.json(getConversations)
}
