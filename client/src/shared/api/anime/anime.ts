import type { AxiosPromise } from 'axios'
import type { Anime, GetAnimeById } from './models'
import $api from '../../../app/http'

const BASE_URL = '/anime'

export const getAnimeById = ({ id, ...params }: GetAnimeById): AxiosPromise<Anime> => {
   return $api.get(`${BASE_URL}/${id}`, { params })
}
