import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ShapChart({ shap }) {
  if (!shap) return null;

  const data = Object.entries(shap)
    .map(([f, v]) => ({ feature: f, value: Math.abs(v), sign: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 70 }}>
        <XAxis type="number" />
        <YAxis dataKey="feature" type="category" width={120} />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  );
}
