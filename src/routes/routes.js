import { createRouter, createWebHashHistory } from 'vue-router';
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Inicio from "../components/Inicio.vue";
import Productos from "../components/Productos.vue";
import Pedidos from "../components/Pedidos.vue";
import Ventas from "../components/Ventas.vue";
import Facturas from "../components/Facturas.vue";
import Empleados from "../components/Empleados.vue";
import Nomina from "../components/Nomina.vue";
import Gastos from "../components/Gastos.vue";
import Balance_Mesual from "../components/Balance_Mensual.vue";
import Inventario from "../components/Inventario.vue";
import Usuarios from "../components/Usuarios.vue";
import Menu_Mesero from "../components/MenuMesero.vue";
import Menu_Online from "../components/MenuOnline.vue";
import Pedidos_Cocina from "../components/Pedidos_Cocina.vue";
import Pedidos_Caja from "../components/Pedidos_Caja.vue";
import Correo_Recuperacion from "../components/Correo_Recuperacion.vue";
import Cambiar_Password from "../components/Cambiar_Password.vue";
import { useUsuarioStore } from '../stores/usuarios';

const auth = (to, from, next) => {

  if (checkAuth()) {
    const userUsuario = useUsuarioStore()
    const rol = userUsuario.usuario.rol
    console.log(rol);
    if (!to.meta.rol.includes(rol)) {
      return next({ name: 'Inicio' })
    }
    next()
  } else {
    return next({ name: 'login' })
  }
}

const checkAuth = () => {
  const useUsuario = useUsuarioStore()
  const token = useUsuario.token
  console.log(token);
  if (!token) return false
  return true
};

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/forgot-password',
    name: 'Correo_Recuperacion',
    component: Correo_Recuperacion
  },
  {
    path: '/reset-password',
    name: 'Cambiar_Password',
    component: Cambiar_Password,
    props: route => ({ token: route.query.token })
  },
  {
    path: '/menu_mesero',
    name: 'Menu_Mesero',
    component: Menu_Mesero,
  },
  {
    path: '/menu_online',
    name: 'Menu_Online',
    component: Menu_Online,
  },
  {
    path: '/pedidos_cocina',
    name: 'Pedidos_Cocina',
    component: Pedidos_Cocina,
  },
  {
    path: '/Pedidos_caja',
    name: 'Pedidos_Caja',
    component: Pedidos_Caja,
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '/home',
        name: 'Inicio',
        component: Inicio,
        beforeEnter: auth,
        meta: {
          rol: ['Administrador', 'Mesero', 'Cocinero', 'Cajero', 'Contador']
        }
      },
      {
        path: '/productos',
        name: 'Productos',
        component: Productos,
        beforeEnter: auth,
        meta: { rol: ['Administrador'] }
      },
      {
        path: '/pedidos',
        name: 'Pedidos',
        component: Pedidos,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Mesero', 'Cocinero'] }
      },
      {
        path: '/ventas',
        name: 'Ventas',
        component: Ventas,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Cajero', 'Contador'] }
      },
      {
        path: '/facturas',
        name: 'Facturas',
        component: Facturas,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Cajero', 'Contador'] }
      },
      {
        path: '/empleados',
        name: 'Empleados',
        component: Empleados,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Contador'] }
      },
      {
        path: '/nomina',
        name: 'Nomina',
        component: Nomina,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Contador'] }
      },
      {
        path: '/gastos',
        name: 'Gastos',
        component: Gastos,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Contador'] }
      },
      {
        path: '/balance_mensual',
        name: 'Balance_Mensual',
        component: Balance_Mesual,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Contador'] }
      },
      {
        path: '/inventario',
        name: 'Inventario',
        component: Inventario,
        beforeEnter: auth,
        meta: { rol: ['Administrador', 'Cocinero'] }
      },
      {
        path: '/usuarios',
        name: 'Usuarios',
        component: Usuarios,
        beforeEnter: auth,
        meta: { rol: ['Administrador'] }
      },
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})