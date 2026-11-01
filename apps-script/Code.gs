/**
 * Brevet Pajak UNPAM Serang — Google Apps Script endpoint.
 * Public endpoint accepts registrations only. Admins review records in the private Google Sheet.
 * Do not add passwords, identity numbers, payment receipts, or admin read endpoints here.
 */
const PROP_SHEET_ID = 'BREVET_SHEET_ID';
const HEADERS = ['ID Pendaftar','Waktu Daftar','Nama Lengkap','Email','WhatsApp','Program','Format Kelas','Status Pendaftaran','Status Pembayaran'];
const ALLOWED_PROGRAMS = ['Brevet Pajak A','Brevet Pajak B','Brevet Pajak A dan B'];
const ALLOWED_FORMATS = ['Online (Zoom Meeting)','Offline (Tatap Muka)'];

function setupBrevetSheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(PROP_SHEET_ID);
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('Admin Pendaftaran — Brevet Pajak UNPAM Serang');
    id = ss.getId();
    props.setProperty(PROP_SHEET_ID, id);
  }
  let data = ss.getSheetByName('Pendaftar');
  if (!data) data = ss.insertSheet('Pendaftar');
  // Preserve existing registrations if setup is run again.
  if (data.getLastRow() === 0) data.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  data.setFrozenRows(1);
  data.getRange(1,1,1,HEADERS.length).setBackground('#13213a').setFontColor('#ffffff').setFontWeight('bold').setWrap(true);
  data.setColumnWidths(1,9,155);
  data.setColumnWidth(2,175);
  data.getRange('B:B').setNumberFormat('dd mmm yyyy hh:mm');
  data.getRange('D:E').setNumberFormat('@');
  data.getRange('A:A').setNumberFormat('@');
  data.getRange('H:H').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Baru','Diproses','Diterima','Ditolak'], true).setAllowInvalid(false).build()
  );
  data.getRange('I:I').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Belum diverifikasi','Menunggu pembayaran','Terverifikasi','Perlu konfirmasi','Dikembalikan'], true).setAllowInvalid(false).build()
  );
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) dash = ss.insertSheet('Dashboard', 0);
  dash.clear();
  dash.getRange('A1:B1').merge().setValue('DASHBOARD ADMIN — BREVET PAJAK UNPAM SERANG');
  dash.getRange('A1').setBackground('#13213a').setFontColor('#ffffff').setFontWeight('bold').setFontSize(14);
  dash.getRange('A3:B8').setValues([
    ['Ringkasan','Jumlah'],
    ['Total pendaftar','=COUNTA(Pendaftar!A2:A)'],
    ['Status Baru','=COUNTIF(Pendaftar!H2:H,"Baru")'],
    ['Sedang diproses','=COUNTIF(Pendaftar!H2:H,"Diproses")'],
    ['Pendaftar diterima','=COUNTIF(Pendaftar!H2:H,"Diterima")'],
    ['Pembayaran terverifikasi','=COUNTIF(Pendaftar!I2:I,"Terverifikasi")']
  ]);
  dash.getRange('A3:B3').setBackground('#d8b66e').setFontWeight('bold');
  dash.getRange('A10:B13').setValues([
    ['Program','Jumlah'],
    ['Brevet Pajak A','=COUNTIF(Pendaftar!F2:F,"Brevet Pajak A")'],
    ['Brevet Pajak B','=COUNTIF(Pendaftar!F2:F,"Brevet Pajak B")'],
    ['Paket Brevet A dan B','=COUNTIF(Pendaftar!F2:F,"Brevet Pajak A dan B")']
  ]);
  dash.getRange('A10:B10').setBackground('#d8b66e').setFontWeight('bold');
  dash.setColumnWidth(1,300); dash.setColumnWidth(2,180);
  dash.getRange('A3:B13').setVerticalAlignment('middle');
  dash.getRange('A3:B13').setBorder(true,true,true,true,true,true,'#e4e7ec',SpreadsheetApp.BorderStyle.SOLID);
  dash.getRange('A15:B15').merge().setValue('Data pribadi peserta hanya boleh diakses petugas yang diberi izin pada Google Sheets.');
  dash.getRange('A15').setWrap(true).setFontColor('#7b8493');
  SpreadsheetApp.flush();
  Logger.log('SPREADSHEET_URL=' + ss.getUrl());
  return ss.getUrl();
}

function doGet() {
  return HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width"><p style="font:16px Arial;padding:24px">Endpoint pendaftaran Brevet Pajak UNPAM Serang aktif. Kirim formulir melalui website untuk mendaftar.</p>');
}

function doPost(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const requestId = String(p.requestId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0,80);
  try {
    if (String(p.website || '').trim()) return response_('success', requestId);
    const name = clean_(p.fullName, 100);
    const email = clean_(p.email, 180).toLowerCase();
    const phone = clean_(p.phone, 30);
    const program = clean_(p.program, 60);
    const mode = clean_(p.mode, 60);\n    const consent = String(p.consent || '');
    if (!name || !email || !phone || !program || !mode) throw new Error('Lengkapi semua kolom wajib.');\n    if (consent !== 'yes') throw new Error('Persetujuan penggunaan data wajib dicentang.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Format email belum benar.');
    if (!/^[0-9+() .-]{8,30}$/.test(phone)) throw new Error('Nomor WhatsApp belum benar.');
    if (ALLOWED_PROGRAMS.indexOf(program) < 0 || ALLOWED_FORMATS.indexOf(mode) < 0) throw new Error('Pilihan program atau kelas tidak valid.');

    const cache = CacheService.getScriptCache();
    const throttleKey = 'reg_' + Utilities.base64EncodeWebSafe(email).replace(/=+$/,'').slice(0,100);
    if (cache.get(throttleKey)) throw new Error('Pendaftaran dengan email ini baru saja dikirim. Coba lagi beberapa saat.');
    const sheetId = PropertiesService.getScriptProperties().getProperty(PROP_SHEET_ID);
    if (!sheetId) throw new Error('Sistem belum disiapkan admin.');
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Pendaftar');
    if (!sheet) throw new Error('Sheet pendaftar tidak ditemukan.');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        Utilities.getUuid().slice(0,8).toUpperCase(),
        new Date(),
        safeCell_(name),
        safeCell_(email),
        safeCell_(phone),
        safeCell_(program),
        safeCell_(mode),
        'Baru',
        'Belum diverifikasi'
      ]);
      cache.put(throttleKey, '1', 45);
    } finally {
      lock.releaseLock();
    }
    return response_('success', requestId);
  } catch (err) {
    return response_('error', requestId, err && err.message ? err.message : 'Pendaftaran belum berhasil. Silakan coba kembali.');
  }
}

function clean_(value, max) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0,max);
}
function safeCell_(value) {
  return /^[=+@\- \t\r]/.test(String(value)) ? "'" + value : value;
}
function response_(status, requestId, message) {
  const payload = JSON.stringify({type:'brevet-registration-result', status:status, requestId:requestId, message:message || ''}).replace(/</g,'\\u003c');
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.top.postMessage(' + payload + ', "*");</script><p>Form processing complete.</p></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Brevet Pajak — Pendaftaran');
}