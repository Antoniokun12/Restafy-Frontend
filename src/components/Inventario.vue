<template>
  <div>
    <div class="q-pa-md text-center">
      <div class="text-h2">Inventario</div>

      <q-btn
        label="Agregar"
        color="primary"
        @click="showForm = true"
        class="q-my-md"
      />

      <q-btn-dropdown
        color="primary"
        icon="filter_list"
        label="Filtrar"
        class="q-ml-sm"
      >
        <q-list>
          <q-item clickable v-ripple @click="listarInventario">
            <q-item-section>Listar Todos</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="listarActivos">
            <q-item-section>Listar Activos</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="listarInactivos">
            <q-item-section>Listar Inactivos</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

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
            no-data-label="No hay inventario registrado"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="primary"
                  @click="editarInventario(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="toggle_on"
                  color="green"
                  v-if="props.row.estado === true"
                  @click="desactivarInventario(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="toggle_off"
                  color="red"
                  v-if="props.row.estado === false"
                  @click="activarInventario(props.row)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip :color="props.row.estado ? 'green' : 'red'" dark>
                  {{ props.row.estado ? "Activo" : "Inactivo" }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Formulario -->
    <q-dialog v-model="showForm">
      <q-card style="min-width: 400px">
        <q-card-section>
          <q-form @submit.prevent="agregarOEditarInventario">
            <div class="text-h5 text-center q-mb-md">
              Formulario de Inventario
            </div>

            <q-input v-model="nombre" label="Nombre" required />
            <q-input v-model="unidad" label="Unidad" required />
            <q-input
              v-model.number="cantidad"
              label="Cantidad"
              type="number"
              required
            />
            <q-input
              v-model="observacion"
              label="Observación"
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
import { useInventarioStore } from "../stores/inventario";

const $q = useQuasar();
const store = useInventarioStore();

const showForm = ref(false);
const isEditing = ref(false);
const inventarioId = ref(null);

const nombre = ref("");
const unidad = ref("");
const cantidad = ref(0);
const observacion = ref("");

const columns = [
  { name: "nombre", label: "Nombre", align: "center", field: "nombre" },
  { name: "unidad", label: "Unidad", align: "center", field: "unidad" },
  { name: "cantidad", label: "Cantidad", align: "center", field: "cantidad" },
  {
    name: "observacion",
    label: "Observación",
    align: "center",
    field: "observacion",
  },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  { name: "opciones", label: "Opciones", align: "center" },
];

const rows = ref([]);

const listarInventario = async () => {
  const res = await store.getInventarios();
  rows.value = res.inventarios;
};

const listarActivos = async () => {
  const res = await store.getInventariosActivos();
  rows.value = res.activados;
};

const listarInactivos = async () => {
  const res = await store.getInventariosInactivos();
  rows.value = res.desactivados;
};

const agregarOEditarInventario = async () => {
  if (!nombre.value || !unidad.value || cantidad.value < 0) {
    $q.notify({
      type: "negative",
      message: "Completa todos los campos requeridos",
    });
    return;
  }

  const data = {
    nombre: nombre.value,
    unidad: unidad.value,
    cantidad: cantidad.value,
    observacion: observacion.value,
  };

  const result = inventarioId.value
    ? await store.putInventario(inventarioId.value, data)
    : await store.postInventario(data);

  if (result.success) {
    listarInventario();
    resetForm();
  }
};

const editarInventario = (item) => {
  nombre.value = item.nombre;
  unidad.value = item.unidad;
  cantidad.value = item.cantidad;
  observacion.value = item.observacion;
  inventarioId.value = item._id;
  isEditing.value = true;
  showForm.value = true;
};

const activarInventario = async (item) => {
  await store.toggleEstadoInventario(item._id, true);
  listarInventario();
};

const desactivarInventario = async (item) => {
  await store.toggleEstadoInventario(item._id, false);
  listarInventario();
};

const cancelar = () => resetForm();

const resetForm = () => {
  showForm.value = false;
  isEditing.value = false;
  inventarioId.value = null;
  nombre.value = "";
  unidad.value = "";
  cantidad.value = 0;
  observacion.value = "";
};

listarInventario();
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
