"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "!bg-surface-800 !text-white !border !border-surface-700",
        duration: 4000,
      }}
    />
  );
}
