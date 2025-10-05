<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h2 col-grow">Facturas</div>

          <q-input
            v-model="search"
            dense
            filled
            clearable
            placeholder="Buscar por cliente / método"
            class="w-280"
          >
            <template #append><q-icon name="search" /></template>
          </q-input>

          <q-btn color="primary" icon="refresh" @click="refrescar" />
        </div>

        <q-card>
          <q-card-section>
            <q-table
              :rows="filtradas"
              :columns="columns"
              row-key="_id"
              flat
              bordered
              square
              dense
              :rows-per-page-options="[0]"
              :loading="store.loading"
              no-data-label="No hay facturas registradas"
            >
              <template #body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    round
                    icon="visibility"
                    color="primary"
                    @click="store.verPdf(props.row._id)"
                    :disable="store.loading"
                    title="Ver PDF"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <div v-if="store.loading" class="overlay">
          <q-spinner size="xl" color="primary" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFacturaStore } from "../stores/facturas.js";

const store = useFacturaStore();
const search = ref("");

const columns = [
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (r) => new Date(r.createdAt || r.fecha).toLocaleString(),
    sortable: true,
  },
  {
    name: "cliente",
    label: "Cliente",
    align: "left",
    field: "clienteNombre",
    sortable: true,
  },
  {
    name: "total",
    label: "Total",
    align: "right",
    field: (r) => `$ ${Number(r.total || 0).toLocaleString()}`,
    sortable: true,
  },
  {
    name: "metodo",
    label: "Método de pago",
    align: "center",
    field: (r) => (r.metodoPago === "en_linea" ? "En línea" : "Efectivo"),
    sortable: true,
  },
  { name: "acciones", label: "Ver", align: "center" },
];

const filtradas = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return store.facturas;
  return (store.facturas || []).filter((f) => {
    const hay = [
      f.clienteNombre || "",
      f.metodoPago === "en_linea" ? "en linea" : "efectivo",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(s);
  });
});

async function refrescar() {
  await store.getFacturas();
}

onMounted(refrescar);
</script>

<style scoped>
.w-280 {
  width: 280px;
}

.text-h2 {
  font-weight: bold;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
