'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { deleteCategory, moveCategory } from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';

type Props = {
  id: string;
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

/** Reorder + delete controls for a single row in the admin categories list. */
export function CategoryRowActions({ id, name, canMoveUp, canMoveDown }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = (direction: 'up' | 'down') => {
    setError(null);
    startTransition(async () => {
      const res = await moveCategory(id, direction);
      if ('error' in res) setError(res.error);
      else router.refresh();
    });
  };

  const remove = () => {
    startTransition(async () => {
      const res = await deleteCategory(id);
      setConfirmOpen(false);
      if ('error' in res) setError(res.error);
      else router.refresh();
    });
  };

  const iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => move('up')}
          disabled={!canMoveUp || isPending}
          aria-label={`Move ${name} up`}
          title="Move up"
          className={iconBtn}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => move('down')}
          disabled={!canMoveDown || isPending}
          aria-label={`Move ${name} down`}
          title="Move down"
          className={iconBtn}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
          disabled={isPending}
          aria-label={`Delete ${name}`}
          title="Delete"
          className={`${iconBtn} hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Category?"
        badge={name}
        message="This permanently removes the category. Categories containing products or subcategories cannot be deleted."
        confirmLabel="Delete"
        cancelLabel="Keep"
        destructive
        loading={isPending}
        error={error}
        onConfirm={remove}
        onCancel={() => {
          setError(null);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
