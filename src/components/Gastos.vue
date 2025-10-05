<template>
  <div>
    <div class="q-pa-md text-center">
      <div class="text-h2">Gastos</div>

      <q-btn
        label="Agregar Gasto"
        color="primary"
        @click="showForm = true"
        class="q-my-md"
      />
    </div>

    <!-- Tabla -->
    <div class="q-pa-md">
      <q-card>
        <q-card-section>
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="_id"
            flat
            bordered
            square
            dense
            :rows-per-page-options="[0]"
            no-data-label="No hay gastos registrados"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="primary"
                  @click="editarGasto(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  @click="eliminarGasto(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Formulario -->
    <q-dialog v-model="showForm">
      <q-card>
        <q-card-section>
          <q-form @submit.prevent="agregarOEditarGasto">
            <div class="text-h5 text-center q-mb-md">Formulario de Gasto</div>

            <q-input v-model="descripcion" label="Descripción" required />
            <q-input
              v-model.number="monto"
              label="Monto"
              type="number"
              required
            />
            <q-select
              v-model="metodoPago"
              label="Método de Pago"
              :options="metodos"
              required
            />
            <q-input
              v-model="observaciones"
              label="Observaciones"
              type="textarea"
            />

            <div class="q-mt-md text-center">
              <q-btn
                flat
                color="negative"
                label="Cancelar"
                @click="cancelar"
                class="q-mr-sm"
              />
              <q-btn type="submit" color="primary" label="Guardar" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <div v-if="store.loading" class="overlay">
      <q-spinner size="xl" color="primary" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useGastoStore } from "../stores/gastos";
import { useUsuarioStore } from "../stores/usuarios.js";

const $q = useQuasar();
const store = useGastoStore();
const useUsuario = useUsuarioStore();

const showForm = ref(false);
const isEditing = ref(false);
const gastoId = ref(null);

const descripcion = ref("");
const monto = ref(0);
const metodoPago = ref("");
const observaciones = ref("");
const usuarioid = ref("");

const metodos = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

const columns = [
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (row) => new Date(row.fecha).toLocaleDateString(),
  },
  {
    name: "descripcion",
    label: "Descripción",
    align: "center",
    field: "descripcion",
  },
  {
    name: "monto",
    label: "Monto",
    align: "center",
    field: "monto",
    format: (val) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0, 
      }).format(val),
  },
  { name: "metodoPago", label: "Método", align: "center", field: "metodoPago" },
  {
    name: "usuario",
    label: "Registrado por",
    align: "center",
    field: (row) => row.usuarioid?.nombre,
  },
  {
    name: "observaciones",
    label: "Observaciones",
    align: "center",
    field: "observaciones",
  },
  { name: "opciones", label: "Opciones", align: "center" },
];

const rows = ref([]);

const listarGastos = async () => {
  const res = await store.getGastos();
  rows.value = res.gastos;
};

const agregarOEditarGasto = async () => {
  if (!descripcion.value || !monto.value || !metodoPago.value) {
    $q.notify({ type: "negative", message: "Completa los campos requeridos" });
    return;
  }

  const data = {
    descripcion: descripcion.value,
    monto: monto.value,
    metodoPago: metodoPago.value,
    observaciones: observaciones.value,
    usuarioid: useUsuario.usuario?._id,
  };

  const result = gastoId.value
    ? await store.putGasto(gastoId.value, data)
    : await store.postGasto(data);

  if (result.success) {
    listarGastos();
    resetForm();
  }
};

const editarGasto = (gasto) => {
  descripcion.value = gasto.descripcion;
  monto.value = gasto.monto;
  metodoPago.value = gasto.metodoPago;
  observaciones.value = gasto.observaciones;
  gastoId.value = gasto._id;
  isEditing.value = true;
  showForm.value = true;
};

const eliminarGasto = (gasto) => {
  $q.dialog({
    title: "Confirmar",
    message: `¿Estás seguro de eliminar el gasto "${gasto.descripcion}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const res = await store.deleteGasto(gasto._id);
    if (res.success) {
      $q.notify({ type: "positive", message: "Gasto eliminado correctamente" });
      listarGastos();
    } else {
      $q.notify({ type: "negative", message: "Error al eliminar el gasto" });
    }
  });
};

const cancelar = () => resetForm();

const resetForm = () => {
  showForm.value = false;
  isEditing.value = false;
  gastoId.value = null;
  descripcion.value = "";
  monto.value = 0;
  metodoPago.value = "";
  observaciones.value = "";
};

listarGastos();
</script>

<style scoped>
.text-h2 {
  font-weight: bold;
}
.q-card-section {
  padding: 20px;
}
.q-btn {
  margin-right: 5px;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
