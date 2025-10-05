<template>
  <div>
    <div class="q-pa-md text-center">
      <div class="text-h2">Empleados</div>

      <q-btn
        label="Agregar Empleado"
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
          <q-item clickable v-ripple @click="listarEmpleados">
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
            dense
            :rows-per-page-options="[0]"
            no-data-label="No hay empleados"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="primary"
                  @click="editarEmpleado(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="toggle_on"
                  color="green"
                  v-if="props.row.estado === true"
                  @click="desactivarEmpleado(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="toggle_off"
                  color="red"
                  v-if="props.row.estado === false"
                  @click="activarEmpleado(props.row)"
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

    <q-dialog v-model="showForm">
      <q-card>
        <q-card-section>
          <q-form @submit.prevent="agregarOEditarEmpleado">
            <div class="text-h5 text-center q-mb-md">
              Formulario de Empleado
            </div>

            <q-input v-model="nombre" label="Nombre" required />
            <q-input v-model="documento" label="Documento" required />
            <q-input v-model="correo" label="Correo" type="email" required />
            <q-input v-model="telefono" label="Teléfono" required />
            <q-input v-model="direccion" label="Dirección" required />
            <q-input v-model="cargo" label="Cargo" required />
            <q-input v-model="salario" label="Salario" type="number" required />
            <q-input
              v-model="fechaNacimiento"
              label="Fecha Nacimiento"
              type="date"
              required
            />
            <q-input
              v-model="fechaContratacion"
              label="Fecha Contratación"
              type="date"
              required
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
import { useEmpleadoStore } from "../stores/empleados";

const $q = useQuasar();
const store = useEmpleadoStore();

const showForm = ref(false);
const isEditing = ref(false);
const empleadoId = ref(null);

const nombre = ref("");
const documento = ref("");
const correo = ref("");
const telefono = ref("");
const direccion = ref("");
const cargo = ref("");
const salario = ref(0);
const fechaNacimiento = ref("");
const fechaContratacion = ref("");

const columns = [
  { name: "nombre", label: "Nombre", align: "center", field: "nombre" },
  {
    name: "documento",
    label: "Documento",
    align: "center",
    field: "documento",
  },
  { name: "correo", label: "Correo", align: "center", field: "correo" },
  { name: "telefono", label: "Teléfono", align: "center", field: "telefono" },
  { name: "cargo", label: "Cargo", align: "center", field: "cargo" },
  {
    name: "salario",
    label: "Salario",
    align: "center",
    field: "salario",
    format: (val) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(val),
  },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  { name: "opciones", label: "Opciones", align: "center" },
];

const rows = ref([]);

const listarEmpleados = async () => {
  const res = await store.getEmpleados();
  rows.value = res.empleados;
};

const listarActivos = async () => {
  const res = await store.getEmpleadosActivos();
  rows.value = res;
};

const listarInactivos = async () => {
  const res = await store.getEmpleadosInactivos();
  rows.value = res.desactivados;
};

const agregarOEditarEmpleado = async () => {
  if (
    !nombre.value ||
    !documento.value ||
    !correo.value ||
    !telefono.value ||
    !direccion.value ||
    !cargo.value ||
    !fechaNacimiento.value ||
    !fechaContratacion.value
  ) {
    $q.notify({
      type: "negative",
      message: "Completa todos los campos requeridos",
    });
    return;
  }

  const data = {
    nombre: nombre.value,
    documento: documento.value,
    correo: correo.value,
    telefono: telefono.value,
    direccion: direccion.value,
    fechaNacimiento: fechaNacimiento.value,
    fechaContratacion: fechaContratacion.value,
    cargo: cargo.value,
    salario: salario.value,
  };

  const result = empleadoId.value
    ? await store.putEmpleado(empleadoId.value, data)
    : await store.postEmpleado(data);

  if (result.success) {
    listarEmpleados();
    resetForm();
  }
};

const editarEmpleado = (empleado) => {
  nombre.value = empleado.nombre;
  documento.value = empleado.documento;
  correo.value = empleado.correo;
  telefono.value = empleado.telefono;
  direccion.value = empleado.direccion;
  cargo.value = empleado.cargo;
  salario.value = empleado.salario;
  fechaNacimiento.value = empleado.fechaNacimiento?.split("T")[0];
  fechaContratacion.value = empleado.fechaContratacion?.split("T")[0];
  empleadoId.value = empleado._id;
  isEditing.value = true;
  showForm.value = true;
};

const activarEmpleado = async (empleado) => {
  await store.toggleEstadoEmpleado(empleado._id, true);
  listarEmpleados();
};

const desactivarEmpleado = async (empleado) => {
  await store.toggleEstadoEmpleado(empleado._id, false);
  listarEmpleados();
};

const cancelar = () => resetForm();

const resetForm = () => {
  showForm.value = false;
  isEditing.value = false;
  empleadoId.value = null;
  nombre.value = "";
  documento.value = "";
  correo.value = "";
  telefono.value = "";
  direccion.value = "";
  cargo.value = "";
  salario.value = 0;
  fechaNacimiento.value = "";
  fechaContratacion.value = "";
};

listarEmpleados();
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
