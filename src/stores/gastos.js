import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from "../stores/usuarios.js"
import { Notify } from 'quasar'

export const useGastoStore = defineStore('gasto', () => {

    const useUsuario = useUsuarioStore();
    const gastos = ref([])
    const loading = ref(false)


    const getGastos = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/gasto/listar', {
                headers: { 'x-token': useUsuario.token }
            })
            gastos.value = res.data.gastos || []
            return res.data
        } catch (err) {
            console.error(err)
            Notify.create({ type: 'negative', message: 'Error al obtener gastos' })
            return err
        } finally {
            loading.value = false
        }
    }

    
    const postGasto = async (data) => {
        loading.value = true
        try {
            await axios.post('api/gasto/crear', data, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Gasto registrado' })
            return { success: true }
        } catch (err) {
            Notify.create({ type: 'negative', message: 'Error al registrar gasto' })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const putGasto = async (id, data) => {
        loading.value = true
        try {
            await axios.put(`api/gasto/modificar/${id}`, data, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Gasto actualizado' })
            return { success: true }
        } catch (err) {
            Notify.create({ type: 'negative', message: 'Error al actualizar gasto' })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const deleteGasto = async (id) => {
        loading.value = true
        try {
            await axios.delete(`api/gasto/eliminar/${id}`, {
                headers: { 'x-token': useUsuario.token }
            })
            // Notify.create({ type: 'positive', message: 'Gasto eliminado' })
            return { success: true }
        } catch (err) {
            Notify.create({ type: 'negative', message: 'Error al eliminar gasto' })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return {

        gastos,
        loading,

        getGastos,
        postGasto,
        putGasto,
        deleteGasto
    }
},
    { persist: true }
)
