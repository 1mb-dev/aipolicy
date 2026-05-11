// Manual ZIP construction: stored (no compression) entries.
// Structure: [local file header + data] * N + central directory + EOCD.
// Filenames are stored as raw bytes; '/' in the name yields nested paths
// in the extracted tree without explicit directory entries.
// Used by browser (scripts/main.js) and Node test (scripts/test-zip-extraction.js).
// Requires TextEncoder, DataView, ArrayBuffer, Blob (all in Node 18+ globals).

export function createZip(files) {
  const encoder = new TextEncoder();
  const entries = files.map(f => ({
    name: encoder.encode(f.name),
    data: encoder.encode(f.content),
  }));

  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c;
  }
  function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  let localSize = 0;
  for (const e of entries) localSize += 30 + e.name.length + e.data.length;
  let cdSize = 0;
  for (const e of entries) cdSize += 46 + e.name.length;
  const eocdSize = 22;
  const totalSize = localSize + cdSize + eocdSize;

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  let offset = 0;
  const offsets = [];

  // Local file headers + data
  for (const e of entries) {
    const crc = crc32(e.data);
    offsets.push({ offset, crc, size: e.data.length, nameLen: e.name.length });

    view.setUint32(offset, 0x04034B50, true); // signature
    view.setUint16(offset + 4, 20, true);      // version needed
    view.setUint16(offset + 6, 0, true);       // flags
    view.setUint16(offset + 8, 0, true);       // compression (stored)
    view.setUint16(offset + 10, 0, true);      // mod time
    view.setUint16(offset + 12, 0, true);      // mod date
    view.setUint32(offset + 14, crc, true);    // crc-32
    view.setUint32(offset + 18, e.data.length, true); // compressed size
    view.setUint32(offset + 22, e.data.length, true); // uncompressed size
    view.setUint16(offset + 26, e.name.length, true); // filename length
    view.setUint16(offset + 28, 0, true);      // extra field length
    offset += 30;

    new Uint8Array(buf, offset, e.name.length).set(e.name);
    offset += e.name.length;

    new Uint8Array(buf, offset, e.data.length).set(e.data);
    offset += e.data.length;
  }

  // Central directory
  const cdOffset = offset;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const o = offsets[i];

    view.setUint32(offset, 0x02014B50, true); // signature
    view.setUint16(offset + 4, 20, true);      // version made by
    view.setUint16(offset + 6, 20, true);      // version needed
    view.setUint16(offset + 8, 0, true);       // flags
    view.setUint16(offset + 10, 0, true);      // compression
    view.setUint16(offset + 12, 0, true);      // mod time
    view.setUint16(offset + 14, 0, true);      // mod date
    view.setUint32(offset + 16, o.crc, true);  // crc-32
    view.setUint32(offset + 20, o.size, true); // compressed size
    view.setUint32(offset + 24, o.size, true); // uncompressed size
    view.setUint16(offset + 28, o.nameLen, true); // filename length
    view.setUint16(offset + 30, 0, true);      // extra field length
    view.setUint16(offset + 32, 0, true);      // comment length
    view.setUint16(offset + 34, 0, true);      // disk number start
    view.setUint16(offset + 36, 0, true);      // internal file attributes
    view.setUint32(offset + 38, 0, true);      // external file attributes
    view.setUint32(offset + 42, o.offset, true); // local header offset
    offset += 46;

    new Uint8Array(buf, offset, e.name.length).set(e.name);
    offset += e.name.length;
  }

  // End of central directory record
  view.setUint32(offset, 0x06054B50, true);    // signature
  view.setUint16(offset + 4, 0, true);         // disk number
  view.setUint16(offset + 6, 0, true);         // cd disk number
  view.setUint16(offset + 8, entries.length, true);  // cd entries on disk
  view.setUint16(offset + 10, entries.length, true); // cd entries total
  view.setUint32(offset + 12, offset - cdOffset, true); // cd size
  view.setUint32(offset + 16, cdOffset, true); // cd offset
  view.setUint16(offset + 20, 0, true);        // comment length

  return new Blob([buf], { type: 'application/zip' });
}
