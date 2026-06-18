// Mapeamento de taxonomia da loja: traduz a estrutura "crua" de categorias e
// atributos do WordPress (23 categorias planas + 20 modelos de plataforma)
// em dois eixos de filtro simples e independentes, no estilo Worten/Fnac/CeX:
//
//   1. Tipo de Produto  -> Jogos | Jogos Soltos | Consolas | Acessórios
//   2. Marca/Plataforma -> Playstation | Xbox | Nintendo | PC | Retro
//
// "Retro" é decidido pela CATEGORIA do produto (Retro Gaming / Retro Soltos /
// Retro Consolas), não pelo modelo específico — assim um Nintendo 64 cai em
// "Retro", não em "Nintendo", refletindo como a loja pensa no catálogo.

export type ProductTypeSlug = 'jogos' | 'jogos-soltos' | 'consolas' | 'acessorios';
export type BrandSlug = 'playstation' | 'xbox' | 'nintendo' | 'pc' | 'retro';

export const PRODUCT_TYPES: { slug: ProductTypeSlug; label: string; categorySlugs: string[] }[] = [
  {
    slug: 'jogos',
    label: 'Jogos',
    categorySlugs: ['videojogos', 'playstation-jogos', 'xbox-jogos', 'nintendo-jogos', 'retro-jogos', 'pc-gaming'],
  },
  {
    slug: 'jogos-soltos',
    label: 'Jogos Soltos',
    categorySlugs: ['jogos-soltos', 'playstation-soltos', 'xbox-soltos', 'nintendo-soltos', 'retro-soltos'],
  },
  {
    slug: 'consolas',
    label: 'Consolas',
    categorySlugs: ['consolas', 'playstation', 'xbox', 'nintendo', 'retro'],
  },
  {
    slug: 'acessorios',
    label: 'Acessórios',
    categorySlugs: [
      'acessorios',
      'comandos-controladores',
      'cabos-adaptadores',
      'bolsas-protecao',
      'armazenamento-memoria',
      'box-jogatina',
    ],
  },
];

// Categorias que, independentemente da plataforma específica do produto,
// colocam-no na marca "Retro" em vez da sua marca real.
const RETRO_CATEGORY_SLUGS = ['retro-jogos', 'retro-soltos', 'retro'];

// Slugs de pa_plataforma (modelo específico) -> marca
const PLATFORM_TO_BRAND: Record<string, BrandSlug> = {
  ps1: 'playstation',
  ps2: 'playstation',
  ps3: 'playstation',
  ps4: 'playstation',
  ps5: 'playstation',
  psp: 'playstation',
  psvita: 'playstation',
  'xbox-360': 'xbox',
  'xbox-one': 'xbox',
  'xbox-smart-delivery': 'xbox',
  'nintendo-3ds': 'nintendo',
  'nintendo-64': 'nintendo',
  gameboy: 'nintendo',
  'gameboy-advance': 'nintendo',
  'gameboy-color': 'nintendo',
  gamecube: 'nintendo',
  snes: 'nintendo',
  'nintendo-switch': 'nintendo',
  wii: 'nintendo',
  'wii-u': 'nintendo',
  pc: 'pc',
};

export const BRANDS: { slug: BrandSlug; label: string }[] = [
  { slug: 'playstation', label: 'Playstation' },
  { slug: 'xbox', label: 'Xbox' },
  { slug: 'nintendo', label: 'Nintendo' },
  { slug: 'pc', label: 'PC' },
  { slug: 'retro', label: 'Retro' },
];

/** Dado um conjunto de slugs de categoria de um produto, devolve o Tipo de Produto. */
export function getProductType(categorySlugs: string[]): ProductTypeSlug | null {
  for (const type of PRODUCT_TYPES) {
    if (categorySlugs.some((slug) => type.categorySlugs.includes(slug))) {
      return type.slug;
    }
  }
  return null;
}

/**
 * Dado um conjunto de slugs de categoria e de plataforma (pa_plataforma) de
 * um produto, devolve a sua Marca. Categorias Retro têm prioridade sobre o
 * modelo específico de plataforma.
 */
export function getProductBrand(categorySlugs: string[], platformSlugs: string[]): BrandSlug | null {
  if (categorySlugs.some((slug) => RETRO_CATEGORY_SLUGS.includes(slug))) {
    return 'retro';
  }
  for (const platformSlug of platformSlugs) {
    const brand = PLATFORM_TO_BRAND[platformSlug];
    if (brand) return brand;
  }
  return null;
}
