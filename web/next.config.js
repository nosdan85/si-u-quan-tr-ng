/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_DISCORD_SERVER_LINK: process.env.DISCORD_SERVER_LINK,
  },
}

module.exports = nextConfig