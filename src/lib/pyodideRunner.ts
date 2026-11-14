// Menjalankan solusi pandas alumni sepenuhnya di browser via Pyodide (Python-in-WASM),
// jadi tidak perlu backend untuk eksekusi kode -- zero risiko keamanan server dan
// hasil tes benar-benar diverifikasi (bukan sekadar ditebak oleh AI).
declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string[]) => Promise<void>;
}

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const PREAMBLE = `
import pandas as pd
import numpy as np
import json as _json

def _normalize(obj):
    if isinstance(obj, pd.DataFrame):
        df = obj.reset_index(drop=True)
        df = df[sorted(df.columns)]
        try:
            df = df.sort_values(by=list(df.columns)).reset_index(drop=True)
        except TypeError:
            pass
        return df
    if isinstance(obj, pd.Series):
        s = obj.reset_index(drop=True)
        try:
            s = s.sort_values().reset_index(drop=True)
        except TypeError:
            pass
        return s
    return obj

def check_equal(actual, expected):
    a = _normalize(actual)
    b = _normalize(expected)
    if isinstance(a, pd.DataFrame) and isinstance(b, pd.DataFrame):
        try:
            pd.testing.assert_frame_equal(a, b, check_dtype=False, atol=1e-3, rtol=1e-3)
            return True
        except AssertionError:
            return False
    if isinstance(a, pd.Series) and isinstance(b, pd.Series):
        try:
            pd.testing.assert_series_equal(a, b, check_dtype=False, atol=1e-3, rtol=1e-3, check_names=False)
            return True
        except AssertionError:
            return False
    try:
        return bool(a == b)
    except Exception:
        return False

def run_tests(test_cases, solve_fn):
    results = []
    for i, (args, expected) in enumerate(test_cases):
        try:
            call_args = [a.copy() if hasattr(a, "copy") else a for a in args]
            actual = solve_fn(*call_args)
            ok = check_equal(actual, expected)
            results.append({"case": i + 1, "passed": bool(ok), "error": None})
        except Exception as e:
            results.append({"case": i + 1, "passed": False, "error": f"{type(e).__name__}: {e}"})
    return results

def summarize(results):
    return {
        "results": results,
        "passedCount": sum(1 for r in results if r["passed"]),
        "totalCount": len(results),
        "allPassed": all(r["passed"] for r in results),
    }
`;

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoadPromise: Promise<PyodideInterface> | null = null;
let preambleLoaded = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Python engine dari CDN. Periksa koneksi internet."));
    document.body.appendChild(script);
  });
}

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (!pyodideLoadPromise) {
    pyodideLoadPromise = (async () => {
      if (!window.loadPyodide) {
        await loadScript(`${PYODIDE_CDN_BASE}pyodide.js`);
      }
      const pyodide = await window.loadPyodide!({ indexURL: PYODIDE_CDN_BASE });
      await pyodide.loadPackage(["pandas", "numpy"]);
      pyodideInstance = pyodide;
      return pyodide;
    })();
  }
  return pyodideLoadPromise;
}

export interface TestCaseResult {
  case: number;
  passed: boolean;
  error: string | null;
}

export interface RunResult {
  success: boolean;
  results: TestCaseResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  errorMessage?: string;
}

/** Preload Pyodide + pandas di background (mis. saat halaman coding test dibuka),
 * supaya klik "Run" pertama alumni tidak menunggu proses loading ~beberapa detik. */
export async function preloadPyodide(): Promise<void> {
  await getPyodide();
}

/** Jalankan kode alumni terhadap test case suatu soal. `setupCode` mendefinisikan
 * TEST_CASES python (per soal), `userCode` harus mendefinisikan fungsi `solve`. */
export async function runSolution(setupCode: string, userCode: string): Promise<RunResult> {
  try {
    const pyodide = await getPyodide();

    if (!preambleLoaded) {
      await pyodide.runPythonAsync(PREAMBLE);
      preambleLoaded = true;
    }

    await pyodide.runPythonAsync(setupCode);
    await pyodide.runPythonAsync(userCode);
    const resultJson = (await pyodide.runPythonAsync(
      "_json.dumps(summarize(run_tests(TEST_CASES, solve)))"
    )) as string;

    const parsed = JSON.parse(resultJson) as Omit<RunResult, "success">;
    return { success: true, ...parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      results: [],
      passedCount: 0,
      totalCount: 0,
      allPassed: false,
      errorMessage: message,
    };
  }
}
