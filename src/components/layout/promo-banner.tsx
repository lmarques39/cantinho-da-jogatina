'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// Slides do banner principal. O primeiro é o "hero" da marca; os restantes são
// destaques promocionais. Cada slide pode ter uma imagem de fundo (`image`); se
// não tiver, usa o gradiente definido em `className`. `textColor` permite
// sobrepor a cor do texto desse slide (ex: para combinar com a imagem).
interface Slide {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className: string;
  image?: string;
  textColor?: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Usados com garantia · Do retro ao atual',
    title: (
      <>
        A tua próxima <span className="text-cartridge-400">aventura</span> está no Cantinho.
      </>
    ),
    subtitle:
      'Jogos, consolas e acessórios usados — testados, classificados por estado e prontos para jogar. Porque cada jogo merece um novo jogador.',
    primaryCta: { label: 'Ver coleção', href: '/loja' },
    secondaryCta: { label: 'Entra em contacto aqui', href: '/contactos' },
    className: 'bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900',
    image: '/images/banner/carrossel_1.png',
    textColor: '#D4A373',
  },
  {
    eyebrow: 'Destaque da semana',
    title: 'Clássicos retro com garantia',
    subtitle: 'SNES, Nintendo 64, Game Boy e muito mais — testados e prontos a jogar.',
    primaryCta: { label: 'Ver retro', href: '/loja?marca=retro' },
    className: 'bg-gradient-to-br from-[#16323a] via-ink-800 to-ink-900',
    image: '/images/banner/carrossel_2.png',
    textColor: '#D4A373',
  },
  {
    eyebrow: 'Acabaram de chegar',
    title: 'Playstation 5 & jogos atuais',
    subtitle: 'A geração atual a preços de usado, com a confiança do Cantinho da Jogatina.',
    primaryCta: { label: 'Ver Playstation', href: '/loja?marca=playstation' },
    className: 'bg-gradient-to-br from-[#1a2f3a] via-ink-800 to-ink-900',
    image: '/images/banner/carrossel_3.png',
    textColor: '#D4A373',
  },
  {
    eyebrow: 'Vende-nos o teu jogo',
    title: 'O teu jogo na estante vale dinheiro',
    subtitle: 'Trazemos uma segunda vida a cada cartucho. Compramos a tua coleção.',
    primaryCta: { label: 'Saber mais', href: '/contactos' },
    className: 'bg-gradient-to-br from-[#3a2f12] via-ink-800 to-ink-900',
    image: '/images/banner/carrossel_4.png',
    textColor: '#D4A373',
  },
];

const AUTOPLAY_MS = 6000;

export function PromoBanner() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  // Auto-play: avança sozinho; o temporizador reinicia sempre que o índice muda
  // (inclui navegação manual via setas/indicadores).
  useEffect(() => {
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, next]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="group dark relative overflow-hidden rounded-cart border border-ink-700 shadow-cart">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`relative w-full shrink-0 ${slide.className} bg-scanlines`}
            >
              {slide.image && (
                <>
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1280px) 1280px, 100vw"
                    className="object-cover"
                  />
                  {/* Camada escura para o texto continuar legível sobre a imagem */}
                  <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/70 to-ink-900/30" />
                </>
              )}
              <div className="relative flex min-h-[340px] sm:min-h-[400px] flex-col justify-center px-6 py-12 sm:px-14 lg:px-16 max-w-2xl">
                <span
                  className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-cartridge-400"
                  style={slide.textColor ? { color: slide.textColor } : undefined}
                >
                  {slide.eyebrow}
                </span>
                <h2
                  className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] text-ink-50"
                  style={slide.textColor ? { color: slide.textColor } : undefined}
                >
                  {slide.title}
                </h2>
                <p
                  className="mt-4 text-sm sm:text-base text-ink-200 max-w-md"
                  style={slide.textColor ? { color: slide.textColor } : undefined}
                >
                  {slide.subtitle}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={slide.primaryCta.href}
                    className="inline-flex items-center gap-2 rounded-cart bg-cartridge-400 px-6 py-3 font-display text-sm font-bold text-ink-900 shadow-cart hover:shadow-cart-hover hover:bg-cartridge-300 transition-all"
                  >
                    {slide.primaryCta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                  {slide.secondaryCta && (
                    <Link
                      href={slide.secondaryCta.href}
                      className="inline-flex items-center gap-2 rounded-cart border border-ink-500 px-6 py-3 font-display text-sm font-bold text-ink-50 hover:border-cartridge-400 hover:text-cartridge-400 transition-colors"
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Setas */}
        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink-900/60 p-2 text-ink-100 hover:bg-ink-900 hover:text-cartridge-400 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 hidden sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Slide seguinte"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink-900/60 p-2 text-ink-100 hover:bg-ink-900 hover:text-cartridge-400 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 hidden sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para o slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-cartridge-400' : 'w-2 bg-ink-400 hover:bg-ink-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
