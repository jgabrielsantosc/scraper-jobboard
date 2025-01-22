/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-slot", "@radix-ui/react-toast"],
  experimental: {
    esmExternals: true
  }
}

export default config;
