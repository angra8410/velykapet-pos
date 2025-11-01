/**
 * webhook-sales.gs
 * Web endpoint (doPost) para recibir ventas desde el cliente mobile y añadirlas a "movimientos".
 *
 * No definir constantes aquí — se leen desde config.gs
 *
 * Nota:
 * - Esta versión asume que existe la función applyMovementToInventory(barcode, cantidad, tipo)
 *   en otro archivo (por ejemplo inventory-sync.gs) o puedes copiarla aquí si prefieres.
 * - Asegúrate de tener config.gs con las constantes:
 *     MOVIMIENTOS_SHEET_NAME, INVENTORY_SHEET_NAME, LOG_SHEET_NAME, EXPECTED_TOKEN
 */

function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.type && e.postData.type.indexOf("application/json") !== -1) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && Object.keys(e.parameter).length) {
      data = e.parameter;
    } else {
      return jsonResponse({ ok: false, error: "No data" });
    }

    // Validar token simple (desde config.gs)
    if (typeof EXPECTED_TOKEN !== 'undefined' && EXPECTED_TOKEN && data.token !== EXPECTED_TOKEN) {
      return jsonResponse({ ok: false, error: "Invalid token" });
    }

    var barcode = String(data.barcode || '').trim();
    var cantidad = Number(data.cantidad) || 1;
    var tipo = String(data.tipo || 'venta').trim().toLowerCase();
    var usuario = String(data.usuario || 'movil').trim();
    var fecha = new Date();

    if (!barcode) return jsonResponse({ ok: false, error: "Missing barcode" });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ms = ss.getSheetByName(MOVIMIENTOS_SHEET_NAME);
    if (!ms) return jsonResponse({ ok: false, error: "movimientos sheet missing" });

    var newRow = ['', fecha, barcode, '', '', cantidad, tipo, usuario];
    ms.appendRow(newRow);

    // intentar actualizar inventory inmediatamente si la función existe
    try {
      if (typeof applyMovementToInventory === 'function') {
        var res = applyMovementToInventory(barcode, cantidad, tipo);
        return jsonResponse({ ok: true, inventory: res || { ok: true } });
      } else {
        // Si no existe la función, devolvemos ok pero con advertencia
        return jsonResponse({ ok: true, warning: 'movement saved but applyMovementToInventory not defined' });
      }
    } catch (err) {
      // movimiento guardado, pero ocurrió un error al actualizar inventory
      return jsonResponse({ ok: true, warning: 'movement saved but inventory update failed: ' + err.toString() });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
