import { useMemo } from 'react';
import { Combobox } from './Combobox';
import { CITIES } from '../data/cities';

const CITY_NAMES = CITIES.map((c) => c.name).sort((a, b) => a.localeCompare(b));

/**
 * A free-text city field with a dropdown — the user can pick a known town
 * or just type the name of a place that isn't listed.
 */
export function CityInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const options = useMemo(() => CITY_NAMES, []);
  return <Combobox value={value} onChange={onChange} options={options} placeholder={placeholder} className={className} />;
}
