import HubShell from "@/components/HubShell";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const NotFound = () => (
  <HubShell>
    <Helmet>
      <title>Halaman tidak ditemukan - Job Ready Hub</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="section-container py-24 text-center space-y-4">
      <h1 className="text-3xl font-bold text-foreground">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground">Alamat yang kamu buka tidak tersedia.</p>
      <Button asChild>
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  </HubShell>
);

export default NotFound;
