"use client";

import { useEffect, useRef, useState } from "react";

export function LazyMap({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {show ? (
        <iframe
          title={title}
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={src}
          className="h-full w-full"
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-sand-200 dark:bg-sand-800" />
      )}
    </div>
  );
}
