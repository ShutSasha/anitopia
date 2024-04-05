import { createContext } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './app/styles/main.scss'
import Store from './app/store/store.ts'
import { GoogleOAuthProvider } from '@react-oauth/google'

//const clientId = process.env.REACT_APP_CLIENT_ID || 'defaultClientId'

interface State {
   store: Store
}

const store = new Store()
export const Context = createContext<State>({
   store,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
   <GoogleOAuthProvider clientId='264314347191-trnhhm4le2gs6igghf0vjuhigfek7e9t.apps.googleusercontent.com'>
      <Context.Provider value={{ store }}>
            <App />
      </Context.Provider>
   </GoogleOAuthProvider>,
)
