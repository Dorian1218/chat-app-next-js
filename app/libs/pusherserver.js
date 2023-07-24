const Pusher = require("pusher")

export const pusherServer = new Pusher({
    app_id: "1640128",
    key: "0b709d07d4be80da7280",
    secret: "16b9ff9c0935b7f28a96",
    cluster: "us2",
    useTLS: true
})