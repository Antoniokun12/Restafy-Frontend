<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h4 col-grow">Menú (Domicilio)</div>

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
            v-model="filtroTipo"
            :options="tiposOptions"
            dense
            filled
            clearable
            placeholder="Filtrar por tipo"
            class="w-200"
          />

          <q-btn
            color="primary"
            icon="shopping_cart"
            :label="`Carrito (${carrito.items.length})`"
            @click="showCart = true"
          />
        </div>

        <div class="row q-col-gutter-md">
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
                  \${{ p.precio.toLocaleString() }}
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

    <!-- Drawer: carrito -->
    <q-drawer v-model="showCart" side="right" overlay :width="380" bordered>
      <div class="q-pa-md">
        <div class="text-h5 q-mb-md">Tu Pedido</div>

        <q-list bordered separator class="q-mb-md" v-if="carrito.items.length">
          <q-item v-for="(it, idx) in carrito.items" :key="idx">
            <q-item-section>
              <div class="text-subtitle2">{{ it.nombreProducto }}</div>
              <div class="text-caption">
                $ {{ it.precioUnitario.toLocaleString() }} x {{ it.cantidad }}
              </div>

              <!-- Observaciones por ítem -->
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

        <q-form @submit.prevent="crearPedidoOnline">
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
          />

          <q-separator class="q-my-sm" />
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1">Total</div>
            <div class="text-h6">\${{ carrito.total.toLocaleString() }}</div>
          </div>

          <q-btn
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { useMenuStore } from "../stores/menu.js";
import { useCarritoStore } from "../stores/carrito.js";
import { usePedidoStore } from "../stores/pedidos.js";
import { io } from "socket.io-client";

const $q = useQuasar();
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
  { label: "Tarjeta", value: "tarjeta" },
  { label: "En línea", value: "en_linea" },
];

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

async function crearPedidoOnline() {
  if (!formValido.value) return;

  const payload = {
    tipoPedido: "Domicilio",
    estado: "Preparación",
    metodoPago: metodoPago.value,
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

  const r = await pedidoStore.crearPedido(payload);
  if (r.success) {
    carrito.clear();
    clienteNombre.value = "";
    clienteTelefono.value = "";
    direccionEntrega.value = "";
    metodoPago.value = null;
    showCart.value = false;
    $q.notify({ type: "positive", message: "Pedido realizado. ¡Gracias!" });
  }
}

// sockets: refrescar menú
let socket;
onMounted(async () => {
  await menuStore.getDisponibles();
  socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/socket.io" });
  socket.on("producto:disponibilidad", () => menuStore.getDisponibles());
});
onBeforeUnmount(() => socket?.disconnect());
</script>

<style scoped>
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
