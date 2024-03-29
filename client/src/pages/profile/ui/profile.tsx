import { FC, useContext, useEffect, useRef, useState } from 'react'
import { Context } from '../../../main'
import { observer } from 'mobx-react-lite'
import { Header } from '../../../widgets/header'
import styles from './styles.module.scss'
import { ProfileBgImg } from '../../../features'
import { useNavigate, useParams } from 'react-router-dom'
import { NotFoundPage } from '../../not-found'
import { Loader } from '../../../shared'
import { uploadImage } from '../api/uploadImage'
import { checkUploadStatus } from '../helpers/checkUploadStatus'
import { MainUserInfo } from '../../../widgets/main-user-info'
import { AnimeCollection } from '../../../widgets/anime-collection/index.ts'
import { getUserById } from '@shared/api/users/users.ts'
import { UserByIdResponse } from '@shared/api/models.ts'

export const Profile: FC = observer(() => {
   const fileInputRef = useRef<HTMLInputElement | null>(null)
   const { store } = useContext(Context)
   const navigate = useNavigate()

   const [user, setUser] = useState<UserByIdResponse>()
   const [img, setImage] = useState<File | null>(null)

   const { id } = useParams()

   useEffect(() => {
      const fetchData = async () => {
         const res = await getUserById({ id })
         setUser(res.data)
      }
      fetchData()
   }, [id])

   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
         const selectedImage = event.target.files[0]
         setImage(selectedImage)
      }
   }

   useEffect(() => {
      let intervalId: any

      if (img) {
         store.isLoading = true

         try {
            intervalId = uploadImage(img, store.user.username, () =>
               checkUploadStatus(store.user.username, intervalId),
            )
         } catch (error) {
            clearInterval(intervalId)
            store.isLoading = false
         }
      }

      return () => clearInterval(intervalId)
   }, [img])

   const handleClick = () => {
      fileInputRef.current?.click()
   }

   if (store.isLoading) {
      return <Loader />
   }

   if (!store.isAuth) {
      navigate('/login')
      return <NotFoundPage />
   }

   if (user === undefined) {
      return <p>Користувача не існує або можливо виникла якась помилка</p>
   }

   return (
      <div className={styles.wrapper}>
         <Header />
         <div className={styles.container}>
            <ProfileBgImg />
            <MainUserInfo
               user={user}
               handleClick={handleClick}
               fileInputRef={fileInputRef}
               handleImageChange={handleImageChange}
            />
            <AnimeCollection />
         </div>
         <div>footer</div>
      </div>
   )
})
