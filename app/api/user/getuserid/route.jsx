import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { toPusherKey } from "@/app/libs/utils"
import { pusherServer } from "@/app/libs/pusherserver"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { email } = body

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    return NextResponse.json(user.id)
}