<template>
  <q-layout view="hHh Lpr fFf">
    <!-- HEADER -->
    <q-header>
      <q-toolbar class="bg-grey-10 text-white">
        <q-space />
        <div class="text-h4 text-weight-bold tracking-wide">MENU</div>
        <q-space />
      </q-toolbar>

      <!-- Barra de búsqueda / filtros bajo el título -->
      <div class="bg-white">
        <div class="row items-center q-gutter-sm q-pa-sm container-limit">
          <q-input
            v-model="search"
            dense
            filled
            placeholder="Buscar..."
            class="w-250"
            clearable
          >
            <template #append><q-icon name="search" /></template>
          </q-input>

          <q-select
            label="Categoría"
            v-model="filtroTipo"
            :options="tiposOptions"
            dense
            filled
            clearable
            class="w-200"
          />
          <q-space />
          <q-btn
            color="primary"
            icon="shopping_cart"
            :label="`Carrito (${carrito.items.length})`"
            @click="openCart"
            glossy
          />
        </div>
      </div>
    </q-header>

    <!-- CONTENIDO -->
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row q-col-gutter-md container-limit">
          <div
            v-for="p in productosFiltrados"
            :key="p._id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card class="product-card">
              <img
                :src="p.foto || placeholder"
                alt="foto"
                style="width: 100%; aspect-ratio: 16/9; object-fit: cover"
              />
              <q-card-section class="q-pt-sm">
                <div class="text-h6">{{ p.nombre }}</div>
                <div class="text-caption text-grey-7">{{ p.componentes }}</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="row items-center justify-between">
                <div class="text-subtitle1">
                  ${{ p.precio.toLocaleString() }}
                </div>
                <q-btn
                  dense
                  color="primary"
                  icon="add_shopping_cart"
                  label="Agregar"
                  @click="add(p)"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-if="pedidoStore.loading || menuStore.loading" class="overlay">
          <q-spinner size="xl" color="primary" />
        </div>
      </q-page>
    </q-page-container>

    <q-footer class="bg-grey-10 text-white">
      <div
        class="row items-center justify-between q-px-md q-py-sm container-limit"
      >
        <div class="text-caption">
          {{ new Date().toLocaleDateString() }} ·
          {{ productosFiltrados.length }} productos
        </div>
      </div>
    </q-footer>

    <!-- Drawer: carrito -->
    <q-drawer v-model="showCart" side="right" overlay :width="400" bordered>
      <div class="q-pa-md">
        <div class="row items-center q-mb-md">
          <div class="text-h5 col-grow">Tu Pedido</div>
          <q-btn flat round dense icon="close" @click="closeCart" />
        </div>

        <q-list bordered separator class="q-mb-md" v-if="carrito.items.length">
          <q-item v-for="(it, idx) in carrito.items" :key="idx">
            <q-item-section>
              <div class="text-subtitle2">{{ it.nombreProducto }}</div>
              <div class="text-caption">
                $ {{ it.precioUnitario.toLocaleString() }} x {{ it.cantidad }}
              </div>

              <q-input
                v-model="it.observaciones"
                dense
                filled
                placeholder="Observaciones (ej: sin azúcar, extra hielo)"
                class="q-mt-sm"
              />

              <div class="row items-center q-gutter-xs q-mt-xs">
                <q-btn
                  size="sm"
                  dense
                  flat
                  round
                  icon="remove"
                  @click="dec(it)"
                />
                <q-btn size="sm" dense flat round icon="add" @click="inc(it)" />
                <q-space />
                <q-btn
                  size="sm"
                  dense
                  flat
                  icon="delete"
                  color="negative"
                  @click="remove(it)"
                />
              </div>
            </q-item-section>

            <q-item-section side top>
              <q-img
                :src="it.foto || placeholder"
                style="width: 60px; height: 60px; border-radius: 6px"
              />
              <div class="text-subtitle2 q-mt-sm">
                $ {{ it.subtotal.toLocaleString() }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center text-grey q-mb-md">
          El carrito está vacío.
        </div>

        <q-form @submit.prevent="onSubmit">
          <div class="text-subtitle1 q-mb-sm">Datos de entrega</div>

          <q-input
            v-model="clienteNombre"
            label="Nombre"
            dense
            filled
            class="q-mb-sm"
          />
          <q-input
            v-model="clienteTelefono"
            label="Teléfono"
            dense
            filled
            class="q-mb-sm"
          />
          <q-input
            v-model="direccionEntrega"
            label="Dirección"
            dense
            filled
            class="q-mb-sm"
          />

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
            class="q-mb-md"
            :disable="!habilitaMetodoPago"
            :hint="
              habilitaMetodoPago ? '' : 'Completa los datos para habilitar'
            "
          />

          <!-- PayPal Buttons (solo si método = en_linea) -->
          <div v-if="metodoPago === 'en_linea'">
            <q-banner class="q-mb-sm" rounded dense>
              Paga de forma segura con PayPal. Al completar el pago se
              registrará tu pedido.
            </q-banner>

            <div class="q-mb-md">
              <div ref="paypalButtonsEl"></div>
              <div v-if="paypalLoading" class="q-mt-sm">
                <q-spinner /> Cargando PayPal…
              </div>
            </div>
          </div>

          <q-separator class="q-my-sm" />
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1">Total</div>
            <div class="text-h6">${{ carrito.total.toLocaleString() }}</div>
          </div>

          <q-btn
            v-if="metodoPago === 'efectivo'"
            type="submit"
            color="primary"
            class="full-width q-mb-sm"
            :disable="!formValido"
            label="Realizar pedido"
          />
          <q-btn
            outline
            class="full-width"
            color="grey-8"
            label="Vaciar carrito"
            @click="carrito.clear()"
          />
        </q-form>
      </div>
    </q-drawer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { useMenuStore } from "../stores/menu.js";
import { useCarritoStore } from "../stores/carrito.js";
import { usePedidoStore } from "../stores/pedidos.js";
import { io } from "socket.io-client";

const $q = useQuasar();
const API_BASE = (
  import.meta.env.VITE_API_URL || "https://restafy-backend.onrender.com"
).replace(/\/+$/, "");
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_CURRENCY = import.meta.env.VITE_PAYPAL_CURRENCY || "USD";

const menuStore = useMenuStore();
const carrito = useCarritoStore();
const pedidoStore = usePedidoStore();

const search = ref("");
const filtroTipo = ref(null);
const tiposOptions = ["comida", "bebida", "postre"];
const showCart = ref(false);
const placeholder = "https://via.placeholder.com/640x360?text=Producto";

const clienteNombre = ref("");
const clienteTelefono = ref("");
const direccionEntrega = ref("");
const metodoPago = ref(null);
const metodosPago = [
  { label: "Efectivo", value: "efectivo" },
  { label: "En línea (PayPal)", value: "en_linea" },
];

const paypalButtonsEl = ref(null);
const paypalLoading = ref(false);
let paypalLoaded = false;
let socket;

const productosFiltrados = computed(() => {
  const s = search.value.trim().toLowerCase();
  return (menuStore.items || [])
    .filter((p) => p.disponible)
    .filter((p) => !filtroTipo.value || p.tipo === filtroTipo.value)
    .filter(
      (p) =>
        !s ||
        p.nombre.toLowerCase().includes(s) ||
        (p.componentes || "").toLowerCase().includes(s)
    );
});

const formValido = computed(
  () =>
    carrito.items.length &&
    clienteNombre.value.trim() &&
    clienteTelefono.value.trim() &&
    direccionEntrega.value.trim() &&
    metodoPago.value
);

function openCart() {
  showCart.value = true;
}
function closeCart() {
  showCart.value = false;
}

function add(p) {
  carrito.addItem(p, 1, "");
  $q.notify({ type: "positive", message: "Agregado al carrito" });
}
function inc(it) {
  carrito.addItem(
    {
      _id: it.productoId,
      nombre: it.nombreProducto,
      precio: it.precioUnitario,
      foto: it.foto,
    },
    1,
    it.observaciones
  );
}
function dec(it) {
  if (it.cantidad > 1) {
    it.cantidad -= 1;
    it.subtotal = it.cantidad * it.precioUnitario;
  } else {
    remove(it);
  }
}
function remove(it) {
  carrito.removeItem(it.productoId, it.observaciones);
}

async function onSubmit() {
  if (!formValido.value) return;
  if (metodoPago.value === "en_linea") return;
  await crearPedidoEfectivo();
}

async function crearPedidoEfectivo() {
  const payload = buildPayload("efectivo", false);
  const r = await pedidoStore.crearPedido(payload);
  if (r.success) {
    postPedidoOk("Pedido realizado. ¡Gracias!");
  }
}

async function loadPayPalSdk() {
  if (paypalLoaded) return true;
  if (!PAYPAL_CLIENT_ID) {
    $q.notify({ type: "negative", message: "Falta VITE_PAYPAL_CLIENT_ID" });
    return false;
  }
  paypalLoading.value = true;
  try {
    await new Promise((resolve, reject) => {
      if (window.paypal) {
        paypalLoaded = true;
        return resolve();
      }
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        PAYPAL_CLIENT_ID
      )}&currency=${encodeURIComponent(PAYPAL_CURRENCY)}`;
      script.async = true;
      script.onload = () => {
        paypalLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error("Error cargando PayPal SDK"));
      document.head.appendChild(script);
    });
    return true;
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "Error cargando PayPal SDK" });
    return false;
  } finally {
    paypalLoading.value = false;
  }
}

async function renderPayPalButtons() {
  if (metodoPago.value !== "en_linea") return;
  const ok = await loadPayPalSdk();
  if (!ok) return;
  if (!paypalButtonsEl.value) return;
  paypalButtonsEl.value.innerHTML = "";

  const amount = Number(carrito.total || 0).toFixed(2);

  window.paypal
    .Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      createOrder: async () => {
        try {
          const { data } = await axios.post(
            `${API_BASE}/api/payments/create-order`,
            {
              amount,
              currency: PAYPAL_CURRENCY,
            }
          );
          return data.id;
        } catch (e) {
          console.error(e);
          $q.notify({ type: "negative", message: "No se pudo crear la orden" });
          throw e;
        }
      },
      onApprove: async (data) => {
        try {
          await axios.post(`${API_BASE}/api/payments/capture-order`, {
            orderId: data.orderID,
          });
          await crearPedidoEnLineaPagado();
        } catch (e) {
          console.error(e);
          $q.notify({
            type: "negative",
            message: "No se pudo capturar el pago",
          });
          throw e;
        }
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        $q.notify({ type: "negative", message: "Error en PayPal" });
      },
    })
    .render(paypalButtonsEl.value);
}

async function crearPedidoEnLineaPagado() {
  const payload = buildPayload("en_linea", true);
  const r = await pedidoStore.crearPedido(payload);
  if (r.success) {
    postPedidoOk("Pago procesado y pedido creado. ¡Gracias!");
  }
}

function buildPayload(metodo, pagadoFlag) {
  return {
    tipoPedido: "Domicilio",
    estado: "Preparación",
    metodoPago: metodo,
    pagado: !!pagadoFlag,
    clienteNombre: clienteNombre.value,
    clienteTelefono: clienteTelefono.value,
    direccionEntrega: direccionEntrega.value,
    detalles: carrito.items.map((i) => ({
      productoId: i.productoId,
      nombreProducto: i.nombreProducto,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      subtotal: i.subtotal,
      observaciones: i.observaciones || "",
    })),
  };
}

function postPedidoOk(msg) {
  carrito.clear();
  clienteNombre.value = "";
  clienteTelefono.value = "";
  direccionEntrega.value = "";
  metodoPago.value = null;
  showCart.value = false;
  $q.notify({ type: "positive", message: msg });
}

const habilitaMetodoPago = computed(() => {
  const tieneItems = Array.isArray(carrito.items) && carrito.items.length > 0;
  const nomOK = (clienteNombre.value || "").trim().length > 0;
  const telOK = (clienteTelefono.value || "").trim().length > 0;
  const dirOK = (direccionEntrega.value || "").trim().length > 0;
  return tieneItems && nomOK && telOK && dirOK;
});

onMounted(async () => {
  await menuStore.getDisponiblesO();
  socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/socket.io" });
  socket.on("producto:disponibilidad", () => menuStore.getDisponibles());
});
onBeforeUnmount(() => socket?.disconnect());

watch([metodoPago, () => carrito.items.length, showCart], async ([met]) => {
  if (showCart.value && carrito.items.length && met === "en_linea") {
    await renderPayPalButtons();
  }
});
</script>

<style scoped>
.container-limit {
  max-width: 1200px;
  margin: 0 auto;
}
.product-card {
  border-radius: 14px;
  overflow: hidden;
}
.w-200 {
  width: 200px;
}
.w-250 {
  width: 250px;
}

.tracking-wide {
  letter-spacing: 0.5px;
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
