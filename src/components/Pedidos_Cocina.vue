<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Encabezado -->
        <div class="row items-center q-mb-md">
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              icon="arrow_back"
              @click="goBack"
              aria-label="Regresar"
            />
          </div>
          <div class="col-grow text-center">
            <div class="text-h5 text-weight-bold">Cocina</div>
            <div class="text-caption text-grey-7">Pedidos en preparación</div>
          </div>
          <div class="col-auto">
            <q-btn color="primary" icon="refresh" @click="refrescar" />
          </div>
        </div>

        <q-separator spaced />

        <!-- Tabla -->
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
              :loading="store.loading"
              no-data-label="No hay pedidos en preparación"
            >
              <!-- Estado -->
              <template #body-cell-estado="props">
                <q-td :props="props">
                  <q-chip color="orange" text-color="white" size="md">
                    {{ props.row.estado }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Detalles -->
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
                    dense
                    color="primary"
                    icon="check_circle"
                    label="Marcar listo"
                    @click="confirmMarcarListo(props.row)"
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
import { useRouter } from "vue-router";
import { io } from "socket.io-client";

const $q = useQuasar();
const store = usePedidoStore();
const router = useRouter();

/* ====== columnas (sin Total) ====== */
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
  { name: "detalles", label: "Detalles", align: "left" },
  { name: "acciones", label: "Acciones", align: "center" },
];

/* ====== solo “Preparación” ====== */
const filtrados = computed(() =>
  (store.pedidos || []).filter((p) => p.estado === "Preparación")
);

/* ====== expand control ====== */
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

/* ====== sonido al llegar pedidos nuevos ====== */
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.stop(ctx.currentTime + 0.3);
  } catch {}
}

/* ====== confirm async (corrección Quasar) ======
   $q.dialog no es “awaitable”, así que lo envolvemos en una Promesa
================================================= */
function confirmAsync({
  title,
  message,
  ok = "Sí",
  cancel = "Cancelar",
  icon = "check_circle",
}) {
  return new Promise((resolve) => {
    $q.dialog({
      title,
      message,
      html: true,
      ok: { label: ok, color: "primary", unelevated: true, icon },
      cancel: { label: cancel, flat: true },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });
}

/* ====== acciones ====== */
async function refrescar() {
  await store.getPedidos();
}

async function confirmMarcarListo(row) {
  const resumen = `
    <div class="q-mt-xs">
      <div><b>Tipo:</b> ${row.tipoPedido}</div>
      <div><b>${row.tipoPedido === "Mesa" ? "Mesa" : "Cliente"}:</b> ${
    row.tipoPedido === "Mesa"
      ? "Mesa " + row.mesaAsignada
      : row.clienteNombre || "-"
  }</div>
      <div class="q-mt-xs text-grey-7">Se moverá a <b>Listo</b>.</div>
    </div>
  `;
  const ok = await confirmAsync({
    title: "Confirmar",
    message: resumen,
    ok: "Marcar listo",
    icon: "restaurant",
  });
  if (!ok) return;

  const r = await store.cambiarEstado(row._id, "Listo");
  if (r.success) {
    expandedRows.value.add(String(row._id));
    $q.notify({ type: "positive", message: "Pedido marcado como Listo" });
    refrescar();
  } else {
    $q.notify({ type: "negative", message: "No se pudo actualizar el estado" });
  }
}

/* ====== back ====== */
function goBack() {
  router.back();
}

/* ====== sockets ====== */
let socket;
onMounted(async () => {
  await refrescar();
  socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/socket.io" });

  // nuevo pedido
  socket.on("pedido:nuevo", ({ pedido }) => {
    if (pedido?.estado === "Preparación") {
      playDing();
    }
    refrescar().then(() => {
      if (pedido?._id && pedido.estado === "Preparación") {
        expandedRows.value.add(String(pedido._id));
      }
    });
  });

  // cambio de estado
  socket.on("pedido:estado", ({ pedidoId, estado }) => {
    if (estado === "Preparación") {
      playDing();
    }
    refrescar().then(() => {
      if (pedidoId) expandedRows.value.add(String(pedidoId));
    });
  });

  socket.on("pedido:cerrado", () => {
    refrescar();
  });
});

onBeforeUnmount(() => {
  socket?.disconnect();
});

</script>

<style scoped>
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
