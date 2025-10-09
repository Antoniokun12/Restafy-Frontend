// src/stores/menu.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from '../stores/usuarios.js'

export const useMenuStore = defineStore('menu', () => {
  const useUsuario = useUsuarioStore()
  const loading = ref(false)
  const items = ref([])

  const API = import.meta.env.VITE_API_URL || ''

  const getDisponibles = async () => {
    loading.value = true
    try {
      const headers = {}
      // ❓ Si la ruta ES privada, descomenta la línea:
      headers['x-token'] = useUsuario.token

      const res = await axios.get(`${API}api/menu/disponibles`, { headers })
      items.value = Array.isArray(res.data?.productos) ? res.data.productos : []
      return res.data
    } catch (err) {
      console.error('[menu/getDisponibles] ', err?.response?.data || err.message)
      items.value = []
      return { productos: [] }
    } finally {
      loading.value = false
    }
  }
  const getDisponiblesO = async () => {
    loading.value = true
    try {
      const headers = {}
      // ❓ Si la ruta ES privada, descomenta la línea:
      headers['x-token'] = useUsuario.token
      const res = await axios.get(`${API}api/menu/online/disponibles`, { headers })
      items.value = Array.isArray(res.data?.productos) ? res.data.productos : []
      return res.data
    } catch (err) {
      console.error('[menu/getDisponiblesO] ', err?.response?.data || err.message)
      items.value = []
      return { productos: [] }
    } finally {
      loading.value = false
    }
  }

  return { items, loading, getDisponibles, getDisponiblesO }
}, { persist: true })
