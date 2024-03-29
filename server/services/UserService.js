const UserModel = require('../models/User')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const Role = require('../models/Role')
const uuid = require('uuid')
const mailService = require('./MailService')
const tokenService = require('./TokenService')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../errors/apiError')
const jwt = require('jsonwebtoken')
const imageService = require('./ImageService')
const fs = require('fs')
const ImageKit = require('imagekit')

var imagekit = new ImageKit({
   publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
   privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
   urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
})

class UserService {
   async registration(username, email, password) {
      const candidate = await User.findOne({ $or: [{ username }, { email }] })

      //TODO ПОМЕНЯТЬ
      const isgoogleAuth = email.split('@')[0] === username

      if (candidate) {
         throw ApiError.BadRequest('Пользователь с таким именем/почтой уже существует')
      }

      const hashPassword = await bcrypt.hashSync(password, 7)
      const userRole = await Role.findOne({ value: 'USER' })
      const activationLink = uuid.v4()

      const user = await UserModel.create({
         username,
         email,
         firstName: null,
         lastName: null,
         country: null,
         age: null,
         sex: null,
         avatarLink: process.env.IMAFE_KIT_DEFAULT_IMAGE,
         password: hashPassword,
         registrationDate: Date.now(),
         uploadStatus: false,
         activationLink,
         isActivated: isgoogleAuth,
         roles: [userRole.value],
      })

      await mailService.sendActivationOnMail(email, `${process.env.API_URL}/api/auth/activate/${activationLink}`)

      const userDto = new UserDto(user)
      const tokens = tokenService.generateToken({ ...userDto })
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return { ...tokens, user: userDto }
   }

   async activation(activationLink) {
      const user = await UserModel.findOne({ activationLink })
      if (!user) {
         throw ApiError.BadRequest('Неккоректная ссылка активации')
      }
      user.isActivated = true
      await user.save()
   }

   async login(username, password) {
      const user = await User.findOne({ username })

      if (!user) {
         throw ApiError.BadRequest('Пользователь с таким именем не найден')
      }

      const validPassword = bcrypt.compareSync(password, user.password)

      if (!validPassword) {
         throw ApiError.BadRequest('Неверный пароль')
      }

      if (user.isActivated === false) {
         throw ApiError.Forbidden('У вас не активирован аккаунт!')
      }

      const userDto = new UserDto(user)
      const tokens = tokenService.generateToken({ ...userDto })

      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      return { ...tokens, user: userDto }
   }

   async logout(refreshToken) {
      const token = await tokenService.removeToken(refreshToken)
      return token
   }

   async refresh(refreshToken) {
      if (!refreshToken) {
         throw ApiError.UnauthorizedError('Пользователь не авторизирован')
      }
      const userData = tokenService.validateRefreshToken(refreshToken)
      const tokenFromDb = await tokenService.findToken(refreshToken)

      if (!userData || !tokenFromDb) {
         throw ApiError.UnauthorizedError('Пользователь не авторизирован')
      }

      const user = await UserModel.findById(userData.id)
      const userDto = new UserDto(user)
      const tokens = tokenService.generateToken({ ...userDto })

      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      return { ...tokens, user: userDto }
   }

   async getUserById(id) {
      const user = await UserModel.findById(id)
      return user
   }

   async getAllUsers() {
      const users = UserModel.find()
      return users
   }

   async changeUserIcon(file, username) {
      const user = await UserModel.findOne({ username })

      if (!user) {
         throw ApiError.BadRequest('Пользователь с таким именем не найден')
      }

      user.uploadStatus = true
      user.save()

      var fileName = uuid.v4() + 'jpg'
      const fileStream = fs.createReadStream(file)
      imagekit.upload(
         {
            file: fileStream, //required
            fileName: fileName, //required
            folder: 'user_icons',
            extensions: [
               {
                  name: 'google-auto-tagging',
                  maxTags: 5,
                  minConfidence: 95,
               },
            ],
         },
         async (error, result) => {
            if (error) console.log(error)
            else {
               if (user.avatarLink && user.avatarLink !== process.env.IMAFE_KIT_DEFAULT_IMAGE) {
                  const oldFilelink = user.avatarLink
                  await imageService.deleteImage(oldFilelink)
               }
               user.avatarLink = result.url
               user.uploadStatus = false
               user.save()
            }
         },
      )
   }

   async getStatus(username) {
      const user = await UserModel.findOne({ username })
      return user.uploadStatus
   }

   async editProfile(userId, updatedFields) {
      const user = await UserModel.findById(userId)

      if (!user) {
         throw new ApiError.BadRequest()
      }

      Object.assign(user, updatedFields)
      await user.save()
      return user
   }

   async generatePassword(user) {
      var tempPassword = 'temp' + uuid.v4()
      const hashPassword = await bcrypt.hashSync(tempPassword, 7)

      user.password = hashPassword

      await user.save()

      await mailService.sendTempPassword(user.email, tempPassword)
   }
}

module.exports = new UserService()
