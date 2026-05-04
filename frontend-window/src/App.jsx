import './App.css'
import { useI18n } from './i18n/I18nContext'
import { useAppViewModel } from './viewmodels/useAppViewModel'
import AppView from './views/AppView'

function App() {
  const { t, language } = useI18n()
  const vm = useAppViewModel(t, language)

  return <AppView t={t} language={language} vm={vm} />
}

export default App
