// Simple global pub-sub store for sharing photos across pages
const store = {
  photos: [],
  listeners: new Set(),

  set(photos) {
    this.photos = typeof photos === 'function' ? photos(this.photos) : photos
    this.listeners.forEach(fn => fn(this.photos))
  },

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
}

import { useState, useEffect } from 'react'

export function usePhotos() {
  const [photos, setLocal] = useState(store.photos)

  useEffect(() => {
    const unsub = store.subscribe(setLocal)
    return unsub
  }, [])

  const setPhotos = (p) => store.set(p)
  return [photos, setPhotos]
}
