const generateMessage = ({ message, username }) => {
    return {
        text: message,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = ({ url, username }) => {
    return {
        url,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}