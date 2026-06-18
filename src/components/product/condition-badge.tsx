import { cn } from '@/lib/utils';

interface ConditionBadgeProps {
  /** ex: 'Usado', 'Novo' */
  condition?: string | null;
  /** ex: 'Grade A', 'Grade B' — estado físico para consolas em segunda mão */
  grade?: string | null;
  className?: string;
}

const CONDITION_COLORS: Record<string, string> = {
  novo: 'text-leaf-400 border-leaf-400',
  usado: 'text-cartridge-400 border-cartridge-400',
};

export function ConditionBadge({ condition, grade, className }: ConditionBadgeProps) {
  if (!condition && !grade) return null;
  const key = condition?.toLowerCase() ?? '';
  const colorClass = CONDITION_COLORS[key] ?? 'text-ink-200 border-ink-300';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {condition && <span className={cn('condition-badge', colorClass)}>{condition}</span>}
      {grade && <span className="condition-badge text-ink-200 border-ink-400">{grade}</span>}
    </div>
  );
}
