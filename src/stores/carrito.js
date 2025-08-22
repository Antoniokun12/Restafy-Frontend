import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoStore = defineStore('carrito', () => {
    // items: [{ productoId, nombreProducto, foto, cantidad, precioUnitario, subtotal, observaciones }]
    const items = ref([])

    const addItem = (p, cantidad = 1, observaciones = '') => {
        // p: {_id, nombre, precio, foto?}
        const i = items.value.find(
            it => it.productoId === p._id && (it.observaciones || '') === (observaciones || '')
        )
        if (i) {
            i.cantidad += cantidad
            i.subtotal = i.cantidad * i.precioUnitario
        } else {
            items.value.push({
                productoId: p._id,
                nombreProducto: p.nombre,
                foto: p.foto || null,
                cantidad,
                precioUnitario: p.precio,
                subtotal: p.precio * cantidad,
                observaciones: observaciones || ''
            })
        }
    }

    const removeItem = (productoId, observaciones = '') => {
        items.value = items.value.filter(
            i => !(i.productoId === productoId && (i.observaciones || '') === (observaciones || ''))
        )
    }

    const clear = () => { items.value = [] }

    const total = computed(() => items.value.reduce((s, it) => s + it.subtotal, 0))

    return { items, addItem, removeItem, clear, total }
}, { persist: true })
