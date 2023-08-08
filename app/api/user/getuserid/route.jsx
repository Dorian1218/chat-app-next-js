import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

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