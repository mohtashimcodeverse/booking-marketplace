export default function SectionHeading(props: {
  kicker: string;
  title: string;
  desc?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  const { kicker, title, desc, align = "left", dark } = props;
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className={dark ? "text-white/70" : "text-gray-500"} style={{ letterSpacing: "0.12em" }}>
        <span className="text-xs uppercase">{kicker}</span>
      </div>
      <h2 className={`mt-3 font-heading ${dark ? "text-white" : "text-ink"} text-3xl md:text-5xl`}>
        {title}
      </h2>
      {desc ? (
        <p className={`mt-3 max-w-2xl ${align === "center" ? "mx-auto" : ""} ${dark ? "text-white/70" : "text-gray-600"}`}>
          {desc}
        </p>
      ) : null}
    </div>
  );
}
