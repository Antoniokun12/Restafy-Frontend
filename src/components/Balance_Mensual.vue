<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- ====== Reportes (Arqueo diario + Balance mensual PDF) ====== -->
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h3 col-grow">Reportes</div>
        </div>

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-sm">Arqueo de Caja (Diario)</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="fecha"
                  dense
                  filled
                  label="Fecha (YYYY-MM-DD)"
                  mask="####-##-##"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model.number="efectivoInicial"
                  type="number"
                  dense
                  filled
                  label="Efectivo inicial"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-btn
                  color="primary"
                  label="Descargar PDF"
                  :loading="storeReporte.loading"
                  @click="descargarArqueo"
                  class="full-width"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-xl">
          <q-card-section>
            <div class="text-h3 q-mb-sm">Balance Mensual</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="mesPdf"
                  dense
                  filled
                  label="Mes (YYYY-MM)"
                  mask="####-##"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-btn
                  color="primary"
                  label="Descargar PDF"
                  :loading="storeReporte.loading"
                  @click="descargarBalance"
                  class="full-width"
                />
              </div>
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">
              * Si no existe el balance, primero ve a la sección de abajo
              “Balances mensuales” y genera el mes.
            </div>
          </q-card-section>
        </q-card>

        <!-- ====== Balances mensuales (listar / generar / ver / eliminar) ====== -->
        <div class="row items-center q-gutter-sm q-mb-md">
          <div class="text-h3 col-grow">Balances mensuales</div>
          <q-input
            v-model="mesGestion"
            dense
            filled
            class="w-200"
            label="Mes (YYYY-MM)"
            mask="####-##"
          />
          <q-btn
            color="primary"
            label="Generar"
            :loading="storeBalance.loading"
            @click="gen"
          />
        </div>

        <q-card>
          <q-card-section>
            <q-table
              :rows="rows"
              :columns="columns"
              row-key="_id"
              flat
              bordered
              square
              dense
              :rows-per-page-options="[0]"
              :loading="storeBalance.loading"
              no-data-label="Sin balances"
            >
              <template #body-cell-gananciaNeta="props">
                <q-td :props="props">
                  <span
                    :class="
                      props.row.gananciaNeta >= 0
                        ? 'text-positive'
                        : 'text-negative'
                    "
                  >
                    {{ moneda(props.row.gananciaNeta) }}
                  </span>
                </q-td>
              </template>

              <template #body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    dense
                    flat
                    round
                    icon="visibility"
                    color="primary"
                    @click="ver(props.row)"
                  />
                  <q-btn
                    dense
                    flat
                    round
                    icon="delete"
                    color="negative"
                    class="q-ml-xs"
                    @click="delRow(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Dialog detalle -->
        <q-dialog v-model="show">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-center">Balance {{ sel?.mes }}</div>
              <div class="text-caption text-grey-7 text-center">
                Generado:
                {{ sel ? new Date(sel.fechaGeneracion).toLocaleString() : "" }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <q-list bordered separator>
                <q-item>
                  <q-item-section>Ventas</q-item-section>
                  <q-item-section side>{{
                    moneda(sel?.totalVentas)
                  }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Gastos</q-item-section>
                  <q-item-section side>{{
                    moneda(sel?.totalGastos)
                  }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Nómina</q-item-section>
                  <q-item-section side>{{
                    moneda(sel?.totalNomina)
                  }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section class="text-weight-bold"
                    >Ganancia Neta</q-item-section
                  >
                  <q-item-section side>
                    <span
                      :class="
                        sel?.gananciaNeta >= 0
                          ? 'text-positive'
                          : 'text-negative'
                      "
                    >
                      {{ moneda(sel?.gananciaNeta) }}
                    </span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" label="Cerrar" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div v-if="anyLoading" class="overlay">
          <q-spinner size="xl" color="primary" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import { useReporteStore } from "../stores/reportes.js"; // <-- ya existente
import { useBalanceStore } from "../stores/balances.js"; // <-- ya existente

const $q = useQuasar();

// stores
const storeReporte = useReporteStore();
const storeBalance = useBalanceStore();

// ====== Reportes (PDFs) ======
const today = new Date();
const fecha = ref(today.toISOString().slice(0, 10)); // YYYY-MM-DD
const mesPdf = ref(today.toISOString().slice(0, 7)); // YYYY-MM
const efectivoInicial = ref(0);

async function descargarArqueo() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha.value)) {
    $q.notify({ type: "warning", message: "Fecha inválida" });
    return;
  }
  await storeReporte.descargarArqueoPdf(fecha.value, efectivoInicial.value);
}

async function descargarBalance() {
  if (!/^\d{4}-\d{2}$/.test(mesPdf.value)) {
    $q.notify({ type: "warning", message: "Mes inválido" });
    return;
  }
  await storeReporte.descargarBalancePdf(mesPdf.value);
}

// ====== Balances mensuales (gestión) ======
const mesGestion = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM

const columns = [
  { name: "mes", label: "Mes", align: "left", field: "mes" },
  {
    name: "totalVentas",
    label: "Ventas",
    align: "right",
    field: (r) => moneda(r.totalVentas),
  },
  {
    name: "totalGastos",
    label: "Gastos",
    align: "right",
    field: (r) => moneda(r.totalGastos),
  },
  {
    name: "totalNomina",
    label: "Nómina",
    align: "right",
    field: (r) => moneda(r.totalNomina),
  },
  {
    name: "gananciaNeta",
    label: "Ganancia neta",
    align: "right",
    field: "gananciaNeta",
  },
  { name: "acciones", label: "Acciones", align: "center" },
];

const rows = computed(() => storeBalance.balances || []);

const show = ref(false);
const sel = ref(null);

function ver(row) {
  sel.value = row;
  show.value = true;
}

async function delRow(row) {
  $q.dialog({
    title: "Confirmar",
    message: `¿Eliminar balance ${row.mes}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const r = await storeBalance.eliminar(row._id);
    if (r.success) cargar();
  });
}

async function gen() {
  if (!/^\d{4}-\d{2}$/.test(mesGestion.value)) {
    $q.notify({
      type: "warning",
      message: "Formato de mes inválido (usa YYYY-MM)",
    });
    return;
  }
  const r = await storeBalance.generar(mesGestion.value);
  if (r.success) cargar();
}

async function cargar() {
  await storeBalance.listar();
}

// helpers
function moneda(n = 0) {
  return (
    "$ " + Number(n || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
  );
}

const anyLoading = computed(() => storeReporte.loading || storeBalance.loading);

onMounted(cargar);
</script>

<style scoped>
.w-200 {
  width: 200px;
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
.kpi {
  border-radius: 12px;
}
.text-h3 {
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
