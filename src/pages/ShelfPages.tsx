import { useId, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { getCard } from '../services/content';
import { familyOf } from '../data/families';
import { Button, EmptyState, LinkButton, PageHeader, TopicTag } from '../components/common/ui';
import { Icon } from '../components/common/Icon';
import { useToast } from '../store/toast';

/** Mini "stack" thumbnail in the logo's style: one layer per recent saved card, coloured by topic family. */
function StackThumb({ cardIds }: { cardIds: string[] }) {
  const colours = cardIds
    .slice(-3)
    .map((id) => getCard(id))
    .filter((c) => !!c)
    .map((c) => familyOf(c.primaryTopic).bg);
  const layers = [...Array(3 - colours.length).fill('var(--surface-2)'), ...colours];
  return (
    <svg width="52" height="52" viewBox="0 0 120 120" aria-hidden className="shrink-0">
      {layers.map((fill, i) => (
        <rect key={i} x="-34" y="-34" width="68" height="68" rx="14" fill={fill} stroke="var(--line)" strokeWidth="2" transform={`translate(60 ${88 - i * 21}) scale(1 0.58) rotate(45)`} />
      ))}
    </svg>
  );
}

export function ShelfPage() {
  const collections = useAppStore((s) => s.collections);
  const create = useAppStore((s) => s.createCollection);
  const [name, setName] = useState('');
  const inputId = useId();
  const total = new Set(collections.flatMap((c) => c.cardIds)).size;
  return (
    <div>
      <PageHeader title="Knowledge Shelf" subtitle={`${total} saved idea${total === 1 ? '' : 's'} across ${collections.length} collections.`} />
      {total === 0 && (
        <div className="mb-6">
          <EmptyState icon="bookmark" title="Nothing saved yet" action={<LinkButton to="/feed" variant="primary">Go to feed</LinkButton>}>
            Tap Save on any card. It's filed into a matching collection automatically — you can move it later.
          </EmptyState>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {collections.map((c) => (
          <li key={c.id}>
            <Link to={`/shelf/${c.id}`} className="flex h-full items-center gap-3 rounded-3xl border border-line bg-surface p-4 shadow-[var(--shadow)] hover:bg-surface-2">
              <StackThumb cardIds={c.cardIds} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-[17px] font-extrabold tracking-[-0.01em]">{c.name}</span>
                  <span className="rounded-full bg-surface-2 px-2.5 text-[13px] font-semibold tabular-nums">{c.cardIds.length}</span>
                </span>
                {c.description && <span className="mt-0.5 text-[14px] text-ink-2">{c.description}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            create(name);
            setName('');
          }
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          New collection name
        </label>
        <input id={inputId} value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection name" className="min-h-11 flex-1 rounded-3xl border border-line bg-surface px-3 text-[16px]" />
        <Button type="submit" icon="plus" disabled={!name.trim()}>
          Create
        </Button>
      </form>
    </div>
  );
}

export function CollectionPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const collection = useAppStore((s) => s.collections.find((c) => c.id === id));
  const collections = useAppStore((s) => s.collections);
  const rename = useAppStore((s) => s.renameCollection);
  const del = useAppStore((s) => s.deleteCollection);
  const move = useAppStore((s) => s.moveCard);
  const removeFrom = useAppStore((s) => s.removeFromCollection);
  const record = useAppStore((s) => s.record);
  const interactions = useAppStore((s) => s.interactions);
  const understoodIds = useMemo(() => new Set(interactions.filter((i) => i.type === 'understood').map((i) => i.cardId)), [interactions]);
  const toast = useToast((s) => s.show);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection?.name ?? '');
  const [desc, setDesc] = useState(collection?.description ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!collection) return <EmptyState title="Collection not found" action={<LinkButton to="/shelf">Back to shelf</LinkButton>} />;

  return (
    <div>
      {editing ? (
        <form
          className="mb-6 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            rename(collection.id, name, desc);
            setEditing(false);
          }}
        >
          <label className="block text-[14px] font-medium" htmlFor="col-name">Name</label>
          <input id="col-name" value={name} onChange={(e) => setName(e.target.value)} className="min-h-11 w-full rounded-2xl border border-line bg-surface px-3 text-[16px]" />
          <label className="block text-[14px] font-medium" htmlFor="col-desc">Description</label>
          <input id="col-desc" value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-11 w-full rounded-2xl border border-line bg-surface px-3 text-[16px]" />
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="primary">Save</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <PageHeader
          title={collection.name}
          subtitle={collection.description}
          back="/shelf"
          actions={
            <div className="flex gap-1">
              <Button variant="ghost" icon="edit" aria-label="Rename collection" onClick={() => setEditing(true)} />
              {!collection.isDefault && <Button variant="ghost" icon="trash" aria-label="Delete collection" onClick={() => setConfirmDelete(true)} />}
            </div>
          }
        />
      )}

      {confirmDelete && (
        <div role="alertdialog" aria-labelledby="del-title" className="mb-6 rounded-2xl border border-red-300 bg-surface p-4 dark:border-red-800">
          <p id="del-title" className="font-semibold">Delete “{collection.name}”?</p>
          <p className="mt-1 text-[14px] text-ink-2">Cards that aren't in any other collection move to Ideas Worth Revisiting. Nothing is lost.</p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                del(collection.id);
                toast('Collection deleted');
                navigate('/shelf');
              }}
            >
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep it</Button>
          </div>
        </div>
      )}

      {collection.cardIds.length === 0 ? (
        <EmptyState icon="bookmark" title="This collection is empty">Save cards from the feed or move them here from another collection.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {collection.cardIds.map((cid) => {
            const card = getCard(cid);
            if (!card) return null;
            const understood = understoodIds.has(cid);
            return (
              <li key={cid} className="rounded-3xl border border-line bg-surface p-4">
                <TopicTag topic={card.primaryTopic} small />
                <Link to={`/card/${cid}`} className="mt-1 block font-semibold hover:underline">
                  {card.title}
                </Link>
                <p className="mt-0.5 text-[14px] text-ink-2">{card.hook}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`move-${cid}`}>Move to collection</label>
                  <select
                    id={`move-${cid}`}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        move(cid, collection.id, e.target.value);
                        toast(`Moved to ${collections.find((c) => c.id === e.target.value)?.name}`);
                      }
                    }}
                    className="min-h-10 rounded-xl border border-line bg-bg px-2 text-[14px]"
                  >
                    <option value="">Move to…</option>
                    {collections.filter((c) => c.id !== collection.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Button
                    className="min-h-10! text-[14px]"
                    variant={understood ? 'ghost' : 'secondary'}
                    disabled={understood}
                    onClick={() => {
                      record(cid, 'understood');
                      toast('Marked as understood');
                    }}
                  >
                    <Icon name="check" size={16} /> {understood ? 'Understood' : 'Mark understood'}
                  </Button>
                  <Button className="min-h-10! text-[14px]" variant="ghost" onClick={() => removeFrom(cid, collection.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
