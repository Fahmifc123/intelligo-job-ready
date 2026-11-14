/** Soal latihan SQL. Data fiktif untuk latihan; dijalankan di browser dengan SQLite (sql.js). */

export const SQL_SCHEMA = `
CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT, city TEXT, signup_date TEXT);
CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT, category TEXT, price INTEGER);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER);

INSERT INTO customers VALUES
 (1,'Andi','Jakarta','2025-11-02'),(2,'Bunga','Bandung','2025-12-15'),(3,'Citra','Surabaya','2026-01-08'),
 (4,'Dimas','Jakarta','2026-01-20'),(5,'Eka','Bandung','2026-02-03'),(6,'Fajar','Yogyakarta','2026-02-14'),
 (7,'Gita','Jakarta','2026-03-01'),(8,'Hadi','Surabaya','2026-03-09');

INSERT INTO products VALUES
 (1,'Laptop 14 inci','Elektronik',8500000),(2,'Mouse Wireless','Elektronik',150000),(3,'Monitor 24 inci','Elektronik',2100000),
 (4,'Meja Kerja','Furnitur',1200000),(5,'Kursi Ergonomis','Furnitur',2500000),(6,'Buku SQL Dasar','Buku',95000),
 (7,'Buku Statistika','Buku',120000),(8,'Headset','Elektronik',450000),(9,'Rak Buku','Furnitur',650000);

INSERT INTO orders VALUES
 (101,1,'2026-01-05','selesai'),(102,2,'2026-01-12','selesai'),(103,1,'2026-02-02','selesai'),(104,3,'2026-02-10','dibatalkan'),
 (105,4,'2026-02-18','selesai'),(106,5,'2026-03-03','selesai'),(107,2,'2026-03-07','selesai'),(108,6,'2026-03-15','selesai'),
 (109,1,'2026-03-21','selesai'),(110,7,'2026-03-28','dikirim');

INSERT INTO order_items VALUES
 (101,1,1),(101,2,2),(102,6,3),(102,7,1),(103,3,2),(104,5,1),(105,4,1),(105,5,1),(106,8,2),(106,2,1),
 (107,1,1),(108,7,2),(109,8,1),(109,6,1),(110,3,1),(110,2,1);
`;

export const SQL_TABLES_INFO = [
  { name: "customers", columns: "customer_id, name, city, signup_date" },
  { name: "products", columns: "product_id, product_name, category, price" },
  { name: "orders", columns: "order_id, customer_id, order_date, status ('selesai', 'dikirim', 'dibatalkan')" },
  { name: "order_items", columns: "order_id, product_id, quantity" },
];

export interface SqlProblem {
  id: string;
  title: string;
  difficulty: "Pemula" | "Menengah" | "Lanjutan";
  description: string;
  /** Query acuan. Hasil query alumni dibandingkan dengan hasil query ini. */
  solution: string;
  /** true bila urutan baris ikut dinilai (soal yang meminta ORDER BY). */
  ordered: boolean;
}

export const sqlProblems: SqlProblem[] = [
  {
    id: "sql-filter-city",
    title: "Filter Pelanggan per Kota",
    difficulty: "Pemula",
    description: "Tampilkan `name` dan `signup_date` semua pelanggan yang tinggal di kota **Bandung**.",
    solution: "SELECT name, signup_date FROM customers WHERE city = 'Bandung';",
    ordered: false,
  },
  {
    id: "sql-top-products",
    title: "3 Produk Termahal",
    difficulty: "Pemula",
    description: "Tampilkan `product_name` dan `price` untuk **3 produk dengan harga tertinggi**, urut dari yang termahal.",
    solution: "SELECT product_name, price FROM products ORDER BY price DESC LIMIT 3;",
    ordered: true,
  },
  {
    id: "sql-count-city",
    title: "Jumlah Pelanggan per Kota",
    difficulty: "Pemula",
    description: "Hitung jumlah pelanggan di setiap kota. Tampilkan kolom `city` dan `total_customers`.",
    solution: "SELECT city, COUNT(*) AS total_customers FROM customers GROUP BY city;",
    ordered: false,
  },
  {
    id: "sql-revenue-category",
    title: "Pendapatan per Kategori",
    difficulty: "Menengah",
    description:
      "Hitung total pendapatan (`price * quantity`) per kategori produk, **hanya dari pesanan berstatus 'selesai'**. Tampilkan `category` dan `revenue`, urut dari pendapatan terbesar.",
    solution: `SELECT p.category, SUM(p.price * oi.quantity) AS revenue
FROM order_items oi JOIN products p ON p.product_id = oi.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status = 'selesai'
GROUP BY p.category ORDER BY revenue DESC;`,
    ordered: true,
  },
  {
    id: "sql-repeat-customers",
    title: "Pelanggan yang Belanja Lebih dari Sekali",
    difficulty: "Menengah",
    description:
      "Tampilkan `name` pelanggan dan `total_orders` (jumlah pesanan, semua status) untuk pelanggan yang punya **minimal 2 pesanan**.",
    solution: `SELECT c.name, COUNT(o.order_id) AS total_orders
FROM customers c JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 2;`,
    ordered: false,
  },
  {
    id: "sql-never-ordered",
    title: "Produk yang Belum Pernah Dipesan",
    difficulty: "Menengah",
    description: "Tampilkan `product_name` untuk produk yang **belum pernah muncul** di tabel `order_items`.",
    solution: `SELECT p.product_name FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.product_id IS NULL;`,
    ordered: false,
  },
  {
    id: "sql-monthly-orders",
    title: "Jumlah Pesanan per Bulan",
    difficulty: "Menengah",
    description:
      "Hitung jumlah pesanan per bulan (semua status). Tampilkan `month` dengan format `YYYY-MM` dan `total_orders`, urut dari bulan paling awal. Petunjuk: `strftime('%Y-%m', order_date)`.",
    solution: "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS total_orders FROM orders GROUP BY month ORDER BY month;",
    ordered: true,
  },
  {
    id: "sql-above-average",
    title: "Produk di Atas Harga Rata-rata",
    difficulty: "Menengah",
    description: "Tampilkan `product_name` dan `price` untuk produk yang harganya **di atas rata-rata harga semua produk**.",
    solution: "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
    ordered: false,
  },
  {
    id: "sql-aov-city",
    title: "Rata-rata Nilai Pesanan per Kota",
    difficulty: "Lanjutan",
    description:
      "Untuk pesanan berstatus **'selesai'**, hitung nilai setiap pesanan (jumlah `price * quantity`), lalu hitung **rata-rata nilai pesanan** per kota pelanggan. Tampilkan `city` dan `avg_order_value` (dibulatkan tanpa desimal). Petunjuk: pakai CTE (`WITH`).",
    solution: `WITH order_value AS (
  SELECT o.order_id, o.customer_id, SUM(p.price * oi.quantity) AS value
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p ON p.product_id = oi.product_id
  WHERE o.status = 'selesai' GROUP BY o.order_id, o.customer_id
)
SELECT c.city, ROUND(AVG(ov.value)) AS avg_order_value
FROM order_value ov JOIN customers c ON c.customer_id = ov.customer_id
GROUP BY c.city;`,
    ordered: false,
  },
  {
    id: "sql-top-per-category",
    title: "Produk Terlaris per Kategori",
    difficulty: "Lanjutan",
    description:
      "Untuk setiap kategori, tampilkan **satu produk dengan total kuantitas terjual terbanyak** (semua status pesanan). Tampilkan `category`, `product_name`, dan `total_quantity`. Petunjuk: window function `ROW_NUMBER() OVER (PARTITION BY ...)`. Bila seri, pilih `product_id` terkecil.",
    solution: `WITH sold AS (
  SELECT p.category, p.product_id, p.product_name, SUM(oi.quantity) AS total_quantity
  FROM order_items oi JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.category, p.product_id, p.product_name
), ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY total_quantity DESC, product_id) AS rn FROM sold
)
SELECT category, product_name, total_quantity FROM ranked WHERE rn = 1;`,
    ordered: false,
  },
];
