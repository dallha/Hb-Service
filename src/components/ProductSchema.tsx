import React from 'react';

type ProductForSchema = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  slug: string;
};

export function ProductSchema({ product }: { product: ProductForSchema }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'HB_Service',
    },
    offers: {
      '@type': 'Offer',
      price: product.price || 0,
      priceCurrency: 'XOF', // Assuming West African CFA franc based on initial snippet, can be updated
      availability: 'https://schema.org/InStock',
      url: `https://hbservice.store/products/${product.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
