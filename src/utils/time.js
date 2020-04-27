const time = () => {
    let date_ob = new Date()
    let hours = date_ob.getHours()
    let minutes = date_ob.getMinutes()
    return "[" + hours + ":" + minutes + "] "
}

module.exports = time