<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Header -->
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h2 col-grow">Ventas</div>

          <q-input
            v-model="search"
            dense
            filled
            clearable
            placeholder="Buscar por cliente / método / tipo"
            class="w-280"
          >
            <template #append><q-icon name="search" /></template>
          </q-input>

          <q-btn color="primary" icon="refresh" @click="refrescar" />
        </div>

        <!-- Tabla -->
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
              no-data-label="No hay ventas registradas"
            >
              <template #body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    round
                    icon="visibility"
                    color="primary"
                    @click="verDetalles(props.row)"
                    :disable="store.loading"
                    title="Ver detalles"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    class="q-ml-xs"
                    @click="eliminar(props.row)"
                    :disable="store.loading"
                    title="Eliminar venta"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Modal Detalles -->
        <q-dialog v-model="showDetalle">
          <q-card>
            <q-card-section class="row items-center">
              <div class="text-h6">Detalle de Venta</div>
              <q-space />
              <q-btn flat round dense icon="close" v-close-popup />
            </q-card-section>
            <q-separator />

            <q-card-section>
              <div class="q-mb-sm">
                <div class="text-subtitle2">
                  Fecha:
                  {{ fechaBonita(ventaSel?.fecha || ventaSel?.createdAt) }}
                </div>
                <div>
                  Cliente: <b>{{ ventaSel?.clienteNombre || "-" }}</b>
                </div>
                <div>Tipo pedido: {{ ventaSel?.tipoPedido }}</div>
                <div>Método: {{ metodoBonito(ventaSel?.metodoPago) }}</div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="row items-center justify-between">
                <div>Subtotal</div>
                <div class="text-weight-medium">
                  {{ moneda(ventaSel?.subtotal) }}
                </div>
              </div>
              <div class="row items-center justify-between">
                <div>Impuesto (8%)</div>
                <div class="text-weight-medium">
                  {{ moneda(ventaSel?.impuesto) }}
                </div>
              </div>
              <div
                class="row items-center justify-between"
                v-if="ventaSel?.propina"
              >
                <div>Propina</div>
                <div class="text-weight-medium">
                  {{ moneda(ventaSel?.propina) }}
                </div>
              </div>
              <q-separator class="q-my-xs" />
              <div class="row items-center justify-between">
                <div class="text-subtitle1">TOTAL</div>
                <div class="text-h6">{{ moneda(ventaSel?.total) }}</div>
              </div>

              <div v-if="ventaSel?.pedidoId?.detalles?.length" class="q-mt-md">
                <div class="text-subtitle2 q-mb-xs">Productos</div>
                <q-list bordered separator>
                  <q-item v-for="(d, i) in ventaSel.pedidoId.detalles" :key="i">
                    <q-item-section>
                      <div class="text-subtitle2">{{ d.nombreProducto }}</div>
                      <div class="text-caption">
                        Cant: {{ d.cantidad }} · V/U:
                        {{ moneda(d.precioUnitario) }}
                      </div>
                    </q-item-section>
                    <q-item-section side top>
                      <div class="text-subtitle2">{{ moneda(d.subtotal) }}</div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
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
import { ref, computed, onMounted } from "vue";
import { useVentaStore } from "../stores/ventas.js";
import { useQuasar } from "quasar";

const store = useVentaStore();
const $q = useQuasar();

const search = ref("");
const showDetalle = ref(false);
const ventaSel = ref(null);

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
    name: "tipo",
    label: "Tipo",
    align: "center",
    field: "tipoPedido",
    sortable: true,
  },
  {
    name: "metodo",
    label: "Método",
    align: "center",
    field: (r) => metodoBonito(r.metodoPago),
    sortable: true,
  },
  {
    name: "subtotal",
    label: "Subtotal",
    align: "right",
    field: (r) => moneda(r.subtotal),
    sortable: true,
  },
  {
    name: "impuesto",
    label: "Impuesto",
    align: "right",
    field: (r) => moneda(r.impuesto),
    sortable: true,
  },
  {
    name: "propina",
    label: "Propina",
    align: "right",
    field: (r) => moneda(r.propina || 0),
    sortable: true,
  },
  {
    name: "total",
    label: "Total",
    align: "right",
    field: (r) => moneda(r.total),
    sortable: true,
  },
  { name: "acciones", label: "Acciones", align: "center" },
];

const filtradas = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return store.ventas;
  return (store.ventas || []).filter((v) => {
    const hay = [
      v.clienteNombre || "",
      v.tipoPedido || "",
      metodoBonito(v.metodoPago),
      String(v.total || 0),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(s);
  });
});

function moneda(n = 0) {
  return (
    "$ " + Number(n || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
  );
}
function metodoBonito(m) {
  return m === "en_linea" ? "En línea" : "Efectivo";
}
function fechaBonita(f) {
  try {
    return new Date(f).toLocaleString();
  } catch {
    return "-";
  }
}

async function refrescar() {
  await store.getVentas();
}

async function verDetalles(row) {
  // si ya viene populado con pedidoId parcial, intento pedir completo
  const { success, data } = await store.getVenta(row._id);
  if (success) {
    ventaSel.value = data;
    showDetalle.value = true;
  }
}

function eliminar(row) {
  $q.dialog({
    title: "Eliminar",
    message: `¿Eliminar la venta de ${row.clienteNombre || "—"} por ${moneda(
      row.total
    )}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await store.deleteVenta(row._id);
  });
}

onMounted(refrescar);
</script>

<style scoped>
.w-280 {
  width: 280px;
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
.text-h2 {
  font-weight: bold;
}

</style>
