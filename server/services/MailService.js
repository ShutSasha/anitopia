const nodeMailer = require('nodemailer')
const { ssl } = require('pg/lib/defaults')

class MailService {
   constructor() {
      this.transporter = nodeMailer.createTransport({
         host: process.env.SMTP_HOST,
         port: process.env.SMTP_PORT,
         secure: ssl,
         auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
         },
      })
   }

   async sendActivationOnMail(to, link) {
      try {
         await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Активація аккаунта на сайті Anitopia ${process.env.API_URL}`,
            text: '',
            html: `
                <div>
                    <h1>Для активації аккаунта перейдіть по посиланню</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
         })
      } catch (error) {
         console.log(error)
      }
   }

   async sendTempPassword(to, password) {
      await this.transporter.sendMail({
         from: process.env.SMTP_USER,
         to,
         subject: 'Зміна паролю на сайті Anitopia',
         text: '',
         html: `
                <div>
                    <h1>Ваш новий тимчасовий пароль:</h1>
                    <p>${password}</p>
                </div>
            `,
      })
   }
}

module.exports = new MailService()
