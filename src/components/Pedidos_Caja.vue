<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h4 col-grow">Caja</div>
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
              no-data-label="No hay pedidos listos para cobrar"
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
                          <div class="text-subtitle2">
                            {{ d.nombreProducto }}
                          </div>
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

              <template #body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    dense
                    color="positive"
                    icon="point_of_sale"
                    label="Cobrar / Cerrar"
                    @click="abrirCierre(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Diálogo Cierre -->
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
                  :rules="[(v) => !!v || 'Requerido']"
                />

                <q-input
                  v-model="clienteNombre"
                  dense
                  filled
                  label="Nombre del cliente"
                  class="q-mb-sm"
                  :hint="
                    pedidoSeleccionado?.tipoPedido === 'Mesa'
                      ? 'Opcional (si tu Factura lo exige, ingrésalo)'
                      : ''
                  "
                  :rules="
                    pedidoSeleccionado?.tipoPedido === 'Domicilio'
                      ? [(v) => !!v || 'Requerido']
                      : []
                  "
                />
                <q-input
                  v-model="clienteTelefono"
                  dense
                  filled
                  label="Teléfono del cliente"
                  :hint="
                    pedidoSeleccionado?.tipoPedido === 'Mesa'
                      ? 'Opcional (si tu Factura lo exige, ingrésalo)'
                      : ''
                  "
                  :rules="
                    pedidoSeleccionado?.tipoPedido === 'Domicilio'
                      ? [(v) => !!v || 'Requerido']
                      : []
                  "
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { usePedidoStore } from "../stores/pedidos.js";
import { io } from "socket.io-client";

const $q = useQuasar();
const store = usePedidoStore();

const search = ref("");

const columns = [
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (r) => new Date(r.createdAt || r.fecha).toLocaleString(),
  },
  { name: "tipoPedido", label: "Tipo", align: "center", field: "tipoPedido" },
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
    .filter((p) => p.estado === "Listo")
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

// cierre
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
  metodoPago.value = row.metodoPago || null;
  clienteNombre.value = row.clienteNombre || "";
  clienteTelefono.value = row.clienteTelefono || "";
  showCierre.value = true;
}

async function confirmarCierre() {
  const payload = {
    metodoPago: metodoPago.value,
    clienteNombre: clienteNombre.value,
    clienteTelefono: clienteTelefono.value,
  };

  const r = await store.cerrarPedido(pedidoSeleccionado.value._id, payload);
  if (r.success) {
    showCierre.value = false;
    refrescar();
    $q.notify({ type: "positive", message: "Pedido cerrado correctamente" });
  }
}

// sockets
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
