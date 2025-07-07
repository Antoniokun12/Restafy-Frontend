<template>
  <div class="forgot-password-container">
    <div class="forgot-password-form">
      <h2>Recuperar contraseña</h2>
      <q-form @submit.prevent="enviarCorreo">
        <q-input
          filled
          class="input"
          v-model="email"
          label="Ingrese su correo electrónico registrado"
        />
        <div class="button-container">
          <q-btn
            label="Enviar correo de recuperación"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
    <div v-if="usuarioStore.loading" class="overlay">
      <q-spinner size="xl" color="primary" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Notify } from "quasar";
import { useUsuarioStore } from "../stores/usuarios";

const email = ref("");
const usuarioStore = useUsuarioStore();

const requiredRule = (value) => !!value || "Este campo es requerido";

async function enviarCorreo() {
  if (!email.value) {
    mostrarNotificacion(
      "Por favor, ingrese su correo electrónico.",
      "negative"
    );
    return;
  }
  if (!isValidEmailFormat(email.value)) {
    mostrarNotificacion(
      "El formato del correo electrónico no es válido.",
      "negative"
    );
    return;
  }

  try {
    await usuarioStore.forgotPassword(email.value);
    Notify.create({
      message: `Correo de recuperación enviado a ${email.value}`,
      color: "positive",
      position: "top",
    });
    email.value = "";
  } catch (error) {
    mostrarNotificacion(
      "Error al enviar el correo de recuperación.",
      "negative"
    );
  }
}

function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function mostrarNotificacion(mensaje, color = "negative") {
  Notify.create({
    message: mensaje,
    color: color,
    position: "top",
    icon: "sentiment_dissatisfied",
  });
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("https://e1.pxfuel.com/desktop-wallpaper/391/391/desktop-wallpaper-3840x2160-dumbbells-fitness-gym-u-16-9-weights.jpg");
  background-size: cover;
  background-position: center;
  color: white;
  margin: 0;
}

.forgot-password-form {
  max-width: 400px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
}

.input {
  color: white;
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