import { PropertyForm, type PropertyFormData } from "@/components/admin/PropertyForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ fromSubmission?: string }>;
}) {
  const { fromSubmission } = await searchParams;

  let initial: Partial<PropertyFormData> | undefined;
  let submissionFound = false;
  if (fromSubmission) {
    const submission = await prisma.listingSubmission.findUnique({ where: { id: fromSubmission } });
    if (submission) {
      submissionFound = true;
      initial = {
        title: `${submission.propertyType} — submitted by ${submission.name}`,
        type: submission.propertyType,
        listingType: submission.listingType,
        city: submission.city,
        country: "Morocco",
        images: parseArr(submission.images),
      };
    }
  }

  return (
    <div>
      <p className="eyebrow">Portfolio</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">New property.</h1>
      <div className="mt-10">
        <PropertyForm initial={initial} fromSubmissionId={submissionFound ? fromSubmission : undefined} />
      </div>
    </div>
  );
}
