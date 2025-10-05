<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" @click="$router.back()" />
        <q-toolbar-title class="text-center">
          <span class="text-h5 text-bold">Caja</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-md">
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
              dense
              :rows-per-page-options="[0]"
              no-data-label="No hay pedidos listos para cobrar"
            >
              <!-- Detalles -->
              <template #body-cell-detalles="props">
                <q-td :props="props">
                  <q-expansion-item
                    dense
                    expand-separator
                    icon="receipt_long"
                    label="Ver detalles"
                  >
                    <q-list bordered separator>
                      <q-item v-for="(d, i) in props.row.detalles" :key="i">
                        <q-item-section>
                          <div class="text-subtitle1">
                            {{ d.nombreProducto }}
                          </div>
                          <div class="text-body2">
                            Cant: {{ d.cantidad }} · $
                            {{ d.precioUnitario.toLocaleString() }}
                            <span v-if="d.observaciones">
                              · Obs: {{ d.observaciones }}</span
                            >
                          </div>
                        </q-item-section>
                        <q-item-section side top>
                          <div class="text-subtitle1">
                            $ {{ d.subtotal.toLocaleString() }}
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </q-td>
              </template>

              <!-- Pago (solo domicilio) -->
              <template #body-cell-pago="props">
                <q-td :props="props">
                  <template v-if="props.row.tipoPedido === 'Domicilio'">
                    <q-chip
                      v-if="props.row.pagado"
                      color="green"
                      text-color="white"
                      size="md"
                      glossy
                    >
                      Pagado (en línea)
                    </q-chip>
                    <q-chip
                      v-else
                      color="orange"
                      text-color="white"
                      size="md"
                      glossy
                    >
                      {{
                        props.row.metodoPago === "efectivo"
                          ? "Efectivo"
                          : "No pagado"
                      }}
                    </q-chip>
                  </template>
                  <span v-else>-</span>
                </q-td>
              </template>

              <!-- Acciones -->
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
          <q-card style="min-width: 520px">
            <q-card-section class="q-pb-sm">
              <div class="text-h6">Cerrar pedido</div>
              <div class="text-caption text-grey-7">{{ encabezadoPedido }}</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-form @submit.prevent="confirmarCierre">
                <!-- Método de pago -->
                <div class="q-mb-md">
                  <!-- MESA: ahora se puede escoger entre efectivo y transferencia -->
                  <template v-if="pedidoSeleccionado?.tipoPedido === 'Mesa'">
                    <q-select
                      v-model="metodoPago"
                      :options="metodosPagoMesa"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      label="Método de pago (Mesa)"
                      dense
                      filled
                      :rules="[(v) => !!v || 'Requerido']"
                    />
                  </template>

                  <!-- DOMICILIO -->
                  <template v-else>
                    <!-- Pagado en línea -->
                    <template v-if="pedidoSeleccionado?.pagado">
                      <q-chip color="green" text-color="white" size="md" glossy>
                        Ya pagado en línea
                      </q-chip>
                    </template>

                    <!-- No pagado -->
                    <template v-else>
                      <!-- Si vino como EFECTIVO, no se puede cambiar -->
                      <template
                        v-if="pedidoSeleccionado?.metodoPago === 'efectivo'"
                      >
                        <q-chip
                          color="orange"
                          text-color="white"
                          size="md"
                          glossy
                        >
                          Efectivo (no editable)
                        </q-chip>
                      </template>

                      <!-- Si no tiene método (caso marginal), permitir elegir -->
                      <template v-else>
                        <q-select
                          v-model="metodoPago"
                          :options="metodosPagoDomicilio"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Método de pago (Domicilio)"
                          dense
                          filled
                          :rules="[(v) => !!v || 'Requerido']"
                        />
                      </template>
                    </template>
                  </template>
                </div>

                <!-- Autocomplete de cliente (SOLO Mesa) -->
                <div v-if="pedidoSeleccionado?.tipoPedido === 'Mesa'">
                  <q-input
                    v-model="cedula"
                    dense
                    filled
                    label="Cédula"
                    class="q-mb-sm"
                    debounce="0"
                    @update:model-value="onCedulaChange"
                    :loading="clienteLoading"
                    clearable
                  >
                    <template #append><q-icon name="badge" /></template>
                  </q-input>

                  <!-- Lista de coincidencias -->
                  <q-card
                    v-if="mostrarSugerencias"
                    flat
                    bordered
                    class="q-mb-md"
                  >
                    <q-list
                      separator
                      style="max-height: 220px; overflow-y: auto"
                    >
                      <q-item
                        v-for="c in sugerencias"
                        :key="c._id"
                        clickable
                        v-ripple
                        @click="seleccionarCliente(c)"
                      >
                        <q-item-section>
                          <div class="text-subtitle2">{{ c.nombre }}</div>
                          <div class="text-caption">
                            Cédula: {{ c.cedula }} · Tel: {{ c.telefono }}
                          </div>
                        </q-item-section>
                      </q-item>

                      <div
                        v-if="!sugerencias.length"
                        class="q-pa-md text-grey-7"
                      >
                        Sin coincidencias
                      </div>
                    </q-list>
                  </q-card>

                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <q-chip
                      v-if="existeCliente"
                      color="green"
                      text-color="white"
                      size="sm"
                      glossy
                    >
                      Cliente seleccionado
                    </q-chip>
                    <q-space />
                    <q-btn
                      outline
                      color="primary"
                      size="sm"
                      label="Registrar cliente"
                      @click="abrirRegistroCliente"
                    />
                  </div>
                </div>

                <!-- Datos cliente -->
                <q-input
                  v-model="clienteNombre"
                  dense
                  filled
                  label="Nombre del cliente"
                  class="q-mb-sm"
                  :hint="
                    pedidoSeleccionado?.tipoPedido === 'Mesa' ? 'Opcional' : ''
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
                    pedidoSeleccionado?.tipoPedido === 'Mesa' ? 'Opcional' : ''
                  "
                  :rules="
                    pedidoSeleccionado?.tipoPedido === 'Domicilio'
                      ? [(v) => !!v || 'Requerido']
                      : []
                  "
                />

                <!-- Propina solo Mesa -->
                <div
                  v-if="pedidoSeleccionado?.tipoPedido === 'Mesa'"
                  class="row q-col-gutter-sm q-mt-sm"
                >
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="propina"
                      type="number"
                      min="0"
                      dense
                      filled
                      label="Propina (opcional)"
                      suffix="$"
                    />
                  </div>
                </div>

                <!-- Resumen importes -->
                <q-separator class="q-my-md" />
                <div class="text-subtitle2 q-mb-xs">Resumen</div>
                <div class="row items-center justify-between q-mb-xs">
                  <div>Subtotal</div>
                  <div>$ {{ subtotalCalc.toLocaleString() }}</div>
                </div>
                <div class="row items-center justify-between q-mb-xs">
                  <div>Impuesto (8%)</div>
                  <div>$ {{ impuestoCalc.toLocaleString() }}</div>
                </div>
                <div
                  v-if="pedidoSeleccionado?.tipoPedido === 'Mesa'"
                  class="row items-center justify-between q-mb-xs"
                >
                  <div>Propina</div>
                  <div>$ {{ Number(propina || 0).toLocaleString() }}</div>
                </div>
                <q-separator class="q-my-xs" />
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle1">Total a cobrar</div>
                  <div class="text-h6">$ {{ totalCalc.toLocaleString() }}</div>
                </div>

                <div class="row justify-end q-gutter-sm q-mt-md">
                  <q-btn flat color="negative" label="Cancelar" v-close-popup />
                  <q-btn
                    color="primary"
                    label="Confirmar"
                    type="submit"
                    :loading="store.loading || clienteLoading"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Modal: Registrar cliente -->
        <q-dialog v-model="showRegistrarCliente">
          <q-card style="min-width: 420px">
            <q-card-section class="q-pb-none">
              <div class="text-h6">Registrar cliente</div>
              <div class="text-caption text-grey-7">
                Completa los datos para crear el cliente
              </div>
            </q-card-section>
            <q-card-section>
              <q-input
                v-model="regCedula"
                dense
                filled
                label="Cédula"
                class="q-mb-sm"
              />
              <q-input
                v-model="regNombre"
                dense
                filled
                label="Nombre"
                class="q-mb-sm"
              />
              <q-input v-model="regTelefono" dense filled label="Teléfono" />
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="negative" v-close-popup />
              <q-btn
                label="Guardar"
                color="primary"
                :loading="clienteLoading"
                @click="guardarNuevoCliente"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div v-if="store.loading" class="overlay">
          <q-spinner size="xl" color="primary" />
        </div>
      </q-page>
    </q-page-container>
    <q-footer elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title class="text-center text-caption">
          © 2025 Restafy - Todos los derechos reservados
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  watchEffect,
} from "vue";
import { useQuasar } from "quasar";
import { usePedidoStore } from "../stores/pedidos.js";
import { useClienteStore } from "../stores/clientes.js";
import { io } from "socket.io-client";

const $q = useQuasar();
const store = usePedidoStore();
const clienteStore = useClienteStore();

const search = ref("");

// columnas
const columns = [
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (r) => new Date(r.createdAt || r.fecha).toLocaleString(),
  },
  { name: "tipoPedido", label: "Tipo", align: "center", field: "tipoPedido" },
  { name: "pago", label: "Pago", align: "center" },
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

// solo listos
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

// diálogo cierre
const showCierre = ref(false);
const pedidoSeleccionado = ref(null);
const metodoPago = ref(null);
const clienteNombre = ref("");
const clienteTelefono = ref("");
const propina = ref(0);

// Cliente autocomplete
const cedula = ref("");
const existeCliente = ref(false);
const sugerencias = ref([]);
let debounceTimer = null;

const clienteLoading = computed(() => clienteStore.loading);

// Métodos de pago
const metodosPagoDomicilio = [
  { label: "Efectivo", value: "efectivo" },
  { label: "En línea", value: "en_linea" },
];

const metodosPagoMesa = [
  { label: "Efectivo", value: "efectivo" },
  { label: "Transferencia", value: "en_linea" }, // alias visual
];

// Encabezado
const encabezadoPedido = computed(() => {
  if (!pedidoSeleccionado.value) return "";
  const p = pedidoSeleccionado.value;
  const quien =
    p.tipoPedido === "Mesa"
      ? `Mesa ${p.mesaAsignada}`
      : p.clienteNombre || "Cliente";
  return `${p.tipoPedido} · ${quien}`;
});

// Cálculos locales
const subtotalCalc = ref(0);
const impuestoCalc = ref(0);
const totalCalc = ref(0);
const TAX_RATE = 0.08;

function recomputeTotalsFromRow(row) {
  const sub = (row.detalles || []).reduce(
    (s, d) => s + Number(d.subtotal || 0),
    0
  );
  subtotalCalc.value = Math.max(0, Math.round(sub));
  impuestoCalc.value = Math.round(subtotalCalc.value * TAX_RATE);
  const tip = row.tipoPedido === "Mesa" ? Number(propina.value || 0) : 0;
  totalCalc.value = subtotalCalc.value + impuestoCalc.value + tip;
}

function abrirCierre(row) {
  pedidoSeleccionado.value = row;

  // Defaults por tipo
  if (row.tipoPedido === "Mesa") {
    metodoPago.value = "efectivo"; // pero editable (select)
    propina.value = 0;
  } else {
    // Domicilio
    propina.value = 0;
    if (row.pagado) {
      metodoPago.value = null; // ya pagado en línea, no editable
    } else if (row.metodoPago === "efectivo") {
      metodoPago.value = "efectivo"; // bloqueado (no mostramos select)
    } else {
      // Caso marginal: permitir elegir
      metodoPago.value = row.metodoPago || "efectivo";
    }
  }

  // limpiar búsqueda de cliente
  cedula.value = "";
  existeCliente.value = false;
  sugerencias.value = [];

  // datos del pedido
  clienteNombre.value = row.clienteNombre || "";
  clienteTelefono.value = row.clienteTelefono || "";

  recomputeTotalsFromRow(row);
  showCierre.value = true;
}

function updateTotals() {
  if (!pedidoSeleccionado.value) return;
  recomputeTotalsFromRow(pedidoSeleccionado.value);
}

// Autocomplete cédula
async function onCedulaChange() {
  existeCliente.value = false;
  if (debounceTimer) clearTimeout(debounceTimer);
  const term = cedula.value?.trim();
  if (!term) {
    sugerencias.value = [];
    return;
  }
  debounceTimer = setTimeout(async () => {
    await clienteStore.buscarPorCedulaLike(term);
    sugerencias.value = clienteStore.resultados || [];
  }, 300);
}

function seleccionarCliente(c) {
  existeCliente.value = true;
  cedula.value = c.cedula;
  clienteNombre.value = c.nombre;
  clienteTelefono.value = c.telefono;
  sugerencias.value = [];
}

// Mostrar sugerencias
const mostrarSugerencias = computed(() => {
  return (
    !!cedula.value?.trim() &&
    Array.isArray(sugerencias.value) &&
    sugerencias.value.length > 0
  );
});

// Modal registrar cliente
const showRegistrarCliente = ref(false);
const regCedula = ref("");
const regNombre = ref("");
const regTelefono = ref("");

function abrirRegistroCliente() {
  regCedula.value = cedula.value || "";
  regNombre.value = clienteNombre.value || "";
  regTelefono.value = clienteTelefono.value || "";
  showRegistrarCliente.value = true;
}

async function guardarNuevoCliente() {
  if (
    !regCedula.value.trim() ||
    !regNombre.value.trim() ||
    !regTelefono.value.trim()
  ) {
    $q.notify({
      type: "warning",
      message: "Completa cédula, nombre y teléfono",
    });
    return;
  }
  const r = await clienteStore.crearCliente({
    cedula: regCedula.value.trim(),
    nombre: regNombre.value.trim(),
    telefono: regTelefono.value.trim(),
  });
  if (r.success) {
    cedula.value = r.data.cedula;
    clienteNombre.value = r.data.nombre;
    clienteTelefono.value = r.data.telefono;
    existeCliente.value = true;
    showRegistrarCliente.value = false;
  }
}

async function confirmarCierre() {
  const payload = {
    clienteNombre: clienteNombre.value,
    clienteTelefono: clienteTelefono.value,
  };

  if (pedidoSeleccionado.value.tipoPedido === "Mesa") {
    payload.metodoPago = metodoPago.value || "efectivo";
    payload.propina = Number(propina.value || 0);
  } else {
    if (pedidoSeleccionado.value.pagado) {
      // ya pagado en línea
    } else if (pedidoSeleccionado.value.metodoPago === "efectivo") {
      payload.metodoPago = "efectivo";
    } else {
      payload.metodoPago = metodoPago.value || "efectivo";
    }
  }

  const r = await store.cerrarPedido(pedidoSeleccionado.value._id, payload);
  if (r.success) {
    showCierre.value = false;
    refrescar();
    
    const facturaId = r?.data?.factura?._id;
    if (facturaId) {
      await store.descargarFacturaPdf(facturaId);
    } else {
      $q.notify({
        type: "warning",
        message: "Factura generada, pero no se recibió el ID para descargar.",
      });
    }
  }
}

/* ===== Sonido al llegar pedidos 'Listo' ===== */
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880; // A5
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

let socket;
let lastListoIds = new Set();

function indexListos(arr = []) {
  return new Set(
    arr.filter((p) => p.estado === "Listo").map((p) => String(p._id))
  );
}

onMounted(async () => {
  await refrescar();
  lastListoIds = indexListos(store.pedidos);

  socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/socket.io" });

  socket.on("pedido:nuevo", (payload) => {
    // si viene con estado Listo, ding
    if (payload?.pedido?.estado === "Listo") playDing();
    refrescar().then(() => {
      const now = indexListos(store.pedidos);
      // si hay nuevos ids en listo, ding
      for (const id of now) if (!lastListoIds.has(id)) playDing();
      lastListoIds = now;
    });
  });

  socket.on("pedido:estado", (payload) => {
    // si algún pedido cambió a Listo, ding
    if (payload?.estado === "Listo") playDing();
    refrescar().then(() => {
      const now = indexListos(store.pedidos);
      for (const id of now) if (!lastListoIds.has(id)) playDing();
      lastListoIds = now;
    });
  });

  socket.on("pedido:cerrado", () => {
    refrescar().then(() => {
      lastListoIds = indexListos(store.pedidos);
    });
  });
});

onBeforeUnmount(() => {
  socket?.disconnect();
});

// Recalcular totales cuando cambie propina o el pedido
watchEffect(() => {
  updateTotals();
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
