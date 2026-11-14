import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8 px-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-accent" />
          </div>
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-4">
            Segera Hadir
          </span>
          <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{description}</p>
          <Button asChild variant="outline">
            <Link to="/">Kembali ke Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
