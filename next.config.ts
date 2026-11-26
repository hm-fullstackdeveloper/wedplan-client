import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
   images: {
    qualities: [75, 90],
  },

};

export default nextConfig;

 

