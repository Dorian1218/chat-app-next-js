import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { email } = body
    const session = await getServerSession(authOptions)

    const personMakingRequest = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })


    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (user === null) {
        return new Response("User does not exist", { status: 400 })
    }

    if (!session) {
        return new Response("Unauthorized Request", { status: 400 })
    }

    if (user.id === personMakingRequest.id) {
        return new Response("You cannot start a conversation with yourself", { status: 400 })
    }

    return NextResponse.json(user?.id)
}