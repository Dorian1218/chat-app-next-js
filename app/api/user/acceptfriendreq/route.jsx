import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { toPusherKey } from "@/app/libs/utils"
import { pusherServer } from "@/app/libs/pusherserver"

export async function POST(req) {

    const prisma = new PrismaClient()
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const {friendId} = body
    var combinedId

    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })

    if (user.id > friendId) {
        combinedId = user.id + friendId
    }

    else {
        combinedId = friendId + user.id
    }

    const friend = await prisma.friend.create({
        data: {
            combinedId: combinedId
        }
    })

    return NextResponse.json(friend)
}