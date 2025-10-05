// src/stores/ventas.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from '../stores/usuarios.js'
import { Notify } from 'quasar'

export const useVentaStore = defineStore('venta', () => {
    const useUsuario = useUsuarioStore()
    const loading = ref(false)
    const ventas = ref([])

    const getVentas = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/venta/listar', {
                headers: { 'x-token': useUsuario.token }
            })
            ventas.value = res.data?.ventas || []
            return { success: true }
        } catch (err) {
            console.error(err)
            Notify.create({ type: 'negative', message: 'Error al obtener ventas' })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const getVenta = async (id) => {
        loading.value = true
        try {
            const res = await axios.get(`api/venta/ver/${id}`, {
                headers: { 'x-token': useUsuario.token }
            })
            return { success: true, data: res.data?.venta || null }
        } catch (err) {
            console.error(err)
            Notify.create({ type: 'negative', message: 'No se pudo cargar la venta' })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const deleteVenta = async (id) => {
        loading.value = true
        try {
            await axios.delete(`api/venta/eliminar/${id}`, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Venta eliminada' })
            // optimista: quitar del array local
            ventas.value = ventas.value.filter(v => v._id !== id)
            return { success: true }
        } catch (err) {
            console.error(err)
            Notify.create({ type: 'negative', message: 'No se pudo eliminar la venta' })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return { loading, ventas, getVentas, getVenta, deleteVenta }
}, { persist: true })
