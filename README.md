# Velykapet POS System

Sistema de punto de venta (POS) para gestionar ventas e inventario de Velykapet. El proyecto consta de un **frontend web** con escáner de códigos de barras y un **backend .NET** que gestiona el inventario y movimientos.

<!-- Estructura del repositorio (imagen opcional) -->
<!-- <img src="https://github.com/angra8410/velykapet-pos/raw/main/.github/repo-structure.png" alt="Estructura del repositorio" width="600"/> -->

## 🏗️ Arquitectura Actual

El sistema actual funciona con:

- **Frontend**: `index.html` - Cliente web con escáner de códigos de barras usando ZXing
- **Backend**: API REST en .NET (ASP.NET Core) - **No incluido en este repositorio**
  - Ubicación local: `C:\projects\mis-proyectos-dotnet\VelykapetPosAPI`
  - Gestiona inventario, movimientos, precios y lógica de negocio
  - Se expone públicamente mediante **ngrok** para acceso desde dispositivos móviles

### ⚠️ Importante sobre el Backend

El backend **NO** está incluido en este repositorio por razones de seguridad:
- Contiene credenciales de base de datos
- Incluye precios y datos sensibles del negocio
- Información de configuración privada

El backend se mantiene como proyecto local separado y se referencia solo para fines de documentación.

## 📁 Estructura del Repositorio

```
velykapet-pos/
├── index.html              ✅ ACTUAL - Frontend con escáner ZXing (en uso en producción)
├── client/
│   └── index.html          ⚠️ OBSOLETO - Versión anterior del frontend
├── apps_script/            ⚠️ OBSOLETO - Backend anterior con Google Apps Script
│   ├── inventory-sync.gs   (Ya no se usa - migrado a .NET)
│   └── webhook-sales.gs    (Ya no se usa - migrado a .NET)
└── README.md               📖 Este archivo
```

### ✅ Archivos en Producción

- **`index.html`**: Cliente web principal con escáner de códigos de barras
  - Usa ZXing library para escaneo
  - Se puede servir desde GitHub Pages o localmente
  - Conecta al backend .NET vía API REST

### ⚠️ Archivos Obsoletos (Legacy)

Estos archivos se mantienen en el repositorio por histórico, pero **NO** se usan en producción:

- **`client/index.html`**: Versión anterior del frontend
- **`apps_script/`**: Backend antiguo basado en Google Apps Script
  - `inventory-sync.gs`: Script que sincronizaba inventario con Google Sheets
  - `webhook-sales.gs`: Webhook que recibía ventas desde el cliente

**La lógica de estos scripts ha sido migrada completamente al backend .NET.**

## 🚀 Cómo Ejecutar el Sistema

### Frontend (index.html)

#### Opción 1: GitHub Pages (Recomendado para producción)
1. Si tienes GitHub Pages habilitado, el archivo estará disponible en: `https://<tu-usuario>.github.io/velykapet-pos/`
   - Para este repositorio sería: `https://angra8410.github.io/velykapet-pos/`
2. Abrirlo desde un navegador móvil (Chrome recomendado)
3. Permitir acceso a la cámara cuando se solicite

#### Opción 2: Servidor Local
```bash
# Opción A: Python
python -m http.server 8000

# Opción B: Node.js (http-server)
npx http-server -p 8000

# Luego abrir: http://localhost:8000/index.html
```

#### Opción 3: Abrir directamente
Simplemente abrir `index.html` en el navegador (funciona, pero algunas APIs de cámara pueden requerir HTTPS)

### Backend (.NET API)

**Nota**: El backend está en un repositorio privado local y NO está incluido aquí.

#### Requisitos
- .NET SDK 6.0 o superior
- SQL Server o base de datos compatible
- ngrok (para exposición pública del backend)

#### Pasos para ejecutar (Referencia)

1. **Navegar al proyecto backend**:
```bash
cd C:\projects\mis-proyectos-dotnet\VelykapetPosAPI
```

2. **Ejecutar el backend**:
```bash
dotnet run
# O en modo watch para desarrollo:
dotnet watch run
```

El backend típicamente se ejecuta en `https://localhost:5001` o `http://localhost:5000`

3. **Exponer con ngrok**:
```bash
ngrok http 5001 --scheme https
# O sin especificar esquema:
ngrok http https://localhost:5001
```

4. **Copiar la URL de ngrok** y actualizarla en `index.html` (ver sección "Configuración del Frontend" más abajo)


### Configuración del Frontend

Editar la URL del backend en `index.html` (línea ~100):

```javascript
const WEBAPP_URL = 'https://YOUR-NGROK-URL.ngrok-free.dev/api/inventory';
// Reemplazar YOUR-NGROK-URL con tu subdomain único de ngrok
// Ejemplo: 'https://abc123xyz.ngrok-free.dev/api/inventory'
```

También se puede configurar desde la interfaz:
- **Token**: Token de autenticación (si el backend lo requiere)
- **Usuario**: Nombre del usuario que registra la venta
- **Tipo**: entrada/venta/ajuste/ingreso
- **Cantidad**: Número de unidades

## 📱 Uso del Sistema

1. Abrir `index.html` en un dispositivo móvil
2. Hacer clic en "Iniciar cámara"
3. Apuntar la cámara al código de barras
4. El sistema detectará automáticamente el código y:
   - Enviará la información al backend
   - Actualizará el inventario
   - Registrará el movimiento
5. Ver el resultado en el log de la aplicación

## 🔐 Seguridad y Buenas Prácticas

### ⚠️ NO Subir al Repositorio Público

- ❌ Credenciales de base de datos
- ❌ Tokens de autenticación
- ❌ Precios de productos
- ❌ Información sensible del negocio
- ❌ Archivos de configuración con datos privados
- ❌ El código fuente del backend .NET

### ✅ Recomendaciones

- ✅ Usar variables de entorno para credenciales en el backend
- ✅ Implementar autenticación con tokens en la API
- ✅ Usar HTTPS para todas las comunicaciones
- ✅ Rotar tokens regularmente
- ✅ Restringir CORS en el backend solo a orígenes confiables
- ✅ Mantener el backend en repositorio privado
- ✅ Usar `.gitignore` para archivos sensibles
- ✅ Revisar logs de ngrok para detectar accesos no autorizados

### Configuración de Token

Si el backend requiere autenticación:
1. Generar un token seguro
2. Configurarlo en el backend (.NET)
3. NO incluirlo directamente en `index.html` (usar input del usuario)
4. Los usuarios deben ingresar el token al usar la aplicación

## 🔧 Tecnologías Utilizadas

### Frontend
- HTML5 / CSS3 / JavaScript
- [ZXing Library](https://github.com/zxing-js/library) - Escaneo de códigos de barras
- Barcode Detection API (navegadores compatibles)

### Backend (No en este repo)
- ASP.NET Core (C#)
- Entity Framework Core
- SQL Server / SQLite
- RESTful API

### Herramientas
- GitHub Pages - Hosting del frontend
- ngrok - Exposición pública del backend local

## 📋 Endpoints de la API (Referencia)

El backend .NET expone los siguientes endpoints (documentación de referencia):

- `POST /api/inventory` - Registrar movimiento de inventario
  ```json
  {
    "barcode": "1234567890",
    "cantidad": 1,
    "tipo": "venta",
    "usuario": "usuario1",
    "token": "opcional"
  }
  ```

## 🐛 Solución de Problemas

### La cámara no se inicia
- Verificar permisos de cámara en el navegador
- Usar HTTPS (requerido por la API de cámara en Chrome)
- Probar con GitHub Pages en lugar de archivo local

### Error al enviar al backend
- Verificar que el backend .NET esté ejecutándose
- Verificar que ngrok esté activo y la URL sea correcta
- Revisar la consola del navegador (F12) para errores
- Verificar el token si está configurado

### ngrok dice "tunnel not found"
- Reiniciar ngrok
- Verificar que el puerto coincida con el del backend
- Actualizar la URL en `index.html`

## 📜 Historial de Migración

1. **Versión 1.0** (Legacy): Google Apps Script backend + Google Sheets
2. **Versión 2.0** (Actual): .NET Backend + Frontend con ZXing

La migración a .NET proporciona:
- ✅ Mayor rendimiento y escalabilidad
- ✅ Control total sobre la base de datos
- ✅ Mejor manejo de concurrencia
- ✅ Lógica de negocio más robusta
- ✅ No depende de Google Sheets

## 📄 Licencia

MIT
