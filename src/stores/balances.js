import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useUsuarioStore } from '../stores/usuarios.js';
import { Notify } from 'quasar';

export const useBalanceStore = defineStore('balance', () => {
    const useUsuario = useUsuarioStore();
    const loading = ref(false);
    const balances = ref([]);

    const auth = () => ({ headers: { 'x-token': useUsuario.token } });

    const listar = async () => {
        loading.value = true;
        try {
            const { data } = await axios.get('api/balance/listar', auth());
            balances.value = data.balances || [];
            return data;
        } catch (e) {
            Notify.create({ type: 'negative', message: 'Error al listar balances' });
            return { balances: [] };
        } finally {
            loading.value = false;
        }
    };

    const generar = async (mes) => {
        loading.value = true;
        try {
            const { data } = await axios.post('api/balance/generar', { mes }, auth());
            Notify.create({ type: 'positive', message: 'Balance generado' });
            return { success: true, data };
        } catch (e) {
            const msg = e?.response?.data?.error || 'No se pudo generar el balance';
            Notify.create({ type: 'negative', message: msg });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    const eliminar = async (id) => {
        loading.value = true;
        try {
            await axios.delete(`api/balance/eliminar/${id}`, auth());
            Notify.create({ type: 'positive', message: 'Balance eliminado' });
            return { success: true };
        } catch (e) {
            Notify.create({ type: 'negative', message: 'No se pudo eliminar el balance' });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    return { loading, balances, listar, generar, eliminar };
}, { persist: true });
