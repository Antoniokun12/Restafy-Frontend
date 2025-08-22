<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h4 col-grow">Cocina</div>

          <q-select
            v-model="filtroTipo"
            :options="['Mesa', 'Domicilio']"
            clearable
            dense
            filled
            class="w-200"
            placeholder="Filtrar por tipo"
          />
          <q-select
            v-model="filtroEstado"
            :options="['Preparación', 'Listo']"
            clearable
            dense
            filled
            class="w-200"
            placeholder="Filtrar por estado"
          />

          <q-btn color="primary" icon="refresh" @click="refrescar" />
          <q-btn
            flat
            :color="expandAll ? 'primary' : 'grey-8'"
            :label="expandAll ? 'Colapsar todo' : 'Expandir todo'"
            @click="toggleExpandAll"
          />
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
              :loading="store.loading"
              no-data-label="No hay pedidos"
            >
              <!-- Estado -->
              <template #body-cell-estado="props">
                <q-td :props="props">
                  <q-chip
                    :color="
                      props.row.estado === 'Preparación' ? 'orange' : 'green'
                    "
                    text-color="white"
                    size="md"
                  >
                    {{ props.row.estado }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Detalles (siempre visibles cuando expandAll = true o el id está en expandedRows) -->
              <template #body-cell-detalles="props">
                <q-td :props="props">
                  <q-expansion-item
                    expand-icon="unfold_more"
                    icon="restaurant_menu"
                    :label="`Detalles (${props.row.detalles?.length || 0})`"
                    header-class="text-weight-medium"
                    switch-toggle-side
                    :model-value="isExpanded(props.row._id)"
                    @update:model-value="
                      (val) => setExpanded(props.row._id, val)
                    "
                    :dense="false"
                  >
                    <q-list bordered class="details-list">
                      <q-item
                        v-for="(d, i) in props.row.detalles"
                        :key="i"
                        class="q-py-sm"
                      >
                        <q-item-section>
                          <div class="row items-center justify-between q-mb-xs">
                            <div class="text-subtitle1">
                              {{ d.nombreProducto }}
                            </div>
                            <q-badge outline color="primary" class="text-body1">
                              x{{ d.cantidad }}
                            </q-badge>
                          </div>
                          <div class="text-body1 text-grey-8">
                            $ {{ d.precioUnitario.toLocaleString() }}
                            <span class="text-grey-6"> · Subtotal:</span>
                            <span class="text-weight-medium">
                              $ {{ d.subtotal.toLocaleString() }}
                            </span>
                          </div>
                          <div
                            v-if="d.observaciones"
                            class="text-body2 q-mt-xs"
                          >
                            <q-icon
                              name="sticky_note_2"
                              size="18px"
                              class="q-mr-xs"
                            />
                            <span class="text-italic">Obs:</span>
                            {{ d.observaciones }}
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-td>
              </template>

              <!-- Acciones -->
              <template #body-cell-acciones="props">
                <q-td :props="props" class="q-gutter-xs">
                  <q-btn
                    v-if="props.row.estado === 'Preparación'"
                    dense
                    color="primary"
                    icon="check_circle"
                    label="Marcar listo"
                    @click="marcarListo(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>

    <div v-if="store.loading" class="overlay">
      <q-spinner size="xl" color="primary" />
    </div>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { usePedidoStore } from "../stores/pedidos.js";
import { io } from "socket.io-client";

const $q = useQuasar();
const store = usePedidoStore();

const filtroTipo = ref(null);
const filtroEstado = ref("Preparación"); // por defecto, cocina suele ver "Preparación"

// columnas
const columns = [
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (r) => new Date(r.createdAt || r.fecha).toLocaleString(),
  },
  { name: "tipoPedido", label: "Tipo", align: "center", field: "tipoPedido" },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  {
    name: "cliente",
    label: "Cliente/Mesa",
    align: "center",
    field: (r) =>
      r.tipoPedido === "Mesa"
        ? `Mesa ${r.mesaAsignada}`
        : r.clienteNombre || "-",
  },
  {
    name: "total",
    label: "Total",
    align: "right",
    field: (r) => `$ ${r.total.toLocaleString()}`,
  },
  { name: "detalles", label: "Detalles", align: "left" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// filtros
const filtrados = computed(() => {
  return (store.pedidos || [])
    .filter((p) => !filtroTipo.value || p.tipoPedido === filtroTipo.value)
    .filter((p) => !filtroEstado.value || p.estado === filtroEstado.value);
});

// expand/collapse control
const expandAll = ref(true);
const expandedRows = ref(new Set());

function isExpanded(id) {
  return expandAll.value || expandedRows.value.has(String(id));
}
function setExpanded(id, val) {
  const key = String(id);
  if (val) expandedRows.value.add(key);
  else expandedRows.value.delete(key);
}
function toggleExpandAll() {
  expandAll.value = !expandAll.value;
  if (!expandAll.value) expandedRows.value.clear();
}

// acciones
async function refrescar() {
  await store.getPedidos();
}

async function marcarListo(row) {
  const ok = await $q
    .dialog({
      title: "Confirmar",
      message: "¿Marcar pedido como Listo?",
      cancel: true,
      persistent: true,
    })
    .onOk(() => true)
    .onCancel(() => false);
  if (!ok) return;
  const r = await store.cambiarEstado(row._id, "Listo");
  if (r.success) {
    // mantener visibles los detalles del que cambió, por si se queda en lista
    expandedRows.value.add(String(row._id));
    refrescar();
  }
}

// sockets: refresco + expandir detalles de pedidos impactados
let socket;
onMounted(async () => {
  await refrescar();
  socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/socket.io" });

  socket.on("pedido:nuevo", ({ pedido }) => {
    refrescar().then(() => {
      // expandir detalles del nuevo
      if (pedido?._id) expandedRows.value.add(String(pedido._id));
    });
  });

  socket.on("pedido:estado", ({ pedidoId }) => {
    refrescar().then(() => {
      if (pedidoId) expandedRows.value.add(String(pedidoId));
    });
  });

  socket.on("pedido:cerrado", ({ pedidoId }) => {
    refrescar();
  });
});

onBeforeUnmount(() => {
  socket?.disconnect();
});
</script>

<style scoped>
.w-200 {
  width: 200px;
}
.details-list {
  padding: 6px;
  border-radius: 10px;
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
