const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'phong@mail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'phong@mail.com',
        subject: 'Thanks for being with us',
        text: 'We are sorry to let you go. Please let us know what we can do to please you'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail,
}