import { useMemo, useState } from 'react'
import { createAppModel } from '../models/appModel'

export function useAppViewModel(t, language) {
  const [statusFilter, setStatusFilter] = useState('Tat ca')
  const [activePage, setActivePage] = useState('dashboard')

  const model = useMemo(() => createAppModel(), [])

  const formatCurrency = (value) => {
    const locale =
      language === 'en'
        ? 'en-US'
        : language === 'ja'
          ? 'ja-JP'
          : language === 'zh'
            ? 'zh-CN'
            : 'vi-VN'

    const currency =
      language === 'en'
        ? 'USD'
        : language === 'ja'
          ? 'JPY'
          : language === 'zh'
            ? 'CNY'
            : 'VND'

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const translatedMenuItems = useMemo(
    () =>
      model.menuItems.map((item) => ({
        ...item,
        label: t(`menu.${item.key}`, item.label),
      })),
    [model.menuItems, t],
  )

  const translatedPageMeta = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(model.pageMeta).map(([key, meta]) => [
          key,
          {
            title: t(`page.${key}.title`, meta.title),
            description: t(`page.${key}.description`, meta.description),
          },
        ]),
      ),
    [model.pageMeta, t],
  )

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'Tat ca') {
      return model.orders
    }

    return model.orders.filter((order) => order.status === statusFilter)
  }, [model.orders, statusFilter])

  return {
    activePage,
    setActivePage,
    statusFilter,
    setStatusFilter,
    formatCurrency,
    translatedMenuItems,
    translatedPageMeta,
    filteredOrders,
    model,
  }
}
