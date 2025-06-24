<template>
  <q-layout view="hHh LpR lFr">
    <q-header elevated class="bg-grey-9 text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title
          :style="{
            fontSize: '60px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }"
        >
          <q-avatar size="100px" :style="{ marginRight: '20px' }">
            <!-- <img src="/header.png" /> -->
          </q-avatar>
          GYM
        </q-toolbar-title>

        <q-btn
          dense
          flat
          round
          icon="person"
          size="lg"
          @click="toggleRightDrawer"
        />
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/home" label="Inicio" />
        <!-- <q-route-tab to="/page2" label="Page Two" />
        <q-route-tab to="/page3" label="Page Three" /> -->
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
      <router-link
        v-if="canAccess(['Administrador'])"
        to="/usuarios"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="person" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Usuarios</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador', 'Instructor', 'Recepcionista'])"
        to="/clientes"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="people" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Clientes</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador'])"
        to="/sedes"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="location_city" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sedes</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador', 'Instructor', 'Recepcionista'])"
        to="/ingresos"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="exit_to_app" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Ingresos</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador'])"
        to="/planes"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="assignment" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Planes</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador'])"
        to="/pagos"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="payment" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pagos</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador', 'Recepcionista'])"
        to="/inventario"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="store" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Inventario</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador', 'Recepcionista'])"
        to="/ventas"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="local_mall" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Ventas</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador', 'Recepcionista'])"
        to="/maquinas"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="fitness_center" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Maquinas</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <router-link
        v-if="canAccess(['Administrador', 'Recepcionista'])"
        to="/mantenimientos"
        class="drawer-link"
        active-class="drawer-link-active"
      >
        <q-item clickable v-ripple>
          <q-item-section>
            <q-icon name="build" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mantenimientos</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>

      <br />
      <!-- drawer content -->
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
              <q-icon name="phone" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Teléfono</q-item-label>
              <q-item-label>{{ usuario.telefono }}</q-item-label>
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

    <q-footer :reveal="true" elevated class="bg-grey-10 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="footer-content q-pa-md">
            <p class="q-mb-none">
              Reservado los derechos de autor ley 1987("antonio y el viejo
              chucho")
            </p>
          </div>
        </q-toolbar-title>
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

const canAccess = (roles) => {
  return roles.includes(usuario.value.rol);
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
</style>

