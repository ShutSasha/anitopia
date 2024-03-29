import { FC, useCallback, useContext, useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { Rating } from '../../../pages/random-anime/ui/random-anime'
import { ImageZoomer, Skeleton } from '../../../shared'
import { AnimeRatingList } from '../../../entities'
import { Modal } from '../../Modal'
import { RATE_STAR_LIST } from '../helpers/rate-star-list'
import { useParams } from 'react-router-dom'
import { Context } from '../../../main'
import $api from '../../../app/http'
import { IAnime } from '../../../app/models/IAnime'
import icon_trash from '../assets/trash.svg'
import { Collection } from '../../../features/ui/anime-collection-inner/anime-collection-inner'
import { observer } from 'mobx-react-lite'

interface AnimeGeneralInfoProps {
   anime: IAnime
   ratings: Rating[] | undefined
}

export const AnimeGeneralInfo: FC<AnimeGeneralInfoProps> = observer(({ anime, ratings }) => {
   const { store } = useContext(Context)
   const { id } = useParams()
   const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false)
   const [modalActive, setModalActive] = useState<boolean>(false)
   const [ratedAnime, setRatedAnime] = useState<any | undefined>()

   const fetchData = async () => {
      try {
         const response = await $api.get<Collection[]>(`/rate-anime/${store.user.id}`)
         const rated_anime = response.data.filter((item) => item.animeId === id || item.animeId === anime.id)
         if (!rated_anime[0]) {
            setRatedAnime(false)
         }
         setRatedAnime(rated_anime[0])
      } catch (error) {
         console.error(error)
      }
   }

   const rateAnimeClick = useCallback(
      async (rate: number) => {
         await $api.post('/rate-anime', {
            rate: rate,
            anime_id: id || anime.id,
            user_id: store.user.id,
         })
         fetchData()

         setModalActive(false)
      },
      [id, anime.id, store.user.id],
   )

   const removeAnimeClick = async () => {
      await $api.delete('/rate-anime', {
         data: {
            anime_id: id || anime.id,
            user_id: store.user.id,
         },
      })
      fetchData()

      setModalActive(false)
   }

   useEffect(() => {
      if (store.isAuth) {
         fetchData()
      }
   }, [store.isAuth, rateAnimeClick])

   useEffect(() => {
      setIsLoadingImage(true)
      const image = new Image()
      image.src = anime.posterURL || ''
      image.onload = () => {
         setIsLoadingImage(false)
      }
   }, [anime.posterURL])

   return (
      <>
         <div className={styles.anime_general_info}>
            <div className={styles.anime_general_info_container}>
               <div className={styles.anime_poster}>
                  {isLoadingImage ? (
                     <Skeleton width={250} height={350} />
                  ) : (
                     <ImageZoomer>
                        <div className={styles.anime_poster_container}>
                           <img src={anime.posterURL} alt='poster_anime' />
                           <div className={styles.rate_star} onClick={() => setModalActive(true)} />
                        </div>
                     </ImageZoomer>
                  )}
               </div>
               <div className={styles.anime_info_box}>
                  <h2 className={styles.title_anime}>{anime.title}</h2>
                  <hr />
                  <AnimeRatingList ratings={ratings} />
                  <hr />
                  <div className={styles.anime_info}>
                     <ul className={styles.anime_info_list}>
                        <li className={styles.anime_info_item}>
                           <p>Статус:</p>
                           <span>{anime.status}</span>
                        </li>
                        <li className={styles.anime_info_item}>
                           <p>Эпизоды:</p>
                           <span>
                              {anime.airedEpisodes}/{anime.totalEpisodes !== 0 ? anime.totalEpisodes : '?'}
                           </span>
                        </li>
                        <li className={styles.anime_info_item}>
                           <p>Тип</p>
                           <span>{anime.type}</span>
                        </li>
                        <li className={styles.anime_info_item}>
                           <p>Возрастные ограничения:</p>
                           <span>
                              <div className={styles.minimal_age}>
                                 {anime.minimalAge ? `${anime.minimalAge}+` : 'Нет'}
                              </div>
                           </span>
                        </li>
                        <li className={styles.anime_info_item}>
                           <p>Жанры:</p>
                           <div className={styles.anime_genres_container}>
                              <ul className={styles.anime_genres_list}>
                                 {anime.genres
                                    ? anime.genres.map((item, index) => (
                                         <li className={styles.anime_genre} key={index}>{`${item} `}</li>
                                      ))
                                    : 'Не установлены'}
                              </ul>
                           </div>
                        </li>
                        <li className={styles.anime_info_item}>
                           <p>Год выпуска:</p>
                           <span>{anime.year}</span>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className={styles.anime_description}>Опис: {anime.description ? anime.description : 'Нет'}</div>
         </div>
         <Modal
            active={modalActive}
            setActive={setModalActive}
            headerText={'Оцените аниме'}
            modalWidth={`330px`}
            containerPadding={`0`}
         >
            <ul className={styles.rate_star_list}>
               {RATE_STAR_LIST.map((item, index) => (
                  <li key={index} className={styles.rate_star_item}>
                     <div onClick={() => rateAnimeClick(item.rate)} className={styles.rate_icon_text}>
                        <img className={styles.rate_star_icon} src={item.icon} alt='' />
                        <p className={styles.rate_text}>{item.rate + item.desc}</p>
                     </div>
                     {store.isAuth && ratedAnime && ratedAnime.rating === item.rate && (
                        <img onClick={removeAnimeClick} className={styles.icon_trash} src={icon_trash}></img>
                     )}
                  </li>
               ))}
            </ul>
         </Modal>
      </>
   )
})
