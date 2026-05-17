import React, { createContext, useContext, useState, useCallback } from 'react'
import CreateOrderModal from '../pages/OrdersPage/CreateOrderModal'

const CreateOrderModalContext = createContext(null)

export function CreateOrderModalProvider({ children, onCreatedRedirect }) {
  const [visible, setVisible] = useState(false)
  const [initialParams, setInitialParams] = useState(null)

  const open = useCallback((params) => {
    setInitialParams(params || null)
    setVisible(true)
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    setInitialParams(null)
  }, [])

  const handleCreated = useCallback(() => {
    setVisible(false)
    setInitialParams(null)
    // notify application that an order was created
    try {
      window.dispatchEvent(new CustomEvent('order:created'))
    } catch (e) {
      // ignore in non-browser env
    }
    if (typeof onCreatedRedirect === 'function') onCreatedRedirect()
  }, [onCreatedRedirect])

  return (
    <CreateOrderModalContext.Provider value={{ open, close }}>
      {children}
      <CreateOrderModal visible={visible} onCancel={close} onCreated={handleCreated} initialParams={initialParams} />
    </CreateOrderModalContext.Provider>
  )
}

export function useCreateOrderModal() {
  const ctx = useContext(CreateOrderModalContext)
  if (!ctx) throw new Error('useCreateOrderModal must be used within CreateOrderModalProvider')
  return ctx
}

export default CreateOrderModalContext
