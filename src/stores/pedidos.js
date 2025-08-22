import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from '../stores/usuarios.js'
import { Notify } from 'quasar'

export const usePedidoStore = defineStore('pedido', () => {
    const useUsuario = useUsuarioStore()
    const loading = ref(false)
    const pedidos = ref([])

    const getPedidos = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/pedido/listar', {
                headers: { 'x-token': useUsuario.token }
            })
            pedidos.value = res.data.pedidos || []
            return res.data
        } catch (err) {
            console.error(err)
            return err
        } finally {
            loading.value = false
        }
    }

    const crearPedido = async (payload) => {
        // payload: { tipoPedido, estado, metodoPago?, mesaAsignada?, clienteNombre?, clienteTelefono?, direccionEntrega?, detalles:[] }
        loading.value = true
        try {
            const res = await axios.post('api/pedido/crear', payload, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Pedido creado' })
            return { success: true, data: res.data }
        } catch (err) {
            Notify.create({ type: 'negative', message: 'Error al crear pedido' })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const cambiarEstado = async (id, estado) => {
        loading.value = true
        try {
            await axios.put(`api/pedido/estado/${id}`, { estado }, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Estado actualizado' })
            return { success: true }
        } catch (err) {
            Notify.create({ type: 'negative', message: 'Error al actualizar estado' })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const cerrarPedido = async (id, { metodoPago, clienteNombre, clienteTelefono } = {}) => {
        loading.value = true
        try {
            const res = await axios.post(`api/pedido/cerrar/${id}`, { metodoPago, clienteNombre, clienteTelefono }, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Pedido cerrado' })
            return { success: true, data: res.data }
        } catch (err) {
            Notify.create({ type: 'negative', message: 'No se pudo cerrar el pedido' })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return { pedidos, loading, getPedidos, crearPedido, cambiarEstado, cerrarPedido }
}, { persist: true })
