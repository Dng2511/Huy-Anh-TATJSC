import { createContext, useContext, useMemo, useState } from 'react'
import translationsCsv from './translations.csv?raw'

const I18nContext = createContext(null)

function parseCsvLine(line) {
  const parts = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      parts.push(current)
      current = ''
      continue
    }

    current += char
  }

  parts.push(current)
  return parts.map((item) => item.trim())
}

function parseTranslations(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return { languages: ['vi'], dictionary: {} }
  }

  const header = parseCsvLine(lines[0])
  const languages = header.slice(1)
  const dictionary = {}

  for (let index = 1; index < lines.length; index += 1) {
    const columns = parseCsvLine(lines[index])
    const key = columns[0]

    if (!key) {
      continue
    }

    dictionary[key] = {}

    languages.forEach((language, columnIndex) => {
      dictionary[key][language] = columns[columnIndex + 1] ?? ''
    })
  }

  return { languages, dictionary }
}

const parsed = parseTranslations(translationsCsv)

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('vi')

  const value = useMemo(() => {
    const t = (key, fallback = key) => {
      const item = parsed.dictionary[key]

      if (!item) {
        return fallback
      }

      return item[language] || item.vi || fallback
    }

    return {
      language,
      setLanguage,
      t,
      languages: parsed.languages,
    }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider')
  }

  return context
}
