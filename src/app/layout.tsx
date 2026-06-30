import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Simulateur Crypto | S'investir",
  description:
    'Calculez vos gains et performances pour un investissement crypto en DCA ou en one-shot avec des données historiques réelles.',
  keywords: [
    'simulateur crypto',
    'dca',
    'investissement',
    'bitcoin',
    'ethereum',
    "s'investir",
    'rentabilité crypto',
    'dollar cost averaging',
  ],
  authors: [{ name: "S'investir" }],
  creator: "S'investir",
  publisher: "S'investir",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://simulateurs.sinvestir.fr/crypto',
    languages: {
      'fr-FR': 'https://simulateurs.sinvestir.fr/crypto',
    },
  },
  openGraph: {
    title: "Simulateur Crypto DCA | S'investir",
    description:
      'Découvrez combien vous auriez gagné en investissant dans la crypto (DCA / One-Shot). Données historiques réelles.',
    url: 'https://simulateurs.sinvestir.fr/crypto',
    siteName: "S'investir",
    images: [
      {
        url: 'https://sinvestir.fr/wp-content/uploads/2023/10/sinvestir-logo.png',
        width: 800,
        height: 600,
        alt: "Logo S'investir",
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Simulateur Crypto | S'investir",
    description:
      'Calculez la rentabilité historique de vos investissements crypto en DCA ou One-Shot.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: "Simulateur Crypto DCA S'investir",
    operatingSystem: 'Web',
    applicationCategory: 'FinanceApplication',
    provider: {
      '@type': 'Organization',
      name: "S'investir",
      url: 'https://sinvestir.fr/',
    },
    description:
      "Simulateur d'investissement crypto automatisé (DCA) et One-shot. Basé sur des données historiques réelles (Binance, CoinGecko), ce calculateur permet d'analyser la rentabilité, le volume acquis et le prix moyen d'achat pour le Bitcoin, Ethereum et plus de 30 autres cryptomonnaies.",
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Calcul de rentabilité crypto (ROI)',
      'Simulation Dollar Cost Averaging (DCA) hebdomadaire, mensuelle, quotidienne',
      'Données historiques réelles depuis 2014',
      'Graphiques interactifs des gains et pertes latentes',
    ],
  };

  return (
    <html lang="fr-FR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.variable}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('sinvestir-theme');
                  var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = saved || preferred;
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
