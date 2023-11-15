"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(req) {

    const prisma = new PrismaClient()
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const {friendId, friendEmail, friendName, friendImage} = body
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
            combinedId: combinedId,
            combinedEmail: user.email + friendEmail,
            combinedName: user.name + friendName,
            combinedImg: user.image + friendImage
        }
    })

    return NextResponse.json(friend)
}