import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSimulationStore } from "../../stores/simulationStore";

/**
 * Real-time depth chart showing insertion depth over time.
 * Embedded inline inside a HUDPanel in the right sidebar — no longer
 * self-positions with fixed/absolute, so it can never float over or
 * collide with other panels.
 */
export function RealTimeChart() {
  const chartData = useSimulationStore((s) => s.chartData);
  const insertionDepth = useSimulationStore((s) => s.insertionDepth);

  const formattedData = useMemo(() => {
    if (chartData.length === 0) return [];
    const startTime = chartData[0].timestamp;
    return chartData.map((point) => ({
      time: ((point.timestamp - startTime) / 1000).toFixed(1),
      depth: point.depth.toFixed(2),
    }));
  }, [chartData]);

  if (chartData.length < 2) {
    return (
      <div className="flex h-[80px] items-center justify-center text-xs text-blue-300/40">
        Insert needle to begin recording
      </div>
    );
  }

  return (
    <div className="text-blue-100">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] text-blue-300/70">
          Current: <span className="font-mono">{insertionDepth.toFixed(1)} mm</span>
        </span>
        <span className="text-[10px] text-blue-300/50">{chartData.length} pts</span>
      </div>

      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis dataKey="time" tick={{ fill: "#93c5fd", fontSize: 9 }} stroke="#4488ff" />
            <YAxis tick={{ fill: "#93c5fd", fontSize: 9 }} stroke="#4488ff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 30, 0.9)",
                border: "1px solid rgba(100, 140, 255, 0.3)",
                borderRadius: "4px",
                color: "#c8d8f0",
                fontSize: "11px",
              }}
              labelStyle={{ color: "#93c5fd" }}
            />
            <Line
              type="monotone"
              dataKey="depth"
              stroke="#4488ff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#4488ff", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
