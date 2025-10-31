/**
 * inventory-sync.gs
 * Actualiza inventory.stock cuando se añade un movimiento en la hoja "movimientos".
 *
 * Asume:
 * - Hoja "inventory" encabezado: id, sku, nombre, barcode, precio, stock
 * - Hoja "movimientos" encabezado: mov_id, fecha, barcode, sku, nombre, cantidad, tipo, usuario
 *
 * Instalación:
 * - Pegar en el editor de Apps Script (mismo proyecto que webhook-sales.gs).
 * - Crear trigger si se desea: onMovimientoAdded -> From spreadsheet -> On form submit (opcional).
 */

const MOVIMIENTOS_SHEET_NAME = 'movimientos';
const INVENTORY_SHEET_NAME = 'inventory';
const LOG_SHEET_NAME = 'movimiento_log';

function onMovimientoAdded(e) {
  // Si se usa trigger "On change", filtrar solo INSERT_ROW (protección incluida)
  if (e && e.changeType && e.changeType !== 'INSERT_ROW') return;
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ms = ss.getSheetByName(MOVIMIENTOS_SHEET_NAME);
    const inv = ss.getSheetByName(INVENTORY_SHEET_NAME);
    if (!ms || !inv) {
      logError('Sheets missing', `Missing: ${!ms ? MOVIMIENTOS_SHEET_NAME : ''} ${!inv ? INVENTORY_SHEET_NAME : ''}`);
      return;
    }

    const movValues = ms.getDataRange().getValues();
    if (movValues.length < 2) return; // nada que procesar
    const movHeaders = movValues[0].map(h => String(h).trim().toLowerCase());
    const lastMovRow = movValues[movValues.length - 1];
    const movimiento = rowToObj(movHeaders, lastMovRow);

    const barcode = String(movimiento.barcode || '').trim();
    const cantidad = Number(movimiento.cantidad) || 0;
    const tipo = String(movimiento.tipo || '').trim().toLowerCase();

    if (!barcode) { logError('Missing barcode', JSON.stringify(movimiento)); return; }
    if (!tipo) { logError('Missing tipo', JSON.stringify(movimiento)); return; }

    const invValues = inv.getDataRange().getValues();
    if (invValues.length < 1) { logError('Inventory empty', 'No header row'); return; }
    const invHeaders = invValues[0].map(h => String(h).trim().toLowerCase());
    const barcodeIdx = invHeaders.indexOf('barcode');
    const stockIdx = invHeaders.indexOf('stock');
    if (barcodeIdx === -1 || stockIdx === -1) { logError('Inventory headers missing', `Headers: ${invHeaders.join(',')}`); return; }

    const invRows = invValues.slice(1);
    let sheetRowNumber = -1;
    for (let i = 0; i < invRows.length; i++) {
      if (String(invRows[i][barcodeIdx]) === barcode) { sheetRowNumber = i + 2; break; }
    }

    if (sheetRowNumber === -1) {
      // No existe: crear fila nueva con stock inicial según tipo
      let initialStock = 0;
      if (tipo === 'venta') initialStock = Math.max(0, -cantidad);
      else initialStock = cantidad;
      const newRow = new Array(invHeaders.length).fill('');
      newRow[barcodeIdx] = barcode;
      newRow[stockIdx] = initialStock;
      inv.appendRow(newRow);
      logEvent('Inventory row created', `barcode=${barcode} stock=${initialStock}`);
      return;
    }

    const stockCell = inv.getRange(sheetRowNumber, stockIdx + 1);
    const currentStock = Number(stockCell.getValue()) || 0;
    let newStock = currentStock;
    if (tipo === 'venta') newStock = currentStock - cantidad;
    else if (tipo === 'entrada') newStock = currentStock + cantidad;
    else if (tipo === 'ajuste') newStock = currentStock + cantidad;
    else { logError('Unknown tipo', tipo); return; }

    if (newStock < 0) newStock = 0;
    stockCell.setValue(newStock);
    logEvent('Stock updated', `barcode=${barcode} from ${currentStock} to ${newStock}`);
  } catch (err) {
    logError('Exception', err.toString());
  }
}

function rowToObj(headers, row) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) obj[headers[i]] = row[i];
  return obj;
}

function logEvent(action, message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let log = ss.getSheetByName(LOG_SHEET_NAME);
  if (!log) log = ss.insertSheet(LOG_SHEET_NAME);
  log.appendRow([new Date(), 'INFO', action, message]);
}

function logError(action, message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let log = ss.getSheetByName(LOG_SHEET_NAME);
  if (!log) log = ss.insertSheet(LOG_SHEET_NAME);
  log.appendRow([new Date(), 'ERROR', action, message]);
}
