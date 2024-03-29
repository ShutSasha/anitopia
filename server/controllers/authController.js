const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult, cookie } = require('express-validator')
const userService = require('../services/UserService')
const ApiError = require('../errors/apiError')
const passport = require('passport')
const uuid = require('uuid')
const tokenService = require('../services/TokenService')
const UserDto = require('../dtos/user-dto')
const { or } = require('sequelize')

class authController {
   async registration(req, res, next) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
         }

         const { username, password, email } = req.body
         const userData = await userService.registration(username, email, password)
         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
         })

         return res.json(userData)
      } catch (e) {
         next(e)
      }
   }

   async login(req, res, next) {
      try {
         const { username, password } = req.body
         const userData = await userService.login(username, password)

         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
         })

         return res.json(userData)
      } catch (e) {
         next(e)
      }
   }

   async logout(req, res, next) {
      try {
         const { refreshToken } = req.cookies
         const token = await userService.logout(refreshToken)
         res.clearCookie('refreshToken')
         return res.json(token)
      } catch (e) {
         next(e)
      }
   }

   async getUsers(req, res, next) {
      try {
         const users = await userService.getAllUsers()
         return res.json(users)
      } catch (e) {
         next(e)
      }
   }

   async refresh(req, res, next) {
      try {
         const { refreshToken } = req.cookies
         const userData = await userService.refresh(refreshToken)
         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
         })

         return res.json(userData)
      } catch (e) {
         next(e)
      }
   }

   async activate(req, res, next) {
      try {
         const activationLink = req.params.link
         await userService.activation(activationLink)
         return res.redirect(process.env.CLIENT_URL)
      } catch (e) {
         next(e)
      }
   }

   async checkUser(req, res, next) {
      try {
         const { username } = req.body
         let user = await User.findOne({ username })
         return res.json(user)
      } catch (e) {
         next(e)
      }
   }

   async generateTempPassword(req, res, next) {
      try {
         const { email } = req.body
         let user = await User.findOne({ email })
         console.log(user)
         await userService.generatePassword(user)
         return res.json(user)
      } catch (e) {
         next(e)
      }
   }
}

module.exports = new authController()
