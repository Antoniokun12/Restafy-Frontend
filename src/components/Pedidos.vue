<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="text-h4 col-grow">Pedidos</div>

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
      <q-input
        v-model="search"
        dense
        filled
        clearable
        placeholder="Buscar por cliente / mesa"
        class="w-250"
      >
        <template #append><q-icon name="search" /></template>
      </q-input>
      <q-btn color="primary" icon="refresh" @click="refrescar" />
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
          <template #body-cell-detalles="props">
            <q-td :props="props">
              <q-expansion-item
                dense
                expand-separator
                icon="receipt_long"
                label="Ver detalles"
              >
                <q-list dense bordered separator>
                  <q-item v-for="(d, i) in props.row.detalles" :key="i">
                    <q-item-section>
                      <div class="text-subtitle2">{{ d.nombreProducto }}</div>
                      <div class="text-caption">
                        Cant: {{ d.cantidad }} · $
                        {{ d.precioUnitario.toLocaleString() }}
                        <span v-if="d.observaciones">
                          · Obs: {{ d.observaciones }}</span
                        >
                      </div>
                    </q-item-section>
                    <q-item-section side top>
                      <div class="text-subtitle2">
                        $ {{ d.subtotal.toLocaleString() }}
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.estado === 'Preparación' ? 'orange' : 'green'"
                dark
              >
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

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
              <q-btn
                v-if="props.row.estado === 'Listo'"
                dense
                color="positive"
                icon="point_of_sale"
                label="Cerrar"
                @click="abrirCierre(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo Cierre de Pedido -->
    <q-dialog v-model="showCierre">
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">Cerrar pedido</div>
          <div class="text-caption text-grey-7">
            Total: $ {{ pedidoSeleccionado?.total?.toLocaleString() }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="confirmarCierre">
            <q-select
              v-model="metodoPago"
              :options="metodosPago"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Método de pago"
              dense
              filled
              class="q-mb-sm"
              :rules="[(val) => !!val || 'Requerido']"
            />

            <!-- Ahora SIEMPRE editables. Para Mesa los prellenamos; para Domicilio se requieren -->
            <q-input
              v-model="clienteNombre"
              dense
              filled
              label="Nombre del cliente"
              class="q-mb-sm"
              :rules="[
                (val) =>
                  pedidoSeleccionado?.tipoPedido === 'Mesa' ||
                  !!(val && val.trim()) ||
                  'Requerido',
              ]"
            />
            <q-input
              v-model="clienteTelefono"
              dense
              filled
              label="Teléfono del cliente"
              :rules="[
                (val) =>
                  pedidoSeleccionado?.tipoPedido === 'Mesa' ||
                  !!(val && val.trim()) ||
                  'Requerido',
              ]"
            />

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat color="negative" label="Cancelar" v-close-popup />
              <q-btn
                color="primary"
                label="Confirmar"
                type="submit"
                :loading="store.loading"
              />
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { usePedidoStore } from "../stores/pedidos.js";
import { io } from "socket.io-client";

const $q = useQuasar();
const store = usePedidoStore();

const search = ref("");
const filtroTipo = ref(null);
const filtroEstado = ref(null);

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

const filtrados = computed(() => {
  const s = search.value.trim().toLowerCase();
  return (store.pedidos || [])
    .filter((p) => !filtroTipo.value || p.tipoPedido === filtroTipo.value)
    .filter((p) => !filtroEstado.value || p.estado === filtroEstado.value)
    .filter((p) => {
      if (!s) return true;
      const hay = [
        p.clienteNombre || "",
        p.mesaAsignada != null ? `mesa ${p.mesaAsignada}` : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
});

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
  if (r.success) refrescar();
}

// Cierre de pedido (caja)
const showCierre = ref(false);
const pedidoSeleccionado = ref(null);
const metodoPago = ref(null);
const clienteNombre = ref("");
const clienteTelefono = ref("");

const metodosPago = [
  { label: "Efectivo", value: "efectivo" },
  { label: "Tarjeta", value: "tarjeta" },
  { label: "En línea", value: "en_linea" },
];

function abrirCierre(row) {
  pedidoSeleccionado.value = row;
  metodoPago.value = null;

  // Prefill:
  if (row.tipoPedido === "Mesa") {
    clienteNombre.value = `Mesa ${row.mesaAsignada ?? ""}`.trim();
    clienteTelefono.value = "N/A";
  } else {
    clienteNombre.value = row.clienteNombre || "";
    clienteTelefono.value = row.clienteTelefono || "";
  }
  showCierre.value = true;
}

async function confirmarCierre() {
  const r = await store.cerrarPedido(pedidoSeleccionado.value._id, {
    metodoPago: metodoPago.value,
    clienteNombre: (clienteNombre.value || "").trim(),
    clienteTelefono: (clienteTelefono.value || "").trim(),
  });
  if (r.success) {
    showCierre.value = false;
    refrescar();
  }
}

// Sockets para tiempo real
let socket;
onMounted(async () => {
  await refrescar();
  socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/socket.io" });
  socket.on("pedido:nuevo", refrescar);
  socket.on("pedido:estado", refrescar);
  socket.on("pedido:cerrado", refrescar);
});
onBeforeUnmount(() => {
  socket?.disconnect();
});
</script>

<style scoped>
.w-200 {
  width: 200px;
}
.w-250 {
  width: 250px;
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
