import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from '../stores/usuarios.js'
import { Notify } from 'quasar'

export const useFacturaStore = defineStore('factura', () => {
    const useUsuario = useUsuarioStore()
    const loading = ref(false)
    const facturas = ref([])

    const getFacturas = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/factura/listar', {
                headers: { 'x-token': useUsuario.token }
            })
            facturas.value = res.data?.facturas || []
            return { success: true }
        } catch (err) {
            console.error(err)
            Notify.create({ type: 'negative', message: 'Error al obtener facturas' })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    // Abre el PDF en nueva pestaña con blob (mantiene el token)
    const verPdf = async (facturaId) => {
        loading.value = true
        try {
            const res = await axios.get(`api/factura/pdf/${facturaId}`, {
                headers: { 'x-token': useUsuario.token },
                responseType: 'blob'
            })
            const blob = new Blob([res.data], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank', 'noopener,noreferrer')
            setTimeout(() => URL.revokeObjectURL(url), 60_000)
            return { success: true }
        } catch (err) {
            console.error(err)
            Notify.create({ type: 'negative', message: 'No se pudo abrir la factura' })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return { loading, facturas, getFacturas, verPdf }
}, { persist: true })
