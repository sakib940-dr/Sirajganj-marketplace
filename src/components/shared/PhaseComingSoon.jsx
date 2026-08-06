import { Hammer } from "lucide-react";

export default function PhaseComingSoon({ title, phaseNote }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
        <Hammer className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {phaseNote || "এই ফিচারটি পরবর্তী ডেভেলপমেন্ট ফেজে যুক্ত করা হবে।"}
      </p>
    </div>
  );
}
