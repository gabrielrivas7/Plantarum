// components/WalletAvatar.tsx
"use client";

import { useEffect, useRef } from "react";
import jazzicon from "@metamask/jazzicon";

interface Props {
  address: string;
  diameter?: number;
}

export default function WalletAvatar({ address, diameter = 32 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address && ref.current) {
      const seed = parseInt(address.slice(2, 10), 16);
      const icon = jazzicon(diameter, seed);
      ref.current.innerHTML = ""; // limpiar
      ref.current.appendChild(icon);
    }
  }, [address, diameter]);

  return <div ref={ref} style={{ borderRadius: "50%", overflow: "hidden" }} />;
}
