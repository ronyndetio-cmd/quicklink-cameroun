export function maskedPhone(phone: string): string {
  const clean = (phone ?? '').replace(/\D/g, '');
  return `${clean.slice(0, 3) || '6**'} *** ***`;
}

export function formatPhone(phone: string): string {
  const clean = (phone ?? '').replace(/\D/g, '');
  const local = clean.startsWith('237') ? clean.slice(3) : clean;
  return local.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}
