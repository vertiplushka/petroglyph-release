"use client";

import { useState } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  image?: string;
  children: React.ReactNode;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1655047682631-5c4d3330d9b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200";

export function AuthShell({
  title,
  subtitle,
  image = DEFAULT_IMAGE,
  children,
}: AuthShellProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="min-h-[calc(100vh-92px)] flex items-center justify-center bg-[#fffcf3] px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-[1210px] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(35,53,22,0.08)] border border-[#0e0f11]/5 bg-white">

        {/* Image panel — hidden on mobile, visible on md+ */}
        <div className="hidden md:block relative min-h-[680px]">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt="Горный Алтай"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            /* Fallback gradient when image fails */
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, #182610 0%, #233516 55%, #2d421b 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <svg
                className="absolute bottom-0 left-0 right-0 w-full opacity-[0.12]"
                viewBox="0 0 800 280"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,280 L0,190 L70,125 L130,168 L210,68 L295,122 L375,22 L455,92 L535,52 L598,104 L678,32 L755,112 L800,82 L800,280 Z"
                  fill="white"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Form panel */}
        <div className="bg-[#fffcf3] flex flex-col items-center justify-center px-6 md:px-12 py-10">
          <div className="w-full max-w-[420px] flex flex-col gap-6">
            <div className="flex flex-col gap-3 text-center">
              <h1 className="font-display font-semibold text-3xl md:text-4xl text-[#0e0f11] leading-tight">
                {title}
              </h1>
              <p className="font-sans text-sm text-[#0e0f11]/70">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
