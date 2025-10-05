<template>
  <div>
    <div class="q-pa-md text-center">
      <div class="text-h2">Productos</div>

      <q-btn
        label="Agregar Producto"
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
          <q-item clickable v-ripple @click="listarTodos">
            <q-item-section>Listar Todos</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="listarDisponibles">
            <q-item-section>Disponibles</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="listarNoDisponibles">
            <q-item-section>No disponibles</q-item-section>
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
            no-data-label="No hay productos"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="primary"
                  @click="editarProducto(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  :icon="props.row.disponible ? 'toggle_on' : 'toggle_off'"
                  :color="props.row.disponible ? 'green' : 'red'"
                  @click="cambiarDisponibilidad(props.row)"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-foto="props">
              <q-td :props="props">
                <img
                  v-if="props.row.foto"
                  :src="props.row.foto"
                  alt="foto"
                  style="max-width: 150px; border-radius: 4px"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialogo Formulario -->
    <q-dialog v-model="showForm">
      <q-card>
        <q-card-section>
          <q-form @submit.prevent="agregarOEditarProducto">
            <div class="text-h5 text-center q-mb-md">Producto</div>

            <q-input v-model="nombre" label="Nombre" required />
            <q-input
              v-model.number="precio"
              label="Precio"
              type="number"
              required
            />

            <q-select
              v-model="tipo"
              :options="['comida', 'bebida', 'postre']"
              label="Tipo"
              required
            />

            <q-input
              v-model="componentes"
              label="Componentes"
              type="textarea"
            />

            <!-- Drag & Drop / URL de imagen -->
            <div class="q-mb-md">
              <div class="text-subtitle2">Foto</div>
              <div
                class="image-uploader q-pa-sm"
                @dragover.prevent
                @drop.prevent="onDrop"
              >
                <div v-if="preview" class="preview">
                  <img :src="preview" alt="preview" class="preview-img" />
                  <div
                    class="row items-center q-gutter-sm"
                    style="margin-top: 8px"
                  >
                    <q-btn dense flat icon="close" @click="clearImage" />
                    <div class="text-caption">Vista previa</div>
                  </div>
                </div>
                <div v-else class="placeholder">
                  <div class="row items-center q-gutter-sm">
                    <p style="margin: 0">Arrastra una imagen o pega URL</p>
                  </div>
                  <div class="row q-gutter-sm">
                    <q-input
                      v-model="fotoUrl"
                      label="URL de la imagen"
                      @blur="setFromUrl"
                      clearable
                      dense
                    />
                    <q-btn
                      label="Seleccionar archivo"
                      @click="$refs.fileInput.click()"
                      dense
                    />
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept="image/*"
                    @change="onFileChange"
                  />
                </div>
              </div>
            </div>

            <q-toggle v-model="disponible" label="Disponible" />

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
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useProductoStore } from "../stores/productos";
import axios from "axios";

const $q = useQuasar();
const store = useProductoStore();

const showForm = ref(false);
const isEditing = ref(false);
const productoId = ref(null);

const nombre = ref("");
const precio = ref(0);
const tipo = ref("");
const componentes = ref("");
const disponible = ref(true);

// imagen
const fotoUrl = ref("");
const preview = ref(null);
const archivo = ref(null);

const columns = [
  { name: "nombre", label: "Nombre", align: "center", field: "nombre" },
  {
    name: "precio",
    label: "Precio",
    align: "center",
    field: "precio",
    format: (val) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(val),
  },
  { name: "tipo", label: "Tipo", align: "center", field: "tipo" },
  {
    name: "componentes",
    label: "Componentes",
    align: "center",
    field: "componentes",
  },
  { name: "foto", label: "Foto", align: "center", field: "foto" },
  { name: "opciones", label: "Opciones", align: "center" },
];

const rows = ref([]);

const listarTodos = async () => {
  const res = await store.getProductos();
  rows.value = res.productos || [];
};

const listarDisponibles = async () => {
  const res = await store.getProductosDisponibles();
  rows.value = res.productos || [];
};

const listarNoDisponibles = async () => {
  const res = await store.getProductosNoDisponibles();
  rows.value = res.productos || [];
};

const agregarOEditarProducto = async () => {
  if (!nombre.value || precio.value <= 0 || !tipo.value) {
    $q.notify({
      type: "negative",
      message: "Completa los campos obligatorios",
    });
    return;
  }

  let fotoFinal = "";

  if (archivo.value) {
    const formData = new FormData();
    formData.append("foto", archivo.value);
    try {
      const res = await axios.post(
        "https://restafy-backend.onrender.com/api/upload/imagen",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-token": store.token,
          },
        }
      );
      fotoFinal = res.data.url;
    } catch (err) {
      $q.notify({ type: "negative", message: "Error al subir la imagen" });
      console.error("Error subida imagen:", err);
      return;
    }
  } else if (fotoUrl.value) {
    fotoFinal = fotoUrl.value;
  }

  const data = {
    nombre: nombre.value,
    precio: precio.value,
    tipo: tipo.value,
    componentes: componentes.value,
    disponible: disponible.value,
    foto: fotoFinal,
  };

  console.log(data);

  const result = productoId.value
    ? await store.putProducto(productoId.value, data)
    : await store.postProducto(data);

  if (result.success) {
    listarTodos();
    resetForm();
  }
};

const editarProducto = (p) => {
  nombre.value = p.nombre;
  precio.value = p.precio;
  tipo.value = p.tipo;
  componentes.value = p.componentes;
  disponible.value = p.disponible;
  productoId.value = p._id;
  preview.value = p.foto || null;
  fotoUrl.value = p.foto || "";
  isEditing.value = true;
  showForm.value = true;
};

const cambiarDisponibilidad = async (p) => {
  await store.toggleDisponibilidad(p._id, !p.disponible);
  listarTodos();
};

const cancelar = () => resetForm();

const resetForm = () => {
  showForm.value = false;
  isEditing.value = false;
  productoId.value = null;
  nombre.value = "";
  precio.value = 0;
  tipo.value = "";
  componentes.value = "";
  disponible.value = true;
  preview.value = null;
  fotoUrl.value = "";
  archivo.value = null;
};

function onDrop(e) {
  const file = e.dataTransfer.files[0];
  handleFile(file);
}

function onFileChange(e) {
  const file = e.target.files[0];
  handleFile(file);
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    $q.notify({ type: "negative", message: "Solo se permiten imágenes." });
    return;
  }
  archivo.value = file;
  const reader = new FileReader();
  reader.onload = () => {
    preview.value = reader.result;
    fotoUrl.value = "";
  };
  reader.readAsDataURL(file);
}

function setFromUrl() {
  if (fotoUrl.value) {
    preview.value = fotoUrl.value;
    archivo.value = null;
  }
}

function clearImage() {
  preview.value = null;
  fotoUrl.value = "";
  archivo.value = null;
}

listarTodos();
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
.image-uploader {
  border: 2px dashed #ccc;
  border-radius: 8px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}
.preview-img {
  max-width: 100%;
  border-radius: 6px;
}
.hidden {
  display: none;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
