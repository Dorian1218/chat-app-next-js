import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { pusherServer } from "@/app/libs/pusherserver"
import { toPusherKey } from "@/app/libs/utils"

export async function DELETE({ params }) {
    const prisma = new PrismaClient()
    const session = await getServerSession(authOptions)
    const friendEmail = params
    console.log(params)

    const deletedUser = await prisma.friend.deleteMany({
        where: {
            userMakingRequestEmail: friendEmail,
            requestGoingtoEmail: session?.user?.email
        }
    })

    pusherServer.trigger(toPusherKey(`user:${session?.user?.email}:deletefriendreq`), "deletefriendreq", {
        userMakingRequestEmail: friendEmail,
        requestGoingtoEmail: session?.user?.email
    })

    return NextResponse.json(deletedUser)
}