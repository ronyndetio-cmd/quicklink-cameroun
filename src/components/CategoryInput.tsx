import { useEffect, useMemo, useState } from 'react';
import { Combobox } from './Combobox';
import { useI18n } from '../i18n';
import { useStore } from '../store';

/**
 * Free-text category field with a dropdown — type a trade name or pick one
 * from the list. Resolves to a category id when the typed text matches a
 * known label; otherwise the filter is cleared so the free-text search query
 * keeps doing the fuzzy matching.
 */
export function CategoryInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { lang } = useI18n();
  const { categories } = useStore();

  const labelFor = (c: (typeof categories)[number]) => (lang === 'fr' ? c.nameFr ?? c.name : c.name);
  const options = useMemo(
    () => categories.map(labelFor).sort((a, b) => a.localeCompare(b)),
    [categories, lang],
  );

  const [text, setText] = useState(() => {
    const current = categories.find((c) => c.id === value);
    return current ? labelFor(current) : '';
  });

  // Keep the visible label in sync when the filter is cleared/changed elsewhere.
  useEffect(() => {
    const current = categories.find((c) => c.id === value);
    setText(current ? labelFor(current) : value ? text : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, lang]);

  const handleChange = (raw: string) => {
    setText(raw);
    const match = categories.find((c) => labelFor(c).toLowerCase() === raw.trim().toLowerCase());
    onChange(match ? match.id : '');
  };

  return <Combobox value={text} onChange={handleChange} options={options} placeholder={placeholder} className={className} />;
}
