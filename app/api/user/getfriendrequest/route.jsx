import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { email } = body

    const friendRequestsIncoming = await prisma.friend.findMany({
        where: {
            requestGoingtoEmail: email
        }
    })

    return NextResponse.json(friendRequestsIncoming)
}