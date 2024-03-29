import { API_URL } from './../http/index'
import { IUser } from '../models/IUser'
import { makeAutoObservable } from 'mobx'
import AuthService from '../services/AuthService'
import axios from 'axios'
import { AuthResponse } from '../models/response/AuthResponse'
import RandomAnime from './RandomAnime'
import AnimePage from './AnimePage'
import UserAnimeCollection from './UserAnimeCollection'

export default class Store {
   user = {} as IUser
   isAuth = false
   isLoading = false
   isError = false
   messageError = ''
   randomAnime: RandomAnime
   anime: AnimePage
   userAnimeCollection: UserAnimeCollection

   constructor() {
      makeAutoObservable(this)
      this.setLoading = this.setLoading.bind(this)
      this.setError = this.setError.bind(this)
      this.setIsError = this.setIsError.bind(this)
      this.randomAnime = new RandomAnime()
      this.anime = new AnimePage()
      this.userAnimeCollection = new UserAnimeCollection()
   }

   updateUserPersonalInfo(userData: any) {
      this.user.firstName = userData.firstName
      this.user.lastName = userData.lastName
      this.user.age = userData.age
      this.user.sex = userData.sex
      this.user.country = userData.country
   }

   randomAnimeClick(fucntionClick: () => void) {
      fucntionClick()
   }

   setAuth(bool: boolean) {
      this.isAuth = bool
   }

   setUser(user: IUser) {
      this.user = user
   }

   setLoading(bool: boolean) {
      this.isLoading = bool
   }

   setError(message: string) {
      this.messageError = message
   }

   setIsError(bool: boolean) {
      this.isError = bool
   }

   async login(username: string, password: string) {
      try {
         const response = await AuthService.login(username, password)
         localStorage.setItem('token', response.data.accessToken)
         this.setAuth(true)
         this.setUser(response.data.user)
         return true
      } catch (error: any) {
         //! передивитись

         const err = error.response.data.errors[0]?.msg
            ? error.response.data.errors[0].msg
            : error.response.data.message
         this.setError(err)
         console.error(error.response.data.message)
         return false
      }
   }

   async registration(username: string, password: string, email: string) {
      try {
         const response = await AuthService.registration(username, password, email)

         localStorage.setItem('token', response.data.accessToken)
         this.setAuth(true)
         this.setUser(response.data.user)
         return true
      } catch (error: any) {
         //! передивитись
         console.error(error)
         const err = error.response.data.errors[0]?.msg
            ? error.response.data.errors[0].msg
            : error.response.data.message

         this.setError(err)
         return false
      }
   }

   async logout() {
      try {
         await AuthService.logout()
         localStorage.removeItem('token')
         this.setAuth(false)
         this.setUser({} as IUser)
      } catch (error: any) {
         //! передивитись
         console.error(error.response.data.errors[0].msg)
      }
   }

   async checkAuth() {
      try {
         this.setLoading(true)
         const response = await axios.get<AuthResponse>(`${API_URL}/auth/refresh`, { withCredentials: true })
         localStorage.setItem('token', response.data.accessToken)
         this.setAuth(true)
         this.setUser(response.data.user)
      } catch (e: any) {
         console.error(e)
      } finally {
         this.setLoading(false)
      }
   }

   async getUser() {
      try {
         console.log()
      } catch (e: any) {
         console.log(e)
      }
   }

   async findOrCreate(username: string, password: string, email: string) {
      try {
         const response = await AuthService.checkUser(username)
         if (!response.data) {
            const registrationResponse = await this.registration(username, password, email)
            if (!registrationResponse) {
               console.error('Registration failed')
               return false
            }
            return
         }
         const loginResponse = await this.login(username, password)
         if (!loginResponse) {
            // Handle login failure
            console.error('Login failed')
            return false
         }
         return true
      } catch (e: any) {
         console.log(e)
         return false
      }
   }
}
