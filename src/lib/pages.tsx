import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function getPage(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('pages').select('title, content').eq('slug', slug).single();
  return data;
}

export async function renderInstitutionalPage(slug: string) {
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-50 mb-6">{page.title}</h1>
      <div className="prose prose-invert max-w-none text-ink-200 leading-relaxed whitespace-pre-line">
        {page.content}
      </div>
    </div>
  );
}
