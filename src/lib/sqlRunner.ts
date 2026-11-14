import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { SQL_SCHEMA } from "@/data/sqlTestProblems";

let sqlPromise: Promise<SqlJsStatic> | null = null;
const loadSql = () => (sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl }));

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

/** Buat database baru berisi data latihan (setiap eksekusi mulai dari data yang sama). */
async function freshDb(): Promise<Database> {
  const SQL = await loadSql();
  const db = new SQL.Database();
  db.run(SQL_SCHEMA);
  return db;
}

function toResult(res: ReturnType<Database["exec"]>): QueryResult {
  const last = res[res.length - 1];
  if (!last) return { columns: [], rows: [] };
  return { columns: last.columns, rows: last.values.map((r) => r.map((v) => (v instanceof Uint8Array ? "[blob]" : v))) };
}

export async function runQuery(sql: string): Promise<QueryResult> {
  const db = await freshDb();
  try {
    return toResult(db.exec(sql));
  } finally {
    db.close();
  }
}

const normCell = (v: string | number | null) => (typeof v === "number" ? Number(v.toFixed(2)) : v === null ? null : String(v).trim());
const rowKey = (r: (string | number | null)[]) => JSON.stringify(r.map(normCell));

export interface CheckResult {
  passed: boolean;
  message: string;
  user: QueryResult;
  expected: QueryResult;
}

/** Bandingkan hasil query alumni dengan query acuan: jumlah kolom, jumlah baris, isi (dan urutan bila diminta). */
export async function checkQuery(userSql: string, solutionSql: string, ordered: boolean): Promise<CheckResult> {
  const expected = await runQuery(solutionSql);
  const user = await runQuery(userSql);
  const fail = (message: string) => ({ passed: false, message, user, expected });
  if (user.columns.length !== expected.columns.length) {
    return fail(`Jumlah kolom belum sesuai: hasilmu ${user.columns.length} kolom, seharusnya ${expected.columns.length} (${expected.columns.join(", ")}).`);
  }
  if (user.rows.length !== expected.rows.length) {
    return fail(`Jumlah baris belum sesuai: hasilmu ${user.rows.length} baris, seharusnya ${expected.rows.length}.`);
  }
  const a = user.rows.map(rowKey);
  const b = expected.rows.map(rowKey);
  if (ordered) {
    const i = a.findIndex((k, idx) => k !== b[idx]);
    if (i >= 0) {
      const sameSet = [...a].sort().join("|") === [...b].sort().join("|");
      return fail(sameSet ? "Isi sudah benar, tapi urutan barisnya belum sesuai permintaan soal." : `Baris ke-${i + 1} belum sesuai.`);
    }
  } else if ([...a].sort().join("|") !== [...b].sort().join("|")) {
    return fail("Isi hasil belum sesuai. Cek lagi kondisi filter, join, atau agregasinya.");
  }
  return { passed: true, message: "Benar! Hasil query kamu sesuai.", user, expected };
}
