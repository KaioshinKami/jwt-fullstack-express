const nodemailer=require('nodemailer')

class mailService{
    constructor() {
        this.transparter=nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationLink(to, link){
        this.transparter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активируйте свой почтовый аккаунт на '+process.env.API_URL,
            text:'',
            html: `
                 <div>
                    <h1>Для активации перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                 </div>
            `
        })
    }

}

module.exports = new mailService()