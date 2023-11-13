import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { pusherServer } from "@/app/libs/pusherserver"

export async function POST(req) {
    const session = await getServerSession(authOptions)
    const prisma = new PrismaClient()

    const body = await req.json()
    const {message, conversationId} = body

    const sender = await prisma.user.findUnique({
        where: {
            email: session.user.email
        }
    })

    if (conversationId == undefined) {
        return new NextResponse("You did not select a conversation", {status: 400})
    }

    const newMessage = await prisma.message.create({
        data: {
            body: message,
            conversation: {
                connect: {
                    id: conversationId
                }
            },
            sender: {
                connect: {
                    id: sender.id
                }
            },
            seen: {
                connect: {
                    id: sender.id
                }
            }
        },
        include: {
            seen: true,
            sender: true,
        }
    })

    // const updatedConvo = await prisma.conversation.update({
    //     where: {
    //         id: conversationId
    //     },
    //     data: {
    //         lastMessageAt: new Date(),
    //         messages: {
    //             connect: {
    //                 id: newMessage.id
    //             }
    //         }
    //     },
    //     include: {
    //         users: true,
    //         messages: {
    //             include: {
    //                 seen: true
    //             }
    //         }
    //     }
    // })

    pusherServer.trigger("user_sendmessage", "sendmessage", newMessage)

    return NextResponse.json(newMessage)
}