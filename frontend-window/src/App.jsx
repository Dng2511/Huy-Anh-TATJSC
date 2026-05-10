import './App.css'
import { useI18n } from './i18n/I18nContext'
import AppView from './views/AppView'

function App() {
  const { t, language } = useI18n()

  return <AppView t={t} language={language} />
}

export default App
