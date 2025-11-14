import { Metadata } from 'next';

interface SEOParams {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export function generateMetadata({ title, description, image, url }: SEOParams): Metadata {
  const siteTitle = 'Cici Rotell Photography';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'Professional photography portfolio by Cici Rotell';
  const desc = description || defaultDescription;
  const siteUrl = url || 'https://cicirotell.com';

  return {
    title: fullTitle,
    description: desc,
    openGraph: {
      title: fullTitle,
      description: desc,
      url: siteUrl,
      siteName: siteTitle,
      images: image ? [{ url: image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: image ? [image] : [],
    },
  };
}

// Helper function to strip HTML and limit length
export function createDescription(content: string | null, maxLength: number = 160): string {
  if (!content) return 'Professional photography portfolio by Cici Rotell';
  
  // Strip HTML tags
  const stripped = content.replace(/<[^>]*>/g, '');
  
  // Limit length
  if (stripped.length <= maxLength) return stripped;
  
  return stripped.substring(0, maxLength - 3) + '...';
}
