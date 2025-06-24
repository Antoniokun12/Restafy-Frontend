import { createRouter, createWebHashHistory } from 'vue-router';
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Inicio from "../components/Inicio.vue";
import { useUsuarioStore } from '../stores/usuarios';


const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '/home',
        name: 'Inicio',
        component: Inicio,
        beforeEnter: auth, meta: { rol: ['Administrador', 'Recepcionista', 'Instructor'] }
      },
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})