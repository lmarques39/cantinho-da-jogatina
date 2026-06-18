import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function getPage(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('pages').select('title, content').eq('slug', slug).single();
  return data;
}

/**
 * Detecta se o conteúdo é HTML (tem tags) ou texto simples.
 * Conteúdo vindo do WordPress é sempre HTML; conteúdo novo pode ser plain text.
 */
function isHtml(content: string) {
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Converte texto simples com listas numeradas/bullets para HTML básico.
 * Ex: "1. Primeiro item\n2. Segundo item" → <ol><li>...</li></ol>
 */
function plainTextToHtml(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inOl = false;
  let inUl = false;

  function closeLists() {
    if (inOl) { result.push('</ol>'); inOl = false; }
    if (inUl) { result.push('</ul>'); inUl = false; }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    const olMatch = line.match(/^(\d+)\.\s+(.+)/);
    const ulMatch = line.match(/^[-•*]\s+(.+)/);

    if (olMatch) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push(`<li>${olMatch[2]}</li>`);
    } else if (ulMatch) {
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
    } else {
      closeLists();
      if (line === '') {
        result.push('<br/>');
      } else {
        result.push(`<p>${line}</p>`);
      }
    }
  }
  closeLists();
  return result.join('\n');
}

export async function renderInstitutionalPage(slug: string) {
  const page = await getPage(slug);
  if (!page) notFound();

  const html = isHtml(page.content)
    ? page.content
    : plainTextToHtml(page.content);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-50 mb-8">{page.title}</h1>
      <div
        className="
          prose prose-invert max-w-none
          prose-headings:font-display prose-headings:text-ink-50
          prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-ink-300 prose-p:leading-relaxed prose-p:my-3
          prose-li:text-ink-300 prose-li:leading-relaxed prose-li:my-1
          prose-ol:my-4 prose-ol:pl-6 prose-ol:list-decimal
          prose-ul:my-4 prose-ul:pl-6 prose-ul:list-disc
          prose-strong:text-ink-100
          prose-a:text-cartridge-400 prose-a:underline hover:prose-a:text-cartridge-300
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
