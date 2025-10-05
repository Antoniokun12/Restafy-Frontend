import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useUsuarioStore } from '../stores/usuarios.js';
import { Notify } from 'quasar';

export const useReporteStore = defineStore('reporte', () => {
    const useUsuario = useUsuarioStore();
    const loading = ref(false);
    const auth = () => ({ headers: { 'x-token': useUsuario.token }, responseType: 'blob' });

    const descargarArqueoPdf = async (fecha, efectivoInicial = 0) => {
        loading.value = true;
        try {
            const { data } = await axios.get('api/reportes/arqueo/pdf', {
                ...auth(),
                params: { fecha, efectivoInicial }
            });
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            return { success: true };
        } catch (e) {
            Notify.create({ type: 'negative', message: 'No se pudo generar el PDF de arqueo' });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    const descargarBalancePdf = async (mes) => {
        loading.value = true;
        try {
            const { data } = await axios.get('api/reportes/balance/pdf', {
                ...auth(),
                params: { mes }
            });
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            return { success: true };
        } catch (e) {
            Notify.create({ type: 'negative', message: 'No se pudo generar el PDF del balance' });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    return { loading, descargarArqueoPdf, descargarBalancePdf };
}, { persist: true });
