import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { userId } = body

    const friends = await prisma.friend.findMany({
        where: {
            combinedId: {
                contains: userId
            }
        }
    })

    console.log(friends)

    return NextResponse.json(friends)
}