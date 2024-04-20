import $api from '../../../app/http'
import { useStore } from '@app/hooks/useStore'

export const checkUploadStatus = async (username: string, intervalId: any) => {
   const { store } = useStore()
   try {
      const response = await $api.get(`/users/upload-status/${username}`)
      const status = response.data.status
      if (status === false) {
         console.log('Image upload completed')
         clearInterval(intervalId)
         window.addEventListener('unload', function () {
            store.isLoading = false
         })
         window.location.reload()
      } else if (!status) {
         console.error('Image upload failed')
         clearInterval(intervalId)
         store.isLoading = false
      }
   } catch (error) {
      console.error('Error checking upload status', error)
      throw error
   }
}
