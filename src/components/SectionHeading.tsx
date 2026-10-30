interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-leaf-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base text-ink-600">{description}</p>
    </div>
  );
}
