"use client";

import { BarChart3, PieChart, Wallet } from "lucide-react";

export function GoofyLoader() {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-6 p-8 min-h-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <style>{`
        @keyframes goofy-receipt-float {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes goofy-wobble {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(-6deg) translateX(-2px); }
          50% { transform: rotate(6deg) translateX(2px); }
          75% { transform: rotate(-4deg) translateX(-1px); }
        }

        @keyframes goofy-chomp {
          0%, 15%, 100% { transform: scaleY(1); }
          30% { transform: scaleY(0.65); }
          45% { transform: scaleY(1); }
          60% { transform: scaleY(0.7); }
          75% { transform: scaleY(1); }
        }

        @keyframes goofy-coin {
          0% { opacity: 0; transform: translate(0, 0) scale(0.8); }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1); }
        }

        @keyframes goofy-dot {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        .goofy-receipt { animation: goofy-receipt-float 1.4s ease-in-out infinite; }
        .goofy-wobble { transform-origin: center; animation: goofy-wobble 1.1s ease-in-out infinite; }
        .goofy-chomp { transform-origin: center; animation: goofy-chomp 1.2s ease-in-out infinite; }
        .goofy-coin-1 { --tx: -46px; --ty: -60px; animation: goofy-coin 1.2s ease-out infinite; }
        .goofy-coin-2 { --tx: 0px; --ty: -74px; animation: goofy-coin 1.2s ease-out infinite; animation-delay: 0.15s; }
        .goofy-coin-3 { --tx: 52px; --ty: -58px; animation: goofy-coin 1.2s ease-out infinite; animation-delay: 0.3s; }
        .goofy-dot-1 { animation: goofy-dot 0.9s ease-in-out infinite; }
        .goofy-dot-2 { animation: goofy-dot 0.9s ease-in-out infinite; animation-delay: 0.12s; }
        .goofy-dot-3 { animation: goofy-dot 0.9s ease-in-out infinite; animation-delay: 0.24s; }
      `}</style>

      <div className="relative flex items-center justify-center">
        <div className="goofy-receipt relative w-44 rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Expense
            </span>
            <span className="text-xs text-muted-foreground">🧾</span>
          </div>

          <div className="space-y-2">
            <div className="h-2 w-2/3 rounded bg-muted" />
            <div className="h-2 w-5/6 rounded bg-muted" />
            <div className="h-2 w-1/2 rounded bg-muted" />
          </div>

          <div className="my-3 border-t border-dashed" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">TOTAL</span>
            <span className="text-xs font-bold text-foreground">???</span>
          </div>

          <div className="pointer-events-none absolute -right-6 -top-6 goofy-wobble">
            <BarChart3 className="h-10 w-10 text-primary/90" strokeWidth={2} />
          </div>
          <div
            className="pointer-events-none absolute -left-6 -bottom-6 goofy-wobble"
            style={{ animationDelay: "0.15s" }}
          >
            <PieChart className="h-10 w-10 text-primary/90" strokeWidth={2} />
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="relative flex items-center justify-center">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <span className="goofy-coin-1 absolute inline-block h-3 w-3 rounded-full border bg-primary/20" />
              <span className="goofy-coin-2 absolute inline-block h-3 w-3 rounded-full border bg-primary/20" />
              <span className="goofy-coin-3 absolute inline-block h-3 w-3 rounded-full border bg-primary/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-base font-semibold text-foreground">
          Reconciling your financial chaos ...
        </div>
      </div>
    </div>
  );
}
