import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request, response) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const {email} = body
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    const session = await getServerSession(authOptions)

    const personMakingRequest = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })

    console.log(session)

    if (user == null) {
        return new NextResponse("User Does not exist", {status: 400})
    }

    if (!session) {
        return new NextResponse("Unauthorized Request", {status: 400})
    }
    
    if (user.id === personMakingRequest.id) {
        return new NextResponse("You cannot start a conversation with yourself", {status: 400})
    }

    return NextResponse.json(user)
}