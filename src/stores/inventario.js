import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from '../stores/usuarios.js'
import { Notify } from 'quasar'

export const useInventarioStore = defineStore('inventario', () => {
    const useUsuario = useUsuarioStore()
    const loading = ref(false)
    const inventarios = ref([])

    const getInventarios = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/inventario/listar', {
                headers: { 'x-token': useUsuario.token }
            })
            return res.data
        } catch (err) {
            console.error(err)
            return err
        } finally {
            loading.value = false
        }
    }

    const getInventariosActivos = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/inventario/listaractivos', {
                headers: { 'x-token': useUsuario.token }
            })
            inventarios.value = res.data.inventarios || []
            return res.data
        } catch (err) {
            console.error(err)
            return err
        } finally {
            loading.value = false
        }
    }

    const getInventariosInactivos = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/inventario/listarinactivos', {
                headers: { 'x-token': useUsuario.token }
            })
            inventarios.value = res.data.inventarios || []
            return res.data
        } catch (err) {
            console.error(err)
            return err
        } finally {
            loading.value = false
        }
    }

    const postInventario = async (data) => {
        loading.value = true
        try {
            await axios.post('api/inventario/crear', data, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Inventario registrado' })
            return { success: true }
        } catch (err) {
            Notify.create({
                type: 'negative',
                message:
                    err.response?.data?.errors?.[0]?.msg ||
                    'Error al registrar inventario'
            })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const putInventario = async (id, data) => {
        loading.value = true
        try {
            await axios.put(`api/inventario/modificar/${id}`, data, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Inventario actualizado' })
            return { success: true }
        } catch (err) {
            Notify.create({
                type: 'negative',
                message:
                    err.response?.data?.errors?.[0]?.msg ||
                    'Error al actualizar inventario'
            })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const toggleEstadoInventario = async (id, activar = true) => {
        loading.value = true
        try {
            const url = activar
                ? `api/inventario/activar/${id}`
                : `api/inventario/desactivar/${id}`

            await axios.put(url, {}, {
                headers: { 'x-token': useUsuario.token }
            })

            Notify.create({
                type: 'positive',
                message: activar ? 'Inventario activado' : 'Inventario desactivado'
            })

            return { success: true }
        } catch (err) {
            Notify.create({
                type: 'negative',
                message: 'Error al cambiar estado del inventario'
            })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return {
        inventarios,
        loading,
        getInventarios,
        getInventariosActivos,
        getInventariosInactivos,
        postInventario,
        putInventario,
        toggleEstadoInventario
    }
}, { persist: true })
