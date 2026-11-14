export interface CodingTestProblem {
  id: string;
  title: string;
  difficulty: "Pemula" | "Menengah" | "Lanjutan";
  description: string;
  starterCode: string;
  /** Python: mendefinisikan TEST_CASES untuk soal ini, dijalankan setelah preamble. */
  setupCode: string;
}

export const codingTestProblems: CodingTestProblem[] = [
  {
    id: "filter-rows",
    title: "Filter Baris Berdasarkan Kondisi",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `product`, `category`, `price`, dan `quantity`.\n\n" +
      'Buat fungsi `solve(df)` yang mengembalikan hanya baris dengan `category == "Electronics"` **dan** `price > 500000`.\n\n' +
      "Contoh: dari daftar Laptop, Mouse, Monitor, Keyboard (semua Electronics) dan Fridge (Appliance), " +
      "hanya Laptop dan Monitor yang harganya di atas 500.000 sehingga lolos filter.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "product": ["Laptop", "Mouse", "Monitor", "Keyboard", "Fridge"],
        "category": ["Electronics", "Electronics", "Electronics", "Electronics", "Appliance"],
        "price": [12000000, 150000, 2500000, 300000, 5000000],
        "quantity": [3, 20, 5, 15, 2],
    })
    exp1 = pd.DataFrame({
        "product": ["Laptop", "Monitor"],
        "category": ["Electronics", "Electronics"],
        "price": [12000000, 2500000],
        "quantity": [3, 5],
    })

    df2 = pd.DataFrame({
        "product": ["TV", "Chair"],
        "category": ["Electronics", "Furniture"],
        "price": [400000, 900000],
        "quantity": [1, 1],
    })
    exp2 = pd.DataFrame({
        "product": [], "category": [], "price": [], "quantity": [],
    }).astype(df2.dtypes.to_dict())

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "computed-column",
    title: "Tambah Kolom Hasil Perhitungan",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `price` dan `quantity`.\n\n" +
      "Buat fungsi `solve(df)` yang menambahkan kolom baru `total` berisi hasil `price * quantity`, " +
      "lalu mengembalikan DataFrame tersebut (kolom asli tetap ada).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"price": [10000, 25000, 5000], "quantity": [2, 1, 4]})
    exp1 = df1.copy()
    exp1["total"] = [20000, 25000, 20000]

    df2 = pd.DataFrame({"price": [100], "quantity": [3]})
    exp2 = df2.copy()
    exp2["total"] = [300]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "missing-values",
    title: "Menangani Nilai yang Hilang (Missing Values)",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `name` dan `score`, di mana sebagian nilai `score` kosong (`NaN`).\n\n" +
      "Buat fungsi `solve(df)` yang mengisi nilai `score` yang kosong dengan **rata-rata** dari nilai `score` yang ada, " +
      "lalu mengembalikan DataFrame tersebut.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"name": ["A", "B", "C", "D"], "score": [80.0, None, 90.0, None]})
    exp1 = df1.copy()
    exp1["score"] = [80.0, 85.0, 90.0, 85.0]

    df2 = pd.DataFrame({"name": ["X", "Y"], "score": [None, 50.0]})
    exp2 = df2.copy()
    exp2["score"] = [50.0, 50.0]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "select-columns",
    title: "Pilih Kolom Tertentu",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `id`, `name`, `score`, dan `city`.\n\n" +
      "Buat fungsi `solve(df)` yang mengembalikan DataFrame berisi **hanya** kolom `name` dan `score`.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "id": [1, 2, 3],
        "name": ["Ana", "Budi", "Citra"],
        "score": [80, 90, 70],
        "city": ["Bandung", "Jakarta", "Surabaya"],
    })
    exp1 = df1[["name", "score"]]

    df2 = pd.DataFrame({
        "id": [10],
        "name": ["Dedi"],
        "score": [95],
        "city": ["Bogor"],
    })
    exp2 = df2[["name", "score"]]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "rank-simple",
    title: "Beri Peringkat Berdasarkan Nilai",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `name` dan `score`.\n\n" +
      "Buat fungsi `solve(df)` yang menambahkan kolom `rank`, berisi peringkat tiap baris berdasarkan `score` " +
      "(1 = nilai tertinggi). Jika ada nilai yang sama, keduanya mendapat peringkat yang sama (gunakan `method=\"min\"`).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"name": ["Ana", "Budi", "Citra"], "score": [70, 95, 80]})
    exp1 = df1.copy()
    exp1["rank"] = [3, 1, 2]

    df2 = pd.DataFrame({"name": ["X", "Y"], "score": [50, 50]})
    exp2 = df2.copy()
    exp2["rank"] = [1, 1]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "rename-columns",
    title: "Ganti Nama Kolom",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `nm` dan `scr`.\n\n" +
      'Buat fungsi `solve(df)` yang mengganti nama kolom `nm` menjadi `name` dan `scr` menjadi `score`, ' +
      "lalu mengembalikan DataFrame tersebut.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"nm": ["Ana", "Budi"], "scr": [80, 90]})
    exp1 = pd.DataFrame({"name": ["Ana", "Budi"], "score": [80, 90]})

    df2 = pd.DataFrame({"nm": ["Citra"], "scr": [70]})
    exp2 = pd.DataFrame({"name": ["Citra"], "score": [70]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "value-counts",
    title: "Hitung Frekuensi Nilai (Value Counts)",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `status`.\n\n" +
      "Buat fungsi `solve(df)` yang menghitung jumlah kemunculan tiap nilai unik pada kolom `status`, " +
      "mengembalikan DataFrame baru dengan kolom `status` dan `count`.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"status": ["Aktif", "Aktif", "Lulus", "Aktif", "Lulus"]})
    exp1 = pd.DataFrame({"status": ["Aktif", "Lulus"], "count": [3, 2]})

    df2 = pd.DataFrame({"status": ["Drop", "Drop", "Drop"]})
    exp2 = pd.DataFrame({"status": ["Drop"], "count": [3]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "string-contains-filter",
    title: "Filter Berdasarkan Isi Teks (String Contains)",
    difficulty: "Pemula",
    description:
      "Diberikan DataFrame `df` dengan kolom `email`.\n\n" +
      'Buat fungsi `solve(df)` yang mengembalikan hanya baris dengan `email` mengandung kata `"gmail"` ' +
      "(tidak peduli huruf besar/kecil).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"email": ["ana@gmail.com", "budi@yahoo.com", "citra@GMAIL.com", "dedi@outlook.com"]})
    exp1 = pd.DataFrame({"email": ["ana@gmail.com", "citra@GMAIL.com"]})

    df2 = pd.DataFrame({"email": ["x@yahoo.com"]})
    exp2 = pd.DataFrame({"email": []}).astype(df2.dtypes.to_dict())

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "groupby-agg",
    title: "GroupBy + Agregasi",
    difficulty: "Menengah",
    description:
      "Diberikan DataFrame `df` dengan kolom `category` dan `price`.\n\n" +
      "Buat fungsi `solve(df)` yang menghitung rata-rata `price` per `category`, mengembalikan DataFrame baru " +
      "dengan kolom `category` dan `avg_price`, **diurutkan dari `avg_price` tertinggi ke terendah**.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "category": ["A", "A", "B", "B", "B", "C"],
        "price": [100, 200, 50, 150, 100, 300],
    })
    exp1 = pd.DataFrame({"category": ["C", "A", "B"], "avg_price": [300.0, 150.0, 100.0]})

    df2 = pd.DataFrame({"category": ["X", "X", "Y"], "price": [10, 30, 5]})
    exp2 = pd.DataFrame({"category": ["X", "Y"], "avg_price": [20.0, 5.0]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "merge-dataframes",
    title: "Menggabungkan Dua DataFrame (Merge)",
    difficulty: "Menengah",
    description:
      "Diberikan dua DataFrame: `df_orders` (kolom `order_id`, `customer_id`, `amount`) dan " +
      "`df_customers` (kolom `customer_id`, `customer_name`).\n\n" +
      "Buat fungsi `solve(df_orders, df_customers)` yang menggabungkan keduanya berdasarkan `customer_id`, " +
      "lalu mengembalikan DataFrame dengan kolom `order_id`, `customer_name`, `amount` (urutan kolom ini penting).",
    starterCode: "def solve(df_orders, df_customers):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    orders1 = pd.DataFrame({
        "order_id": [1, 2, 3],
        "customer_id": [101, 102, 101],
        "amount": [50000, 75000, 20000],
    })
    customers1 = pd.DataFrame({
        "customer_id": [101, 102],
        "customer_name": ["Budi", "Sinta"],
    })
    exp1 = pd.DataFrame({
        "order_id": [1, 2, 3],
        "customer_name": ["Budi", "Sinta", "Budi"],
        "amount": [50000, 75000, 20000],
    })

    orders2 = pd.DataFrame({"order_id": [10], "customer_id": [5], "amount": [1000]})
    customers2 = pd.DataFrame({"customer_id": [5], "customer_name": ["Ani"]})
    exp2 = pd.DataFrame({"order_id": [10], "customer_name": ["Ani"], "amount": [1000]})

    return [((orders1, customers1), exp1), ((orders2, customers2), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "drop-duplicates",
    title: "Menghapus Baris Duplikat",
    difficulty: "Menengah",
    description:
      "Diberikan DataFrame `df` dengan kolom `customer_id` dan `order_seq`, di mana satu `customer_id` bisa muncul lebih dari sekali.\n\n" +
      "Buat fungsi `solve(df)` yang menghapus baris duplikat berdasarkan `customer_id`, **menyisakan kemunculan pertama** (`keep=\"first\"`).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "customer_id": [1, 2, 1, 3],
        "order_seq": ["first", "only", "second", "only"],
    })
    exp1 = pd.DataFrame({
        "customer_id": [1, 2, 3],
        "order_seq": ["first", "only", "only"],
    })

    df2 = pd.DataFrame({"customer_id": [5, 5], "order_seq": ["first", "second"]})
    exp2 = pd.DataFrame({"customer_id": [5], "order_seq": ["first"]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "multiple-aggregations",
    title: "Beberapa Agregasi Sekaligus",
    difficulty: "Menengah",
    description:
      "Diberikan DataFrame `df` dengan kolom `category` dan `price`.\n\n" +
      "Buat fungsi `solve(df)` yang mengelompokkan berdasarkan `category`, lalu menghitung **total** dan **rata-rata** `price` sekaligus, " +
      "mengembalikan DataFrame dengan kolom `category`, `total_price`, `avg_price`.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "category": ["A", "A", "B", "B", "B"],
        "price": [100, 200, 50, 150, 100],
    })
    exp1 = pd.DataFrame({
        "category": ["A", "B"],
        "total_price": [300, 300],
        "avg_price": [150.0, 100.0],
    })

    df2 = pd.DataFrame({"category": ["X", "X"], "price": [10, 30]})
    exp2 = pd.DataFrame({"category": ["X"], "total_price": [40], "avg_price": [20.0]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "apply-custom-function",
    title: "Terapkan Fungsi Kustom (Apply)",
    difficulty: "Menengah",
    description:
      "Diberikan DataFrame `df` dengan kolom `name` dan `score`.\n\n" +
      'Buat fungsi `solve(df)` yang menambahkan kolom `status` berisi `"Lulus"` jika `score >= 60`, ' +
      'dan `"Tidak Lulus"` jika kurang dari itu, menggunakan `.apply()`.',
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"name": ["Ana", "Budi", "Citra"], "score": [85, 55, 70]})
    exp1 = df1.copy()
    exp1["status"] = ["Lulus", "Tidak Lulus", "Lulus"]

    df2 = pd.DataFrame({"name": ["X"], "score": [60]})
    exp2 = df2.copy()
    exp2["status"] = ["Lulus"]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "datetime-extraction",
    title: "Ekstrak Komponen Tanggal",
    difficulty: "Menengah",
    description:
      'Diberikan DataFrame `df` dengan kolom `order_date` berisi teks tanggal format `"YYYY-MM-DD"`.\n\n' +
      "Buat fungsi `solve(df)` yang menambahkan kolom `month` berisi angka bulan (1-12) dari `order_date` " +
      "(konversi dulu ke datetime dengan `pd.to_datetime`).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({"order_date": ["2024-01-15", "2024-03-22", "2024-07-01"]})
    exp1 = df1.copy()
    exp1["month"] = [1, 3, 7]

    df2 = pd.DataFrame({"order_date": ["2023-12-31"]})
    exp2 = df2.copy()
    exp2["month"] = [12]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "pivot-table",
    title: "Reshape Data dengan Pivot Table",
    difficulty: "Menengah",
    description:
      "Diberikan DataFrame `df` dengan kolom `month`, `product`, dan `sales` (format long/panjang).\n\n" +
      "Buat fungsi `solve(df)` yang mengubahnya jadi format wide/lebar: baris = `month`, kolom = tiap `product`, " +
      "isi = total `sales` (`pivot_table` dengan `aggfunc=\"sum\"`), lalu `reset_index()`.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "month": ["Jan", "Jan", "Feb", "Feb"],
        "product": ["A", "B", "A", "B"],
        "sales": [100, 200, 150, 250],
    })
    exp1 = pd.DataFrame({
        "month": ["Feb", "Jan"],
        "A": [150, 100],
        "B": [250, 200],
    })

    df2 = pd.DataFrame({"month": ["Mar"], "product": ["A"], "sales": [50]})
    exp2 = pd.DataFrame({"month": ["Mar"], "A": [50]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "concat-dataframes",
    title: "Menggabungkan DataFrame Secara Vertikal (Concat)",
    difficulty: "Menengah",
    description:
      "Diberikan dua DataFrame `df_a` dan `df_b` dengan struktur kolom yang sama (`name`, `score`).\n\n" +
      "Buat fungsi `solve(df_a, df_b)` yang menggabungkan keduanya menjadi satu DataFrame (baris `df_b` " +
      "ditambahkan setelah baris `df_a`), dengan index yang di-reset.",
    starterCode: "def solve(df_a, df_b):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1a = pd.DataFrame({"name": ["Ana", "Budi"], "score": [80, 90]})
    df1b = pd.DataFrame({"name": ["Citra"], "score": [70]})
    exp1 = pd.DataFrame({"name": ["Ana", "Budi", "Citra"], "score": [80, 90, 70]})

    df2a = pd.DataFrame({"name": ["X"], "score": [1]})
    df2b = pd.DataFrame({"name": ["Y"], "score": [2]})
    exp2 = pd.DataFrame({"name": ["X", "Y"], "score": [1, 2]})

    return [((df1a, df1b), exp1), ((df2a, df2b), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "rank-within-group",
    title: "Peringkat di Dalam Tiap Kelompok",
    difficulty: "Lanjutan",
    description:
      "Diberikan DataFrame `df` dengan kolom `category` dan `price`.\n\n" +
      "Buat fungsi `solve(df)` yang menambahkan kolom `rank_in_category`, berisi peringkat `price` " +
      "**di dalam masing-masing `category`** (1 = harga tertinggi di kategori itu, gunakan `method=\"min\"`).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "category": ["A", "A", "A", "B", "B"],
        "price": [100, 300, 200, 50, 150],
    })
    exp1 = df1.copy()
    exp1["rank_in_category"] = [3, 1, 2, 2, 1]

    df2 = pd.DataFrame({"category": ["X", "X"], "price": [10, 20]})
    exp2 = df2.copy()
    exp2["rank_in_category"] = [2, 1]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "pct-of-group-total",
    title: "Persentase Kontribusi Terhadap Kelompok",
    difficulty: "Lanjutan",
    description:
      "Diberikan DataFrame `df` dengan kolom `category` dan `amount`.\n\n" +
      "Buat fungsi `solve(df)` yang menambahkan kolom `pct_of_category`, berisi persentase kontribusi tiap baris " +
      "terhadap total `amount` di `category`-nya (gunakan `groupby(...).transform(\"sum\")`), dibulatkan 2 desimal.",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "category": ["A", "A", "B", "B"],
        "amount": [100, 300, 50, 150],
    })
    exp1 = df1.copy()
    exp1["pct_of_category"] = [25.0, 75.0, 25.0, 75.0]

    df2 = pd.DataFrame({"category": ["X", "X"], "amount": [10, 10]})
    exp2 = df2.copy()
    exp2["pct_of_category"] = [50.0, 50.0]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "melt-wide-to-long",
    title: "Reshape Wide ke Long (Melt)",
    difficulty: "Lanjutan",
    description:
      "Diberikan DataFrame `df` dengan kolom `name`, `math`, `science` (format wide, satu baris per siswa).\n\n" +
      "Buat fungsi `solve(df)` yang mengubahnya ke format long menggunakan `.melt()`: kolom `name` tetap, " +
      "kolom `math`/`science` dilebur jadi dua kolom baru `subject` (nama mata pelajaran) dan `score` (nilainya).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "name": ["Ana", "Budi"],
        "math": [80, 70],
        "science": [90, 60],
    })
    exp1 = pd.DataFrame({
        "name": ["Ana", "Budi", "Ana", "Budi"],
        "subject": ["math", "math", "science", "science"],
        "score": [80, 70, 90, 60],
    })

    df2 = pd.DataFrame({"name": ["X"], "math": [50], "science": [55]})
    exp2 = pd.DataFrame({"name": ["X", "X"], "subject": ["math", "science"], "score": [50, 55]})

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
  {
    id: "cumulative-sum-per-group",
    title: "Akumulasi Berjalan per Kelompok",
    difficulty: "Lanjutan",
    description:
      "Diberikan DataFrame `df` dengan kolom `category`, `month` (angka urutan bulan), dan `sales`.\n\n" +
      "Buat fungsi `solve(df)` yang mengurutkan data berdasarkan `category` lalu `month`, kemudian menambahkan kolom " +
      "`cumulative_sales` berisi akumulasi `sales` berjalan **di dalam masing-masing `category`** (gunakan `groupby(...).cumsum()`).",
    starterCode: "def solve(df):\n    # Tulis kode kamu di sini\n    pass\n",
    setupCode: `
def make_cases():
    df1 = pd.DataFrame({
        "category": ["A", "A", "A", "B", "B"],
        "month": [1, 2, 3, 1, 2],
        "sales": [100, 150, 50, 200, 100],
    })
    exp1 = df1.copy()
    exp1["cumulative_sales"] = [100, 250, 300, 200, 300]

    df2 = pd.DataFrame({"category": ["X", "X"], "month": [1, 2], "sales": [10, 20]})
    exp2 = df2.copy()
    exp2["cumulative_sales"] = [10, 30]

    return [((df1,), exp1), ((df2,), exp2)]

TEST_CASES = make_cases()
`,
  },
];
