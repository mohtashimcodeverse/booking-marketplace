import Image from "next/image";

export default function LuxuryCard({
  title,
  desc,
  image,
  tag,
}: {
  title: string;
  desc: string;
  image: string;
  tag?: string;
}) {
  return (
    <div
      data-sr
      className="rounded-[28px] border border-black/10 bg-white p-4 shadow-[0_22px_70px_rgba(17,24,39,0.10)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(17,24,39,0.14)]"
    >
      <div className="relative overflow-hidden rounded-[22px]">
        <div className="relative h-[220px]">
          <Image src={image} alt={title} fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>

        {tag ? (
          <div className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            {tag}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-lg font-semibold text-[#111827]">{title}</div>
        <div className="mt-2 text-sm text-gray-600">{desc}</div>
      </div>
    </div>
  );
}
