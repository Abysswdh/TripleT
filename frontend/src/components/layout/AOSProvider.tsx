"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * AOSProvider — Drop this once in AppShell (client side).
 * It initialises AOS globally so every [data-aos] element animates on scroll.
 */
export function AOSProvider() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      delay: 0,
    });
  }, []);

  return null;
}
