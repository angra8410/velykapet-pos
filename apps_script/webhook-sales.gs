/**
 * webhook-sales.gs
 * Web endpoint (doPost) para recibir ventas desde el cliente mobile y añadirlas a "movimientos".
 *
 * POST JSON esperado:
 * {
 *   "barcode": "7801234567890",
 *   "cantidad": 1,
 *   "tipo": "venta",
 *   "usuario": "caja1",
 *   "token": "mi-secreto-si-lo-deseas"
 * }
 *
 * Publicar como Web App (Deploy -> New deployment -> Web app)
 * - Execute as: Me
 * - Who has access: Anyone with link (o Anyone, even anonymous) — o restringir via token
 */

const MOVIMIENTOS_SHEET_NAME = 'movimientos';

function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && Object.keys(e.parameter).length) {
      data = e.parameter;
    } else {
      return jsonResponse({ ok: false, error: "No data" });
    }

    // Opcional: validar token
    var EXPECTED_TOKEN = ''; // PONER token si querés (ej: 'mipase')
    if (EXPECTED_TOKEN && data.token !== EXPECTED_TOKEN) {
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

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
