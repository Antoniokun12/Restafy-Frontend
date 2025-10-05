<template>
  <div>
    <div class="q-pa-md text-center">
      <div class="text-h2">Usuarios</div>

      <q-btn
        label="Agregar Usuario"
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
          <q-item clickable v-ripple @click="listarUsuarios">
            <q-item-section>Listar Todos</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="listarUsuariosActivos">
            <q-item-section>Listar Activos</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="listarUsuariosInactivos">
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
            no-data-label="No hay usuarios"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="primary"
                  @click="editarUsuario(props.row)"
                />

                <q-btn
                  flat
                  dense
                  round
                  icon="toggle_on"
                  color="green"
                  v-if="props.row.estado === 0"
                  @click="activarUsuario(props.row)"
                />

                <q-btn
                  flat
                  dense
                  round
                  icon="toggle_off"
                  :color="props.row._id === authUserId ? 'grey-6' : 'red'"
                  :disable="props.row._id === authUserId"
                  v-if="props.row.estado === 1"
                  @click="desactivarUsuario(props.row)"
                >
                  <q-tooltip v-if="props.row._id === authUserId">
                    No puedes desactivar tu propia cuenta
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip :color="props.row.estado === 1 ? 'green' : 'red'" dark>
                  {{ props.row.estado === 1 ? "Activo" : "Inactivo" }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialogo de Formulario -->
    <q-dialog v-model="showForm">
      <q-card>
        <q-card-section>
          <!-- NUEVO: ref="formRef" para poder validar -->
          <q-form ref="formRef" @submit.prevent="agregarOEditarUsuario">
            <div class="text-h5 text-center q-mb-md">Formulario de Usuario</div>

            <q-input v-model="nombre" label="Nombre" required />

            <q-input
              v-model="email"
              label="Correo electrónico"
              type="email"
              required
            />

            <q-input
              v-if="!isEditing"
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              :rules="passwordRules"
              lazy-rules
              hide-bottom-space
              required
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="togglePasswordVisibility"
                />
              </template>
            </q-input>

            <q-select v-model="rol" label="Rol" :options="roles" required />

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

    <div v-if="useUsuarios.loading" class="overlay">
      <q-spinner size="xl" color="primary" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useUsuarioStore } from "../stores/usuarios";

const $q = useQuasar();
const useUsuarios = useUsuarioStore();

const showForm = ref(false);
const isEditing = ref(false);
const showPassword = ref(false);

const formRef = ref(null); // NUEVO: ref del formulario

const nombre = ref("");
const email = ref("");
const password = ref("");
const rol = ref("");
const usuarioId = ref(null);

const roles = ["Administrador", "Mesero", "Cocinero", "Cajero", "Contador"];

const columns = [
  { name: "nombre", label: "Nombre", align: "center", field: "nombre" },
  { name: "email", label: "Email", align: "center", field: "email" },
  { name: "rol", label: "Rol", align: "center", field: "rol" },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  { name: "opciones", label: "Opciones", align: "center" },
];

const rows = ref([]);

// NUEVO: reglas para password cuando se crea (no en edición)
const passwordRules = [
  (val) => !!val || "La contraseña es obligatoria",
  (val) =>
    (val && val.length >= 6) ||
    "La contraseña debe tener al menos 6 caracteres",
];

const listarUsuarios = async () => {
  const res = await useUsuarios.getUsuarios();
  rows.value = res.usuarios;
};

const listarUsuariosActivos = async () => {
  const res = await useUsuarios.getUsuariosActivos();
  rows.value = res.activados;
};

const listarUsuariosInactivos = async () => {
  const res = await useUsuarios.getUsuariosInactivos();
  rows.value = res.desactivados;
};

const agregarOEditarUsuario = async () => {
  // Valida campos vía rules (solo valida los visibles; password se valida solo al crear)
  const ok = await formRef.value?.validate?.();
  if (!ok) {
    $q.notify({
      type: "warning",
      message: "Revisa los campos del formulario.",
    });
    return;
  }

  // Guardas datos
  const data = { nombre: nombre.value, email: email.value, rol: rol.value };
  if (!isEditing.value) data.password = password.value;

  try {
    if (usuarioId.value) {
      await useUsuarios.putUsuario(usuarioId.value, data);
    } else {
      await useUsuarios.postUsuario(data);
    }
    listarUsuarios();
    resetForm();
  } catch (err) {
    $q.notify({ type: "negative", message: "Error al guardar usuario" });
  }
};

const editarUsuario = (usuario) => {
  nombre.value = usuario.nombre;
  email.value = usuario.email;
  rol.value = usuario.rol;
  usuarioId.value = usuario._id;
  isEditing.value = true;
  showForm.value = true;
};

const activarUsuario = async (usuario) => {
  await useUsuarios.toggleEstadoUsuario(usuario._id, true);
  listarUsuarios();
};

// id del usuario autenticado para protección
const authUserId = computed(
  () => useUsuarios.usuario?._id || useUsuarios.uid || null
);

const desactivarUsuario = async (usuario) => {
  if (usuario._id === authUserId.value) {
    $q.notify({
      type: "warning",
      message: "No puedes desactivarte a ti mismo.",
    });
    return;
  }

  $q.dialog({
    title: "Confirmar",
    message: `¿Desactivar al usuario "${usuario.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await useUsuarios.toggleEstadoUsuario(usuario._id, false);
    listarUsuarios();
  });
};

const cancelar = () => resetForm();
const togglePasswordVisibility = () =>
  (showPassword.value = !showPassword.value);

const resetForm = () => {
  showForm.value = false;
  isEditing.value = false;
  nombre.value = "";
  email.value = "";
  password.value = "";
  rol.value = "";
  usuarioId.value = null;
};

listarUsuarios();
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
