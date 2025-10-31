# Velykapet POS System

POS web-client + Google Apps Script backend para gestionar ventas e inventario de Velykapet.

## Estructura del repo
- /apps_script
  - inventory-sync.gs        -> script que actualiza `inventory.sheet` cuando hay movimientos
  - webhook-sales.gs         -> doPost Web App que recibe ventas desde el cliente scanner
- /client
  - index.html               -> cliente web para Android (cámara + escáner, con BarcodeDetector / fallback)
- README.md                  -> este archivo

## Requisitos
- Google Account con acceso a Google Sheets.
- Hoja de cálculo con las hojas:
  - `inventory` (encabezado: id, sku, nombre, barcode, precio, stock)
  - `movimientos` (encabezado: mov_id, fecha, barcode, sku, nombre, cantidad, tipo, usuario)
- Navegador Chrome en Android (para el cliente).
- (Opcional) Hosting estático para el cliente o GitHub Pages.

## Instalación rápida
1. Crear el repositorio (si no existe) y subir los archivos de `/apps_script` y `/client`.
2. Abrir Google Sheets → Extensiones → Apps Script.
3. Pegar `inventory-sync.gs` y `webhook-sales.gs` en el mismo proyecto.
4. Deploy → New deployment → Web app (publicar `doPost`):
   - Execute as: Me
   - Who has access: Anyone with link (o restringir)
   - Guardar la URL del Web App.
5. (Opcional) Habilitar trigger onMovimientoAdded si quieres procesamiento adicional directo desde la hoja.
6. Configurar `index.html` con la URL del Web App y, si usas token, ponerlo en la variable TOKEN.
7. Abrir `index.html` en Chrome desde el móvil y probar escaneo.

## Pruebas
- Escanear un barcode existente: debe añadirse una fila en `movimientos` y actualizarse stock en `inventory`.
- Revisar `movimiento_log` para ver eventos / errores.

## Seguridad
- Usa token simple o restringe acceso de Web App a cuentas concretas.
- No publiques tokens en repositorios públicos.

## Licencia
MIT
