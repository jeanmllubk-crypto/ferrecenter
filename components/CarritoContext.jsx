"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CarritoContext = createContext(null);
const CLAVE = "ferrecenter-carrito-v1";

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      if (Array.isArray(guardado)) setItems(guardado);
    } catch {}
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {}
  }, [items, cargado]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2500);
    return () => clearTimeout(t);
  }, [aviso]);

  function agregar(producto, cantidad = 1) {
    setItems((prev) => {
      const existe = prev.find((i) => i.sku === producto.sku);
      const max = producto.stock > 0 ? producto.stock : 999;
      if (existe) {
        return prev.map((i) =>
          i.sku === producto.sku
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, max) }
            : i
        );
      }
      return [
        ...prev,
        {
          sku: producto.sku,
          slug: producto.slug,
          nombre: producto.nombre,
          marca: producto.marca,
          precio: producto.precioFinal,
          imagen: producto.imagenes[0],
          stock: producto.stock,
          cantidad: Math.min(cantidad, max),
        },
      ];
    });
    setAviso(`${producto.nombre} se agregó al carrito`);
  }

  function cambiarCantidad(sku, cantidad) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.sku !== sku) return i;
        const max = i.stock > 0 ? i.stock : 999;
        return { ...i, cantidad: Math.max(1, Math.min(cantidad, max)) };
      })
    );
  }

  function quitar(sku) {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }

  function vaciar() {
    setItems([]);
  }

  // Actualiza precios y stock con el catálogo vigente y quita productos que ya no están activos
  function sincronizar(actuales) {
    setItems((prev) =>
      prev
        .filter((i) => actuales[i.sku])
        .map((i) => {
          const a = actuales[i.sku];
          const max = a.stock > 0 ? a.stock : 999;
          return { ...i, ...a, cantidad: Math.min(i.cantidad, max) };
        })
    );
  }

  const valor = useMemo(() => {
    const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0);
    const total = items.reduce((s, i) => s + i.cantidad * i.precio, 0);
    return { items, cargado, totalUnidades, total, agregar, cambiarCantidad, quitar, vaciar, sincronizar, aviso };
  }, [items, cargado, aviso]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return ctx;
}
