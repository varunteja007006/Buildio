import React from "react";

export function MainCard({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 py-2">
      <div>
        <p className="font-semibold">{description}</p>
      </div>
      {children}
    </section>
  );
}
