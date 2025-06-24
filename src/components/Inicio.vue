<template>
  <q-page class="gym-page">
    <div class="info-section q-pa-md">
      <q-card class="info-card">
        <q-card-section>
          <div class="text-h6">Horarios</div>
          <q-list>
            <q-item>
              <q-item-section>
                De lunes a viernes: 6:00 AM - 10:00 PM
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> Sábados: 8:00 AM - 8:00 PM </q-item-section>
            </q-item>
            <q-item>
              <q-item-section> Domingos: 10:00 AM - 6:00 PM </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card class="info-card">
        <q-card-section>
          <div class="text-h6">Clases Disponibles</div>
          <q-list>
            <q-item>
              <q-item-section>Yoga</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Pilates</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Zumba</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Spinning</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Entrenamiento de fuerza</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card class="info-card">
        <q-card-section>
          <div class="text-h6">Contactos</div>
          <q-list>
            <q-item>
              <q-item-section>Teléfono: (123) 456-7890</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Email: info@gym.com</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
</script>

<style scoped>
/* estilos del fondo principal del home */

.gym-page {
  background: url("https://img.freepik.com/foto-gratis/gimnasio-pesas-suelo_1340-37013.jpg") no-repeat center center;
  background-size: cover;
  color: white;
  min-height: 100vh;
}

.hero-section {
  position: relative;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner {
  color: white;
  width: 90%;
  max-width: 600px;
  text-align: center;
}

.text-container {
  text-align: center;
}

.banner-title {
  font-size: 2.5em;
  margin-bottom: 0.5em;
}

.banner-subtitle {
  font-size: 1.5em;
}

.info-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.8);
}

.info-card {
  background-color: rgba(65, 63, 63, 0.926);
  color: white;
  width: 300px;
  margin: 10px;
}
</style>
