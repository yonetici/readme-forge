// Minimal dependency-free ZIP writer (STORE method, no compression). Enough to
// bundle a handful of small text/SVG files into a ready-to-commit archive,
// without pulling in a zip library — in keeping with the project's "no
// needless dependencies" stance.

export interface ZipEntry {
  path: string;
  content: string;
}

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

export function createZip(entries: ZipEntry[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const u16 = (n: number) => new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
  const u32 = (n: number) =>
    new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff]);

  for (const entry of entries) {
    const nameBytes = enc.encode(entry.path);
    const data = enc.encode(entry.content);
    const crc = crc32(data);
    const size = data.length;

    // Local file header
    const local = concat([
      u32(0x04034b50),
      u16(20), // version needed
      u16(0), // flags
      u16(0), // method: store
      u16(0), // mod time
      u16(0x21), // mod date (1980-01-01)
      u32(crc),
      u32(size), // compressed
      u32(size), // uncompressed
      u16(nameBytes.length),
      u16(0), // extra len
      nameBytes,
      data,
    ]);
    chunks.push(local);

    // Central directory record
    central.push(
      concat([
        u32(0x02014b50),
        u16(20), // version made by
        u16(20), // version needed
        u16(0),
        u16(0),
        u16(0),
        u16(0x21),
        u32(crc),
        u32(size),
        u32(size),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0), // external attrs
        u32(offset),
        nameBytes,
      ])
    );
    offset += local.length;
  }

  const centralStart = offset;
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralSize),
    u32(centralStart),
    u16(0),
  ]);

  const all = concat([...chunks, ...central, end]);
  // Single cast: TS's typed-array generics don't line up with BlobPart, but the
  // runtime value is a plain Uint8Array backed by an ArrayBuffer.
  return new Blob([all as unknown as BlobPart], { type: "application/zip" });
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
