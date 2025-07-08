<template>
  <div class="reset-password-container">
    <div class="reset-password-background"></div>
    <div class="reset-password-form">
      <h2 class="form-title">Restablecer contraseña</h2>
      <q-form @submit.prevent="handleSubmit">
        <q-input
          filled
          class="input"
          type="password"
          v-model="newPassword"
          label="Nueva contraseña"
        />
        <q-input
          filled
          class="input"
          type="password"
          v-model="confirmPassword"
          label="Confirmar contraseña"
        />
        <div class="button-container">
          <q-btn
            label="Guardar nueva contraseña"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
    <div v-if="useUsuarioStore.loading" class="overlay">
      <q-spinner size="xl" color="primary" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Notify } from "quasar";
import { useUsuarioStore } from '../stores/usuarios';
import { useRoute } from 'vue-router';

const route = useRoute();
const token = ref(route.query.token); // Captura el token desde la URL
const newPassword = ref("");
const confirmPassword = ref("");

function mostrarNotificacion(mensaje, color = "negative") {
  Notify.create({
    message: mensaje,
    color: color,
    position: "top",
    icon: "sentiment_dissatisfied"
  });
}

async function resetPassword(token, newPassword, confirmPassword) {
  try {
    const response = await useUsuarioStore().resetPassword(token, newPassword, confirmPassword);
    return response;
  } catch (error) {
    throw error;
  }
}

function handleSubmit() {
  if (!newPassword.value || !confirmPassword.value) {
    mostrarNotificacion("Por favor, complete todos los campos.", "negative");
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    mostrarNotificacion("Las contraseñas no coinciden.", "negative");
    return;
  }

  resetPassword(token.value, newPassword.value, confirmPassword.value)
    .then(response => {
      if (response.status === 200) {
        Notify.create({
          message: "Contraseña restablecida exitosamente.",
          color: "positive",
          position: "top",
        });
        newPassword.value = "";
        confirmPassword.value = "";
      } else {
        mostrarNotificacion("contraseña restablecida existosamente.", "positive");
        newPassword.value = "";
        confirmPassword.value = "";
      }
    })
    .catch(error => {
      mostrarNotificacion("Error al restablecer la contraseña.", "negative");
    });
}
</script>

<style scoped>
.reset-password-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.reset-password-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/fondo_cambiopassword.png");
  background-size: cover;
  background-position: center;
  opacity: 0.9;
}

.reset-password-form {
  position: relative;
  z-index: 1;
  max-width: 400px;
  padding: 20px;
  background: rgba(30, 29, 29, 0.9);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #f9f9f9;
}

.form-title {
  text-align: center;
  margin-bottom: 40px;
}

.input {
  background-color: #f9f9f9;
  margin-bottom: 15px; 
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
