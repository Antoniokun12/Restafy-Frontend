<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="text-h2 col-grow">Nómina</div>

      <q-select
        v-model="filtroEmpleado"
        :options="empleadosOptions"
        option-label="nombre"
        option-value="_id"
        emit-value
        map-options
        clearable
        dense
        filled
        label="Filtrar por empleado"
        class="w-300"
      />
      <q-btn color="primary" icon="refresh" @click="cargar" />
      <q-btn color="positive" icon="add" label="Registrar pago" @click="abrirPago()" />
    </div>

    <q-card>
      <q-card-section>
        <q-table
          :rows="filtrados"
          :columns="columns"
          row-key="_id"
          flat
          bordered
          square
          dense
          :rows-per-page-options="[0]"
          :loading="nominaStore.loading"
          no-data-label="Sin nóminas registradas"
        >
          <template #body-cell-acciones="props">
            <q-td :props="props">
              <q-btn dense flat round color="primary" icon="visibility" @click="verHistorial(props.row)" />
              <q-btn
                dense flat round color="positive" icon="add"
                class="q-ml-xs"
                @click="abrirPago(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: registrar pago -->
    <q-dialog v-model="showPago">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">Registrar pago</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="form.empleadoId"
            :options="empleadosOptions"
            option-label="nombre"
            option-value="_id"
            emit-value
            map-options
            dense
            filled
            label="Empleado"
            :rules="[(v)=>!!v || 'Requerido']"
            class="q-mb-sm"
          />
          <q-input v-model.number="form.bonificaciones" type="number" dense filled label="Bonificaciones" />
          <q-input v-model.number="form.deducciones" type="number" dense filled label="Deducciones" class="q-mt-sm" />
          <q-input v-model.number="form.inasistencias" type="number" dense filled label="Inasistencias (días)" class="q-mt-sm" />
          <q-select
            v-model="form.metodoPago"
            :options="metodos"
            dense
            filled
            label="Método de pago"
            class="q-mt-sm"
            :rules="[(v)=>!!v || 'Requerido']"
          />
          <q-input v-model="form.observaciones" type="textarea" dense filled label="Observaciones" class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="negative" label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" :loading="nominaStore.loading" @click="guardarPago" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: historial -->
    <q-dialog v-model="showHistorial">
      <q-card style="max-width: 720px">
        <q-card-section>
          <div class="text-h6 text-center">Historial de pagos</div>
          <div class="text-caption text-grey-7 text-center">
            {{ seleccionado?.empleadoId?.nombre }} — Salario base: {{ moneda(seleccionado?.salarioBase) }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list bordered separator v-if="seleccionado?.pagos?.length">
            <q-item v-for="(p, i) in seleccionado.pagos.slice().reverse()" :key="i">
              <q-item-section>
                <div class="text-subtitle2">
                  {{ new Date(p.fechaPago).toLocaleString() }} — {{ p.metodoPago }}
                </div>
                <div class="text-caption">
                  Bonif: {{ moneda(p.bonificaciones) }} · Ded: {{ moneda(p.deducciones) }} ·
                  Inasist: {{ p.inasistencias }} día(s)
                </div>
              </q-item-section>
              <q-item-section side top>
                <div class="text-subtitle2">{{ moneda(p.totalPagado) }}</div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-7">Sin pagos registrados.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div v-if="nominaStore.loading" class="overlay">
      <q-spinner size="xl" color="primary" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { useNominaStore } from '../stores/nomina.js';
import { useUsuarioStore } from '../stores/usuarios.js';

const $q = useQuasar();
const nominaStore = useNominaStore();
const useUsuario = useUsuarioStore();

const empleados = ref([]);
const filtroEmpleado = ref(null);

const empleadosOptions = computed(() => empleados.value);

const columns = [
  { name: 'empleado', label: 'Empleado', align: 'left', field: (r) => r.empleadoId?.nombre || '-' },
  { name: 'documento', label: 'Documento', align: 'left', field: (r) => r.empleadoId?.documento || '-' },
  { name: 'cargo', label: 'Cargo', align: 'left', field: (r) => r.empleadoId?.cargo || '-' },
  { name: 'salario', label: 'Salario base', align: 'right', field: (r) => moneda(r.salarioBase) },
  {
    name: 'ultimo',
    label: 'Último pago',
    align: 'right',
    field: (r) => {
      const p = (r.pagos || [])[r.pagos.length - 1];
      return p ? `${new Date(p.fechaPago).toLocaleDateString()} · ${moneda(p.totalPagado)}` : '—';
    }
  },
  { name: 'acciones', label: 'Acciones', align: 'center' }
];

const filtrados = computed(() => {
  if (!filtroEmpleado.value) return nominaStore.nominas || [];
  return (nominaStore.nominas || []).filter(n => String(n.empleadoId?._id) === String(filtroEmpleado.value));
});

const showPago = ref(false);
const showHistorial = ref(false);
const seleccionado = ref(null);

const form = ref({
  empleadoId: null,
  bonificaciones: 0,
  deducciones: 0,
  inasistencias: 0,
  metodoPago: null,
  observaciones: ''
});
const metodos = ['Efectivo', 'Transferencia'];

function abrirPago(row = null) {
  form.value = {
    empleadoId: row ? row.empleadoId?._id : null,
    bonificaciones: 0,
    deducciones: 0,
    inasistencias: 0,
    metodoPago: null,
    observaciones: ''
  };
  showPago.value = true;
}

async function guardarPago() {
  if (!form.value.empleadoId || !form.value.metodoPago) {
    $q.notify({ type: 'warning', message: 'Empleado y método de pago son requeridos' });
    return;
  }
  const r = await nominaStore.registrarPago(form.value);
  if (r.success) {
    showPago.value = false;
    await cargar();
  }
}

function verHistorial(row) {
  seleccionado.value = row;
  showHistorial.value = true;
}

async function cargarEmpleados() {
  try {
    const { data } = await axios.get('api/empleado/listar', {
      headers: { 'x-token': useUsuario.token }
    });
    empleados.value = data.empleados || [];
  } catch {
    empleados.value = [];
  }
}

async function cargar() {
  await Promise.all([cargarEmpleados(), nominaStore.getNominas()]);
}

function moneda(n = 0) {
  return '$ ' + Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

onMounted(cargar);
</script>

<style scoped>
.w-300 { width: 300px; }
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.text-h2 {
  font-weight: bold;
}
</style>
