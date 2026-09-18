import { useState } from 'react'

export function useStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      console.error('useStorage write error:', e)
    }
  }

  const reset = () => {
    localStorage.removeItem(key)
    setStoredValue(initialValue)
  }

  return [storedValue, setValue, reset]
}
