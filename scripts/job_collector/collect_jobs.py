#!/usr/bin/env python3
"""
Pengumpul lowongan untuk Job Ready Hub (tanpa AI, hanya library standar Python).

Sumber yang didukung HANYA API lowongan publik resmi dari sistem rekrutmen
(ATS) yang memang disediakan untuk ditampilkan di situs lain:
  - Greenhouse      https://boards-api.greenhouse.io/v1/boards/<slug>/jobs
  - Lever           https://api.lever.co/v0/postings/<slug>?mode=json
  - SmartRecruiters https://api.smartrecruiters.com/v1/companies/<slug>/postings
  - Ashby           https://api.ashbyhq.com/posting-api/job-board/<slug>

Sengaja TIDAK mendukung LinkedIn, Glints, Jobstreet, dan situs lain yang
melarang pengambilan data otomatis di ketentuan layanannya.

Hasil: file CSV dan JSON berisi draft lowongan untuk direview admin, dengan
kolom yang mengikuti tabel `job_listings` + link sumber. Deskripsi lengkap
tidak disimpan; admin menulis ringkasan sendiri saat review.

Pemakaian:
  python3 collect_jobs.py --config companies.json --out hasil
  python3 collect_jobs.py --config companies.json --out hasil --all   # tanpa filter kata kunci
"""
from __future__ import annotations

import argparse
import csv
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

USER_AGENT = "IntelligoJobCollector/1.0"
REQUEST_DELAY_SECONDS = 1.0  # jeda antar-request supaya sopan ke server sumber
TIMEOUT_SECONDS = 20

# Filter judul posisi (tanpa AI): cocok bila judul mengandung salah satu pola.
DEFAULT_INCLUDE = [
    r"\bdata\b", r"\banalyst\b", r"\banalytics?\b", r"business intelligence", r"\bbi\b",
    r"machine learning", r"\bml\b", r"\bai\b", r"artificial intelligence", r"scientist",
    r"\betl\b", r"\bsql\b", r"insight", r"reporting",
]
DEFAULT_EXCLUDE = [r"\bprincipal\b", r"\bdirector\b", r"\bhead of\b", r"\bvp\b", r"\bstaff\b"]

# Tag skill dideteksi dari judul + potongan teks dengan pencocokan kata.
SKILL_PATTERNS = {
    "SQL": r"\bsql\b", "Python": r"\bpython\b", "R": r"\bR\b", "Excel": r"\bexcel\b",
    "Tableau": r"\btableau\b", "Power BI": r"power ?bi", "Looker": r"\blooker\b",
    "Spark": r"\bspark\b", "Airflow": r"\bairflow\b", "dbt": r"\bdbt\b",
    "BigQuery": r"bigquery", "Statistics": r"statistic", "Machine Learning": r"machine learning",
    "Deep Learning": r"deep learning", "NLP": r"\bnlp\b", "TensorFlow": r"tensorflow",
    "PyTorch": r"pytorch", "AWS": r"\baws\b", "GCP": r"\bgcp\b|google cloud", "Azure": r"\bazure\b",
}


@dataclass
class JobDraft:
    title: str
    company: str
    location: str
    job_type: str
    experience: str
    tags: list[str]
    apply_url: str
    source_name: str
    source_job_id: str
    posted_at: str
    collected_at: str
    requirements: list[str] = field(default_factory=list)


def fetch_json(url: str) -> object:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
        return json.loads(resp.read().decode("utf-8"))


def strip_html(text: str) -> str:
    text = html.unescape(text or "")  # Greenhouse mengirim HTML yang di-escape
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text).replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def detect_skills(text: str) -> list[str]:
    return [name for name, pat in SKILL_PATTERNS.items() if re.search(pat, text, re.IGNORECASE)][:8]


def detect_experience(title: str) -> str:
    t = title.lower()
    if re.search(r"intern|magang|trainee", t):
        return "Magang"
    if re.search(r"junior|jr\.?|entry|associate|graduate", t):
        return "Entry level"
    if re.search(r"senior|sr\.?|lead", t):
        return "Senior"
    return ""


def detect_job_type(text: str) -> str:
    t = text.lower()
    if re.search(r"intern|magang", t):
        return "Internship"
    if re.search(r"contract|kontrak|freelance", t):
        return "Contract"
    if re.search(r"part[- ]time", t):
        return "Part-time"
    return "Full-time"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


# --- Adapter per sumber -------------------------------------------------------

def from_greenhouse(slug: str, company: str) -> list[JobDraft]:
    data = fetch_json(f"https://boards-api.greenhouse.io/v1/boards/{urllib.parse.quote(slug)}/jobs?content=true")
    out = []
    for j in data.get("jobs", []):
        text = f"{j.get('title', '')} {strip_html(j.get('content', ''))[:3000]}"
        out.append(JobDraft(
            title=j.get("title", "").strip(), company=company,
            location=(j.get("location") or {}).get("name", "") or "",
            job_type=detect_job_type(text), experience=detect_experience(j.get("title", "")),
            tags=detect_skills(text), apply_url=j.get("absolute_url", ""),
            source_name="Greenhouse", source_job_id=str(j.get("id", "")),
            posted_at=j.get("updated_at", "") or "", collected_at=now_iso(),
        ))
    return out


def from_lever(slug: str, company: str) -> list[JobDraft]:
    data = fetch_json(f"https://api.lever.co/v0/postings/{urllib.parse.quote(slug)}?mode=json")
    out = []
    for j in data if isinstance(data, list) else []:
        cats = j.get("categories") or {}
        text = f"{j.get('text', '')} {j.get('descriptionPlain', '')[:3000]}"
        posted = j.get("createdAt")
        out.append(JobDraft(
            title=j.get("text", "").strip(), company=company, location=cats.get("location", "") or "",
            job_type=cats.get("commitment") or detect_job_type(text), experience=detect_experience(j.get("text", "")),
            tags=detect_skills(text), apply_url=j.get("hostedUrl", ""),
            source_name="Lever", source_job_id=str(j.get("id", "")),
            posted_at=datetime.fromtimestamp(posted / 1000, timezone.utc).isoformat() if isinstance(posted, (int, float)) else "",
            collected_at=now_iso(),
        ))
    return out


def from_smartrecruiters(slug: str, company: str) -> list[JobDraft]:
    out, offset = [], 0
    while True:
        data = fetch_json(f"https://api.smartrecruiters.com/v1/companies/{urllib.parse.quote(slug)}/postings?limit=100&offset={offset}")
        items = data.get("content", [])
        for j in items:
            loc = j.get("location") or {}
            title = j.get("name", "").strip()
            out.append(JobDraft(
                title=title, company=company,
                location=", ".join(x for x in [loc.get("city"), loc.get("country", "").upper()] if x),
                job_type=((j.get("typeOfEmployment") or {}).get("label")) or detect_job_type(title),
                experience=((j.get("experienceLevel") or {}).get("label")) or detect_experience(title),
                tags=detect_skills(title),
                apply_url=f"https://jobs.smartrecruiters.com/{slug}/{j.get('id', '')}",
                source_name="SmartRecruiters", source_job_id=str(j.get("id", "")),
                posted_at=j.get("releasedDate", "") or "", collected_at=now_iso(),
            ))
        offset += len(items)
        if not items or offset >= data.get("totalFound", 0):
            break
        time.sleep(REQUEST_DELAY_SECONDS)
    return out


def from_ashby(slug: str, company: str) -> list[JobDraft]:
    data = fetch_json(f"https://api.ashbyhq.com/posting-api/job-board/{urllib.parse.quote(slug)}")
    out = []
    for j in data.get("jobs", []):
        text = f"{j.get('title', '')} {j.get('descriptionPlain', '')[:3000]}"
        out.append(JobDraft(
            title=j.get("title", "").strip(), company=company, location=j.get("location", "") or "",
            job_type=j.get("employmentType") or detect_job_type(text), experience=detect_experience(j.get("title", "")),
            tags=detect_skills(text), apply_url=j.get("jobUrl", ""),
            source_name="Ashby", source_job_id=str(j.get("id", "")),
            posted_at=j.get("publishedAt", "") or "", collected_at=now_iso(),
        ))
    return out


ADAPTERS = {"greenhouse": from_greenhouse, "lever": from_lever, "smartrecruiters": from_smartrecruiters, "ashby": from_ashby}


# --- Filter & output ----------------------------------------------------------

def matches(job: JobDraft, include: list[str], exclude: list[str], locations: list[str]) -> bool:
    title = job.title.lower()
    if include and not any(re.search(p, title, re.IGNORECASE) for p in include):
        return False
    if any(re.search(p, title, re.IGNORECASE) for p in exclude):
        return False
    if locations and not any(loc.lower() in job.location.lower() for loc in locations):
        return False
    return bool(job.title and job.apply_url.startswith("https://"))


def write_outputs(jobs: list[JobDraft], out_prefix: Path) -> None:
    out_prefix.parent.mkdir(parents=True, exist_ok=True)
    rows = [asdict(j) for j in jobs]
    out_prefix.with_suffix(".json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    with out_prefix.with_suffix(".csv").open("w", newline="", encoding="utf-8") as f:
        fields = list(JobDraft.__dataclass_fields__.keys())
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            r = dict(r, tags=", ".join(r["tags"]), requirements=", ".join(r["requirements"]))
            w.writerow(r)


def main() -> int:
    ap = argparse.ArgumentParser(description="Kumpulkan draft lowongan dari API ATS publik.")
    ap.add_argument("--config", required=True, help="File JSON daftar perusahaan (lihat companies.example.json)")
    ap.add_argument("--out", default="hasil/lowongan", help="Prefix file output (tanpa ekstensi)")
    ap.add_argument("--all", action="store_true", help="Matikan filter kata kunci judul")
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    include = [] if args.all else cfg.get("include_patterns", DEFAULT_INCLUDE)
    exclude = [] if args.all else cfg.get("exclude_patterns", DEFAULT_EXCLUDE)
    locations = cfg.get("locations", [])

    collected: list[JobDraft] = []
    seen: set[str] = set()
    for c in cfg.get("companies", []):
        ats, slug, name = c.get("ats", "").lower(), c.get("slug", ""), c.get("name") or c.get("slug", "")
        adapter = ADAPTERS.get(ats)
        if not adapter or not slug:
            print(f"[lewati] {name}: ats '{ats}' tidak didukung atau slug kosong", file=sys.stderr)
            continue
        try:
            jobs = adapter(slug, name)
        except urllib.error.HTTPError as e:
            print(f"[gagal] {name} ({ats}/{slug}): HTTP {e.code}", file=sys.stderr)
            continue
        except Exception as e:  # noqa: BLE001 - satu sumber gagal tidak menghentikan yang lain
            print(f"[gagal] {name} ({ats}/{slug}): {type(e).__name__}: {e}", file=sys.stderr)
            continue
        kept = [j for j in jobs if matches(j, include, exclude, locations) and j.apply_url not in seen]
        seen.update(j.apply_url for j in kept)
        collected.extend(kept)
        print(f"[ok] {name}: {len(jobs)} lowongan, {len(kept)} lolos filter")
        time.sleep(REQUEST_DELAY_SECONDS)

    write_outputs(collected, Path(args.out))
    print(f"Selesai: {len(collected)} draft lowongan -> {args.out}.csv / .json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
