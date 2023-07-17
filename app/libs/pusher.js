import PusherServer from "pusher"
import PusherClient from "pusher-js"

export const pusherServer = new PusherServer({
    app_id: "1631040",
    key: "4da3dcb5d212d2a40317",
    secret: "349d0910723b03b04778",
    cluster: "us2",
    useTLS: true
})

export const pusherClient = new PusherClient(
    "4da3dcb5d212d2a40317", {cluster: "us2"}
)