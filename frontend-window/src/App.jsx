import './App.css'
import AppView from './views/AppView'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AppView />
    </AuthProvider>
  )
}

export default App
