import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface PricePoint {
    date: string;
    price: number;
}

interface PriceChartProps {
    data: PricePoint[];
    className?: string;
}

export function PriceChart({ data, className }: PriceChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-indigo-600 shadow-sm">
                                        ${payload[0].value}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#4f46e5" // Indigo 600
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
