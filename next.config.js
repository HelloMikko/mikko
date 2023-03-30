/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: ['ik.imagekit.io', 'https://ik.imagekit.io/codemikko/'],
  },
};

module.exports = nextConfig;
