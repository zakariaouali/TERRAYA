import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
}) {
  return (
    <section className="relative h-[70svh] min-h-[480px] w-full overflow-hidden">
      <FadeImage src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/55" />
      <Container className="relative z-10 h-full flex flex-col justify-end pb-20">
        <p className="text-sand-100/90 tracking-[0.4em] uppercase text-xs">{eyebrow}</p>
        <h1 className="mt-5 font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[1] max-w-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 text-sand-100/90 max-w-2xl text-lg leading-relaxed">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
