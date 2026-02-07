import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState(props: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
        {props.icon ?? <Inbox className="h-6 w-6 text-slate-700" />}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {props.title}
      </h3>

      {props.description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          {props.description}
        </p>
      ) : null}

      {props.action ? (
        <div className="mt-6 flex justify-center">
          {props.action}
        </div>
      ) : null}
    </div>
  );
}
