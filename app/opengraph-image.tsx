import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Interactive 3D Product Viewer";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#3730a3",
            display: "flex",
          }}
        >
          3D Product Showcase
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#4f46e5",
            marginTop: 32,
            display: "flex",
          }}
        >
          Drag · Rotate · Zoom · Buy — Next.js + Three.js + DRACO
        </div>
      </div>
    ),
    size,
  );
}