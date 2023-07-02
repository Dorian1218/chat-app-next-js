import bcrypt from "bcrypt"
import prisma from "../../libs/prismadb"
import { NextResponse } from "next/server"

export async function POST(request) {
    const body = await request.json()
    const { name, email, password } = body
    console.log(body)

    if (!name || !email || !password) {
        return new NextResponse("Missing  Fields", { status: 400 })
    }

    const emailExist = await prisma.user.findUnique({
        where: {
          email: email
        }
      })

    if (emailExist) {
        throw new Error("Email already exist")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword
        }
    })

    return NextResponse.json(user)
}