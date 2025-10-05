import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useUsuarioStore } from '../stores/usuarios.js';
import { Notify } from 'quasar';

export const useNominaStore = defineStore('nomina', () => {
    const useUsuario = useUsuarioStore();
    const loading = ref(false);
    const nominas = ref([]);

    const auth = () => ({ headers: { 'x-token': useUsuario.token } });

    const getNominas = async () => {
        loading.value = true;
        try {
            const { data } = await axios.get('api/nomina/listar', auth());
            nominas.value = data.nominas || [];
            return data;
        } catch (e) {
            Notify.create({ type: 'negative', message: 'Error al listar nóminas' });
            return { nominas: [] };
        } finally {
            loading.value = false;
        }
    };

    const registrarPago = async ({
        empleadoId,
        bonificaciones = 0,
        deducciones = 0,
        inasistencias = 0,
        metodoPago,
        observaciones
    }) => {
        loading.value = true;
        try {
            const { data } = await axios.post(
                'api/nomina/registrar-pago',
                { empleadoId, bonificaciones, deducciones, inasistencias, metodoPago, observaciones },
                auth()
            );
            Notify.create({ type: 'positive', message: 'Pago registrado' });
            return { success: true, data };
        } catch (e) {
            const msg = e?.response?.data?.error || 'No se pudo registrar el pago';
            Notify.create({ type: 'negative', message: msg });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    const getNominaByEmpleado = async (empleadoId) => {
        loading.value = true;
        try {
            const { data } = await axios.get(`api/nomina/empleado/${empleadoId}`, auth());
            return { success: true, data };
        } catch {
            Notify.create({ type: 'negative', message: 'No se pudo cargar la nómina del empleado' });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        nominas,
        getNominas,
        registrarPago,
        getNominaByEmpleado
    };
}, { persist: true });
