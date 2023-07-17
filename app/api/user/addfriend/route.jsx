import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { pusherServer } from "@/app/libs/pusher"
import { toPusherKey } from "@/app/libs/utils"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { email } = body
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized Request", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (user === null) {
        console.log("true")
        return new NextResponse("User does not exist", { status: 404 })
    }

    const personMakingRequest = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })

    if (user.id === personMakingRequest.id) {
        return new NextResponse("You cannot start a conversation with yourself", { status: 400 })
    }

    const requestExist = prisma.friend.findMany({
        where: {
            userMakingRequestEmail: session?.user?.email,
            requestGoingtoEmail: user.email
        }
    })

    if ((await requestExist).length > 0) {
        return new NextResponse("You already sent a friend request to this user", { status: 400 })
    }

    const friendRequest = await prisma.friend.create({
        data: {
            userMakingRequestEmail: session?.user?.email,
            userMakingRequestName: personMakingRequest.name,
            userMakingRequestId: personMakingRequest.id,
            userMakingRequestPhoto: personMakingRequest.image,
            requestGoingtoEmail: user.email,
            requestGoingtoId: user.id
        }
    })

    // pusherServer.trigger(
    //     toPusherKey(`user:${user.email}:incomingfriendrequest`), "incomingfriendrequest", {
    //         userMakingRequestId: personMakingRequest.id,
    //         userMakingRequestEmail: session?.user?.email
    //     }
    // )
        const triggered = await pusherServer.trigger("my-channel", "incoming_friend_request", {user: session?.user?.email})
        console.log(triggered)

    return NextResponse.json(friendRequest)
}