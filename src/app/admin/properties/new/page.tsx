import { PropertyForm } from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

export default function NewPropertyPage() {
  return (
    <div>
      <p className="eyebrow">Portfolio</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">New property.</h1>
      <div className="mt-10">
        <PropertyForm />
      </div>
    </div>
  );
}
