import $api, { API_URL } from '../http/index'
import { IUser } from '../models/IUser'
import { makeAutoObservable } from 'mobx'
import AuthService from '../services/AuthService'
import axios from 'axios'
import { AuthResponse } from '../models/response/AuthResponse'
import RandomAnime from './RandomAnime'
import AnimePage from './AnimePage'
import UserAnimeCollection from './UserAnimeCollection'
import { handleFetchError } from '@app/helpers/functions'
import UserPersonalData from './UserPersonalData'
import AnimeCatalogStore from './AnimeList'

export default class Store {
   user = {} as IUser
   isAuth = false
   isLoading = false
   banPanelToggle = false
   siteBackground = '#e2e2e2'
   randomAnime: RandomAnime
   anime: AnimePage
   userAnimeCollection: UserAnimeCollection
   userPersonalData: UserPersonalData
   animeCatalogStore: AnimeCatalogStore

   constructor() {
      makeAutoObservable(this)
      this.setLoading = this.setLoading.bind(this)
      this.setSiteBackground = this.setSiteBackground.bind(this)
      this.randomAnime = new RandomAnime()
      this.anime = new AnimePage()
      this.userAnimeCollection = new UserAnimeCollection()
      this.animeCatalogStore = new AnimeCatalogStore()
      this.userPersonalData = new UserPersonalData(this)
   }

   setBanPanelToggle(bool: boolean) {
      this.banPanelToggle = bool
   }

   setSiteBackground(color: string) {
      this.siteBackground = color
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

   async login(username: string, password: string) {
      try {
         const response = await AuthService.login(username, password)
         localStorage.setItem('token', response.data.accessToken)
         this.setAuth(true)
         this.setUser(response.data.user)
         return true
      } catch (error: any) {
         handleFetchError(error)
         return false
      }
   }

   async registration(username: string, password: string, email: string, pictureLink: string | null) {
      try {
         const response = await AuthService.registration(username, password, email, pictureLink)

         localStorage.setItem('token', response.data.accessToken)
         this.setAuth(true)
         this.setUser(response.data.user)
         return true
      } catch (error: any) {
         handleFetchError(error)
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
         handleFetchError(error)
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

   async findOrCreate(username: string, password: string, email: string, pictureLink: string) {
      try {
         const response = await AuthService.checkUser(username)
         if (!response.data) {
            const registrationResponse = await this.registration(username, password, email, pictureLink)
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
         handleFetchError(e)
         return false
      }
   }
}
