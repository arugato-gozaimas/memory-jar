// Code.gs — Memory Jar live endpoint
// Deploy as Web App: Execute as Me, Who has access: Anyone
// After edits: Deploy → Manage deployments → ✎ → New version → Deploy

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) {
    return json_([]);
  }

  const headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return h.toString();
    });

  const idx = {
    message: headers.findIndex(function (h) {
      return /memory|thank you|message|leave/i.test(h);
    }),
    author: headers.findIndex(function (h) {
      return /sign|^name$|author/i.test(h) && !/photo|image|file|upload|picture/i.test(h);
    }),
    image: headers.findIndex(function (h) {
      return /photo|image|file|upload|picture|attach/i.test(h);
    }),
  };

  // Fallback: find a column that contains Drive links / filenames with hyperlinks
  if (idx.image < 0) {
    idx.image = findImageColumn_(sheet, headers, lastRow, lastCol);
  }

  const debug = e && e.parameter && e.parameter.debug === "1";
  const samples = [];

  const memories = [];
  for (var r = 2; r <= lastRow; r++) {
    if (idx.message < 0) break;

    const message = sheet
      .getRange(r, idx.message + 1)
      .getValue()
      .toString()
      .trim();
    if (!message) continue;

    const author =
      idx.author > -1
        ? sheet
            .getRange(r, idx.author + 1)
            .getValue()
            .toString()
            .trim()
        : "";

    let image;
    let rawImageCell = "";
    if (idx.image > -1) {
      rawImageCell = getLinkedCellValue_(sheet, r, idx.image + 1);
      const fileId = extractDriveFileId_(rawImageCell);
      if (fileId) {
        try {
          DriveApp.getFileById(fileId).setSharing(
            DriveApp.Access.ANYONE_WITH_LINK,
            DriveApp.Permission.VIEW
          );
        } catch (err) {
          // Keep going — thumbnail may still work if Form folder is shared.
        }
        image =
          "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200";
      }
    }

    if (debug && samples.length < 5) {
      samples.push({
        row: r,
        rawImageCell: rawImageCell,
        fileId: extractDriveFileId_(rawImageCell),
        image: image || null,
      });
    }

    const out = { id: "memory-" + memories.length + 1, message: message };
    if (author) out.author = author;
    if (image) out.image = image;
    memories.push(out);
  }

  if (debug) {
    return json_({
      headers: headers,
      idx: idx,
      samples: samples,
      memories: memories,
    });
  }

  return json_(memories);
}

/** Prefer hyperlink URL (Forms file uploads), then formula, then plain value. */
function getLinkedCellValue_(sheet, row, col) {
  const range = sheet.getRange(row, col);

  const rich = range.getRichTextValue();
  if (rich) {
    const url = rich.getLinkUrl();
    if (url) return url;
    const runs = rich.getRuns();
    for (var i = 0; i < runs.length; i++) {
      const runUrl = runs[i].getLinkUrl();
      if (runUrl) return runUrl;
    }
  }

  const formula = range.getFormula();
  if (formula) {
    const match = formula.match(/HYPERLINK\("([^"]+)"/i);
    if (match && match[1]) return match[1];
  }

  return range.getValue().toString();
}

function findImageColumn_(sheet, headers, lastRow, lastCol) {
  for (var c = 0; c < lastCol; c++) {
    // skip obvious non-image columns by header
    if (/timestamp|memory|thank|message|leave|sign|name|email/i.test(headers[c])) {
      continue;
    }
    for (var r = 2; r <= Math.min(lastRow, 12); r++) {
      const cell = getLinkedCellValue_(sheet, r, c + 1);
      if (extractDriveFileId_(cell) || /drive\.google\.com/i.test(cell)) {
        return c;
      }
    }
  }
  return -1;
}

function extractDriveFileId_(cell) {
  if (!cell) return null;
  const text = cell.toString();
  const patterns = [
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/,
  ];
  for (var i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match && match[1]) return match[1];
  }
  return null;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON
  );
}
