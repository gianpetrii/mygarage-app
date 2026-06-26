# Manuales del catálogo (piloto)

PDF de prueba para Gol, Corolla y Onix. Reemplazá por manuales reales cuando los tengas.

## Subir a Firebase Storage

1. Activá Storage en Firebase Console si aún no está habilitado.
2. Ejecutá:

```bash
pnpm run upload:manuals
```

Requiere `gcloud` autenticado. También podés subir manualmente a `catalog/manuals/...` en la consola.

## Probar en la app

Creá o usá un vehículo Volkswagen Gol, Toyota Corolla o Chevrolet Onix → menú ⋮ → **Abrir manual**.
