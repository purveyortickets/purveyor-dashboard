interface Props {
  title: string;
  value: number | string;
  color?: string;
}

export default function StatsCard({ title, value }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}