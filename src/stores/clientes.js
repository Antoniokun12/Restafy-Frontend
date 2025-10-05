// src/stores/clientes.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from './usuarios.js'
import { Notify } from 'quasar'

export const useClienteStore = defineStore('cliente', () => {
    const useUsuario = useUsuarioStore()
    const loading = ref(false)
    const resultados = ref([])

    const authHeader = () => ({ headers: { 'x-token': useUsuario.token } })

    const buscarPorCedulaLike = async (cedulaLike) => {
        if (!cedulaLike || !cedulaLike.trim()) {
            resultados.value = []
            return { clientes: [] }
        }
        loading.value = true
        try {
            const res = await axios.get('api/cliente/buscar', {
                ...authHeader(),
                params: { cedulaLike }
            })
            resultados.value = res.data?.clientes || []
            return res.data
        } catch (err) {
            console.error(err)
            resultados.value = []
            return { clientes: [] }
        } finally {
            loading.value = false
        }
    }

    const getByCedula = async (cedula) => {
        if (!cedula) return null
        loading.value = true
        try {
            const res = await axios.get(`api/cliente/by-cedula/${cedula}`, authHeader())
            return res.data?.cliente || null
        } catch {
            return null
        } finally {
            loading.value = false
        }
    }

    const crearCliente = async (data) => {
        loading.value = true
        try {
            const res = await axios.post('api/cliente/crear', data, authHeader())
            Notify.create({ type: 'positive', message: 'Cliente creado' })
            return { success: true, data: res.data?.cliente }
        } catch (err) {
            const msg = err.response?.data?.error || 'No se pudo crear el cliente'
            Notify.create({ type: 'negative', message: msg })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const actualizarCliente = async (id, data) => {
        loading.value = true
        try {
            const res = await axios.put(`api/cliente/modificar/${id}`, data, authHeader())
            Notify.create({ type: 'positive', message: 'Cliente actualizado' })
            return { success: true, data: res.data?.cliente }
        } catch {
            Notify.create({ type: 'negative', message: 'No se pudo actualizar el cliente' })
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        resultados,
        buscarPorCedulaLike,
        getByCedula,
        crearCliente,
        actualizarCliente
    }
}, { persist: true })

