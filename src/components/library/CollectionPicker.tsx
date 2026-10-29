import { useId, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/ui';
import { useToast } from '../../store/toast';

/** Checkbox list of collections for one card, plus "new collection". */
export function CollectionPicker({ cardId }: { cardId: string }) {
  const collections = useAppStore((s) => s.collections);
  const add = useAppStore((s) => s.addToCollection);
  const remove = useAppStore((s) => s.removeFromCollection);
  const create = useAppStore((s) => s.createCollection);
  const toast = useToast((s) => s.show);
  const [name, setName] = useState('');
  const inputId = useId();

  return (
    <div>
      <fieldset>
        <legend className="text-[15px] font-semibold">Save to collections</legend>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {collections.map((c) => {
            const checked = c.cardIds.includes(cardId);
            return (
              <li key={c.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-surface-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) remove(cardId, c.id);
                      else add(cardId, c.id);
                    }}
                    className="h-5 w-5 accent-[var(--brand)]"
                  />
                  <span className="text-[15px]">{c.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const id = create(name);
          add(cardId, id);
          toast(`Saved to ${name.trim()}`);
          setName('');
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          New collection name
        </label>
        <input id={inputId} value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection…" className="min-h-11 flex-1 rounded-2xl border border-line bg-bg px-3 text-[16px]" />
        <Button type="submit" icon="plus">
          Create
        </Button>
      </form>
    </div>
  );
}
