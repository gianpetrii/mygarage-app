# CarLogger — Producto

## Usuario objetivo

Familia argentina/LATAM con 1 o más vehículos. Perfil práctico: quiere avisos de mantenimiento y un lugar ordenado para comprobantes, sin ser mecánico.

## Jobs to be done

1. **Principal:** No olvidar services, VTV, seguro (recordatorios).
2. **Secundario:** Historial documentado para reventa (export/compartir).

## Competencia

Guantera de papeles, Excel, notas sueltas.

## Principios UX

- Home = "¿Qué me olvidé?" (recordatorio hero arriba).
- Post-alta: pantalla de setup de recordatorios (VTV, service, seguro).
- Home con identidad del vehículo, checklist de inicio y acciones rápidas.
- Registro rápido desde botón central del tab bar.
- Historial unificado (service + nafta + gastos).
- Onboarding corto: vehículo en pocos campos.
- Guías prácticas accesibles sin saturar el flujo principal.

## Mercado

Argentina/LATAM primero (patente, español, ARS).

## Backlog — Catálogo técnico y manuales

### Decisión de producto

- **Ficha técnica:** enriquecer por **marca + modelo** (y año cuando aplique). No exigir versión/trim para ver datos útiles.
- Cuando un dato varía por versión → mostrar en **tabla** con columna o nota *"según versión"*, no bloquear al usuario sin trim.
- **Manual:** resolver automáticamente si existe en catálogo; el `manualUrl` del usuario sigue teniendo prioridad.

### Ficha técnica completa

**Datos objetivo (por modelo):** carrocería, combustible(s), motor(es), potencia, transmisión, tracción, baúl, tanque, neumáticos, aceite recomendado, etc.

**Fases:**

1. Definir schema `VehicleModelSpecs` + helper `getSpecsForVehicle(make, model, year?, trim?)`.
2. Seed estático en `constants/vehicleSpecs.ts` — arrancar con ~15–20 modelos top AR (Gol, Onix, Corolla, Hilux, Tracker, Cronos…).
3. UI en hub del vehículo: tablas agrupadas (Motor, Dimensiones, Mantenimiento); badge *"Varía según versión"* donde corresponda.
4. (Futuro) Colección Firestore `vehicleSpecs` para actualizar sin release de app.

### Manuales precargados

**Lookup:** `getManualForVehicle(make, model, year?, trim?)` → URL o `null`.

**Prioridad al abrir manual:**

1. `vehicle.manualUrl` (usuario)
2. Catálogo curado
3. CTA agregar manual

**Fases:**

1. Schema `VehicleManualEntry` + `constants/vehicleManuals.ts` (enlaces OEM/PDF públicos, idioma ES).
2. Seed inicial alineado con los mismos modelos de la ficha técnica.
3. Menú del vehículo: *"Abrir manual"* si hay match; si no, *"Manual no disponible"* + opción de pegar URL.
4. (Futuro) Firestore `vehicleManuals` + contribución comunitaria moderada.

**Nota legal:** enlazar a PDFs oficiales del fabricante; no hostear PDFs propios salvo licencia explícita.
