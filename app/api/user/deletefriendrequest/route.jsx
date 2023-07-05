import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function DELETE(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { email } = body
    const session = await getServerSession(authOptions)

    const deletedUser = await prisma.friend.delete({
        where: {
            AND: [
                {userMakingRequestEmail: email},
                {requestGoingtoEmail: session?.user?.email}
            ]
        }
    })

    return NextResponse.json(deletedUser)
}