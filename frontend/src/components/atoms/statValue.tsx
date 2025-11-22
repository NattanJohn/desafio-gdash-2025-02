export function StatValue({ value, unit }: { value: string | number; unit?: string }) {
  return (
    <div className="text-4xl font-bold text-white flex gap-1">
      {value}
      {unit && <span className="text-lg opacity-70">{unit}</span>}
    </div>
  );
}
