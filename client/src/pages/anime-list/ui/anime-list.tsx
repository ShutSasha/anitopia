import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { AnimeCardsContainerView, AnimeNotFound, ContentContainer, ToolBar, Wrapper } from '@widgets/index.ts'
import { Header } from '@widgets/header'
import { Loader, Pagination, SearchInput } from '../../../shared'
import { Footer } from '@widgets/footer'
import { useStore } from '@app/hooks/useStore.ts'
import styles from './styles.module.scss'
import { fetchAnimeList } from '../hooks/useCatalogAnime.ts'
import { getCatalogAnime } from '@shared/api/anime/anime.ts'
import { handleFetchError } from '@app/helpers/functions.tsx'
import { formattedAnimeData } from '../helpers/formattedAnimeData.ts'

export interface MaterialData {
   description: string | undefined
   poster_url: string | undefined
   genres: Array<string> | undefined
   rating: number | undefined
   anime_title: string
   screenshots: Array<string> | undefined
}

export interface Anime {
   id: string
   title: string
   shikimori_id: string
   material_data: MaterialData
   year: number
   worldart_link: string
   type: string
}

export const AnimeList: FC = observer(() => {
   const { store } = useStore()
   const [catalogAnimeData, setCatalogAnimeData] = useState(store.animeCatalogStore.catalogAnimeData)
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [animesPerPage] = useState<number>(20)
   const [searchTerm, setSearchTerm] = useState<string>('')
   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
   const {
      animeCatalogStore: { sortType, sortBy, genres, kinds, mpaa, year_start, year_end, episodes_start, episodes_end },
   } = store

   useEffect(() => {
      fetchAnimeList(currentPage, animesPerPage, store, searchTerm)
   }, [
      currentPage,
      animesPerPage,
      sortType,
      sortBy,
      genres,
      kinds,
      mpaa,
      year_start,
      year_end,
      episodes_start,
      episodes_end,
   ])

   useEffect(() => {
      setCatalogAnimeData(store.animeCatalogStore.catalogAnimeData)
   }, [store.animeCatalogStore.catalogAnimeData])

   const paginate = (pageNumber: number) => {
      setCurrentPage(pageNumber)
      setSearchTerm(searchTerm ? searchTerm : '')
   }

   const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value
      setSearchTerm(newSearchTerm)
      if (timer) {
         clearTimeout(timer)
      }
      setTimer(
         setTimeout(async () => {
            try {
               setCurrentPage(1)
               const response = await getCatalogAnime({ page: currentPage, limit: animesPerPage, query: newSearchTerm })
               const formattedData = formattedAnimeData(response.data)
               store.animeCatalogStore.setCatalog(formattedData)
               store.animeCatalogStore.setTotalLength(response.data.length)
            } catch (error) {
               handleFetchError(error)
            }
         }, 500),
      )
   }

   if (store.isLoading) {
      return <Loader />
   }

   return (
      <Wrapper>
         <Header />
         <ContentContainer style={{ backgroundColor: '#fff', padding: '0px 20px' }}>
            <h1 className={styles.title}>Каталог аніме</h1>
            <SearchInput
               style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
               searchTerm={searchTerm}
               handleChangeSearch={handleChangeSearch}
            />
            <ToolBar style={{ marginBottom: '15px' }} />
            {catalogAnimeData.length && catalogAnimeData.length != 0 && catalogAnimeData ? (
               <AnimeCardsContainerView animeData={catalogAnimeData} />
            ) : (
               <AnimeNotFound searchTerm={searchTerm} />
            )}
            {store.animeCatalogStore.totalLength > 20 && (
               <Pagination
                  style={{ marginBottom: '20px' }}
                  animesPerPage={animesPerPage}
                  totalAnimes={store.animeCatalogStore.totalLength}
                  paginate={paginate}
                  currentPage={currentPage}
               />
            )}
         </ContentContainer>
         <Footer />
      </Wrapper>
   )
})
