import { ReactNode, useState, useEffect, FC, useContext } from 'react'
import { Toast } from '../..'
import { Context } from '../../../main'
import axios, { AxiosError } from 'axios'
import { observer } from 'mobx-react-lite'

interface ApiResponse {
   message: string
}

export const ErrorBoundary: FC<{ children: ReactNode }> = observer(
   ({ children }) => {
      const { store } = useContext(Context)
      const [error, setError] = useState<string | null>(null)

      useEffect(() => {
         const axiosInterceptor = axios.interceptors.response.use(
            undefined,
            (error: AxiosError<ApiResponse>) => {
               const errorMessage =
                  error.response?.data?.message || 'An error occurred'
               setError(errorMessage)
               return Promise.reject(error)
            },
         )

         return () => {
            axios.interceptors.response.eject(axiosInterceptor)
         }
      }, [])

      const clearError = () => {
         setError(null)
         store.setIsError(false)
      }

      return (
         <div>
            {children}
            {error && (
               <Toast
                  clearIsError={clearError}
                  onClose={clearError}
                  message={error}
               />
            )}
         </div>
      )
   },
)
