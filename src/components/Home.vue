<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-grey-9 text-white">
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
          size="30px"
        />

        <q-toolbar-title
          :style="{
            fontSize: '60px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }"
        >
          <q-avatar size="80px" :style="{ marginRight: '20px' }">
            <img src="/icono_home.png" />
          </q-avatar>
        </q-toolbar-title>

        <q-btn
          dense
          flat
          round
          icon="person"
          size="30px"
          @click="toggleRightDrawer"
        />
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/home" label="Inicio" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
      <router-link
        v-if="puedeVer('productos')"
        to="/productos"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="fastfood" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Productos</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('menu_mesero')"
        to="/menu_mesero"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="restaurant_menu" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Menu Mesa</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('menu_online')"
        to="/menu_online"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="delivery_dining" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Menu Envios</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('pedidos_cocina')"
        to="/pedidos_cocina"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="soup_kitchen" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pedidos Cocina</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('Pedidos_caja')"
        to="/Pedidos_caja"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="point_of_sale" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pedidos Caja</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('ventas')"
        to="/ventas"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="trending_up" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Ventas</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('facturas')"
        to="/facturas"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="receipt_long" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Facturas</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('empleados')"
        to="/empleados"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="group" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Empleados</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('nomina')"
        to="/nomina"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="request_quote" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Nomina</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('gastos')"
        to="/gastos"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="money_off" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Gastos</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('balance_mensual')"
        to="/balance_mensual"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="analytics" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Balance Y Arqueo</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('inventario')"
        to="/inventario"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="inventory_2" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Inventario</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="puedeVer('usuarios')"
        to="/usuarios"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple dense>
          <q-item-section avatar>
            <q-icon name="manage_accounts" size="50px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Usuarios</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <br />
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay elevated>
      <div v-if="usuario" class="q-pa-md">
        <h4 class="text-center">PERFIL</h4>
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Nombre</q-item-label>
              <q-item-label>{{ usuario.nombre }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="email" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Email</q-item-label>
              <q-item-label>{{ usuario.email }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="work" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Rol</q-item-label>
              <q-item-label>{{ usuario.rol }}</q-item-label>
            </q-item-section>
          </q-item>
          <div class="text-center q-my-md">
            <q-btn
              label="Cerrar sesión"
              color="red"
              size="md"
              @click="cerrarSesion"
            />
          </div>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view></router-view>
    </q-page-container>

    <q-footer elevated class="bg-grey-10 text-white">
      <q-toolbar class="justify-between">
        <q-toolbar-title>
          <div class="footer-content q-pa-md">
            <p class="q-mb-none text-subtitle2">
              © {{ new Date().getFullYear() }} Restafy — Sistema de Gestión para
              Restaurantes
            </p>
          </div>
        </q-toolbar-title>
        <div class="q-pr-md">
          <q-icon name="restaurant_menu" size="20px" class="q-mr-sm" />
          <span class="text-caption">Powered by Antonio & Esneyder</span>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUsuarioStore } from "../stores/usuarios.js";
import { useRouter } from "vue-router";

const usuarioStore = useUsuarioStore();
const router = useRouter();

const usuario = computed(() => usuarioStore.usuario);

// --- Permisos por rol ---
const permisos = {
  Administrador: [
    "productos",
    "menu_mesero",
    "menu_online",
    "pedidos_cocina",
    "Pedidos_caja",
    "ventas",
    "facturas",
    "empleados",
    "nomina",
    "gastos",
    "balance_mensual",
    "inventario",
    "usuarios",
  ],
  Mesero: ["menu_mesero", "menu_online", "pedidos_cocina"],
  Cocinero: ["pedidos_cocina", "productos", "inventario"],
  Cajero: ["facturas", "ventas", "Pedidos_caja", "gastos", "balance_mensual", "menu_online",],
  Contador: ["balance_mensual", "nomina", "empleados", "facturas", "gastos"],
};

const puedeVer = (rutaKey) => {
  const rolActual = usuario.value?.rol;
  if (!rolActual) return false;
  if (rolActual === "Administrador") return true; // por si olvidas añadir alguna ruta nueva
  return permisos[rolActual]?.includes(rutaKey) || false;
};

onMounted(() => {
  if (usuarioStore.token) {
    // rightDrawerOpen.value = true;
  }
});

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}

const cerrarSesion = () => {
  usuarioStore.clearUsuario();
  router.push({ name: "login" });
};
</script>

<style scoped>
.drawer-link {
  display: block;
  padding: 5px 10px;
  color: black;
  text-decoration: none;
  transition: background-color 0.3s;
  font-size: 18px;
  text-align: left;
  white-space: nowrap;
}

.drawer-link:hover {
  background-color: #6f9768;
}

.drawer-link-active {
  background-color: #b0bec5;
}

.drawer-link q-item-section {
  display: flex;
  align-items: center;
}

.q-btn {
  font-size: 24px;
  padding: 12px;
}

.q-icon {
  font-size: 36px;
}

.text-center {
  text-align: center;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.drawer-link .q-item__section--avatar {
  min-width: 50px; /* reduce el ancho reservado al icono */
}

.drawer-link .q-icon {
  margin-right: 25px; /* menos espacio entre icono y texto */
}
</style>

