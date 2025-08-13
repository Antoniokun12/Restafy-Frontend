import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useUsuarioStore } from "../stores/usuarios.js"
import { Notify } from 'quasar'

export const useEmpleadoStore = defineStore('empleado', () => {

    const useUsuario = useUsuarioStore();
    const loading = ref(false)
    const empleados = ref([])

    const getEmpleados = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/empleado/listar', {
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

    const getEmpleadosActivos = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/empleado/listaractivos', {
                headers: { 'x-token': useUsuario.token }
            })
            empleados.value = res.data.empleadosactivos || []
            return res.data
        } catch (err) {
            console.error(err)
            return err
        } finally {
            loading.value = false
        }
    }

    const getEmpleadosInactivos = async () => {
        loading.value = true
        try {
            const res = await axios.get('api/empleado/listarinactivos', {
                headers: { 'x-token': useUsuario.token }
            })
            empleados.value = res.data.empleadosinactivos || []
            return res.data
        } catch (err) {
            console.error(err)
            return err
        } finally {
            loading.value = false
        }
    }

    const postEmpleado = async (data) => {
        loading.value = true
        try {
            await axios.post('api/empleado/crear', data, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Empleado registrado' })
            return { success: true }
        } catch (err) {
            Notify.create({
                type: 'negative',
                message:
                    err.response?.data?.errors?.[0]?.msg ||
                    'Error al registrar el empleado'
            })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const putEmpleado = async (id, data) => {
        loading.value = true
        try {
            await axios.put(`api/empleado/modificar/${id}`, data, {
                headers: { 'x-token': useUsuario.token }
            })
            Notify.create({ type: 'positive', message: 'Empleado actualizado' })
            return { success: true }
        } catch (err) {
            Notify.create({
                type: 'negative',
                message:
                    err.response?.data?.errors?.[0]?.msg ||
                    'Error al actualizar el empleado'
            })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    const toggleEstadoEmpleado = async (id, activar = true) => {
        loading.value = true
        try {
            const url = activar
                ? `api/empleado/activar/${id}`
                : `api/empleado/desactivar/${id}`

            await axios.put(url, {}, { headers: { 'x-token': useUsuario.token } })
            Notify.create({
                type: 'positive',
                message: activar ? 'Empleado activado' : 'Empleado desactivado'
            })
            return { success: true }
        } catch (err) {
            Notify.create({
                type: 'negative',
                message: 'Error al cambiar estado del empleado'
            })
            console.error(err)
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    return {
        empleados,
        loading,
        getEmpleados,
        getEmpleadosActivos,
        getEmpleadosInactivos,
        postEmpleado,
        putEmpleado,
        toggleEstadoEmpleado
    }
},
    { persist: true }
)
