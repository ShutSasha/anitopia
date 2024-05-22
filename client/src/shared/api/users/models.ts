import { AnimeRating } from './../../../entities/ui/anime-card/ui/anime-rating'
export type GetUserById = {
   id: string | undefined
}

export type EditUserPersonalInfo = {
   id: string | undefined
   firstName: string
   lastName: string
   country: string
   sex: string
   age: number | string
}

export type UserByIdResponse = {
   _id: string
   activationLink: string
   age: number | null
   animeRatings: RatedAnime[] | undefined
   avatarLink: string
   country: string | null
   email: string
   firstName: string | null
   isActivated: boolean
   lastName: string | null
   registrationDate: string
   roles: UserBadget[]
   sex: string | null
   uploadStatus: boolean
   username: string
}

export type UserBadget = 'ADMIN' | 'USER' | 'PREMIUM' | 'MODERATOR' | 'BANNED' | 'DELETED' | 'GUEST' | 'UNKNOWN'

export interface RatedAnime {
   _id: string
   animeId: string
   poster_url: string
   rating: number
   title: string
}

export type ChangePasswordResponse = {
   id: string
   oldPassword: string
   newPassword: string
}
