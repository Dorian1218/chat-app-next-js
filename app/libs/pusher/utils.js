export function toPusherKey(key) {
    return key.replace(/:/g, '__')
}