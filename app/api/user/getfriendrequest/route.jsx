import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { email } = body

    const friendRequestsIncoming = await prisma.friendReq.findMany({
        where: {
            requestGoingtoEmail: email
        }
    })

    return NextResponse.json(friendRequestsIncoming)
}