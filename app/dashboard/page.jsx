"use client"

import { useEffect } from "react"

export default function Dashboard() {

    useEffect(() => {
        const name = "Name"
        const deleter = "Na"
        var s = name.replace(deleter, '')
        console.log(s)
    }, [])
    return (
        <div>
            Dashboard
        </div>
    )
}