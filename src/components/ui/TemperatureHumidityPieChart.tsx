import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoricalDataItem {
  time: string;
  humidity: number;
  temp: number;
}

interface TemperatureHumidityPieChartProps {
  data: HistoricalDataItem[];

}

const COLORS = ['#8884d8', '#82ca9d', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000']; // Example colors

const TemperatureHumidityPieChart: React.FC<TemperatureHumidityPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No historical data to display in chart.
      </div>
    );
  }

  const totalTemp = data.reduce((sum, entry) => sum + entry.temp, 0);
  const totalHumidity = data.reduce((sum, entry) => sum + entry.humidity, 0);
  const dataCount = data.length;

  const averageTemp = dataCount > 0 ? totalTemp / dataCount : 0;
  const averageHumidity = dataCount > 0 ? totalHumidity / dataCount : 0;

  const pieChartData = [
    { name: 'Average Temperature (°C)', value: averageTemp },
    { name: 'Average Humidity (%)', value: averageHumidity },
  ];

  const filteredPieChartData = pieChartData.filter(entry => entry.value > 0);

  if (filteredPieChartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No meaningful data for pie chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredPieChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {filteredPieChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => { // <--- Explicitly type 'value' as 'any' or 'number'
            if (typeof value === 'number') {
              return [`${value.toFixed(2)}`, name];
            }
            return [value, name]; // Fallback for non-numeric values if any
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TemperatureHumidityPieChart;