import React from 'react';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';

const TemperatureHumidityPieChart = ({ data, selectedTime }) => {
  // Find the data point for the given time
  const timeData = data.find((entry) => entry.time === selectedTime);

  if (!timeData) return <p>No data available for {selectedTime}</p>;

  // Format the data for Pie charts
  const tempData = [
    { name: 'Temperature', value: timeData.temp },
    { name: 'Remaining', value: 50 - timeData.temp }, // Assuming 50°C max for scale
  ];

  const humidityData = [
    { name: 'Humidity', value: timeData.humidity },
    { name: 'Remaining', value: 100 - timeData.humidity }, // Since humidity is in percentage
  ];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <PieChart>
        <Pie
          data={tempData}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          label={({ name, value }) => `${name}: ${value}`}
        />
        <Pie
          data={humidityData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          fill="#82ca9d"
          label={({ name, value }) => `${name}: ${value}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TemperatureHumidityPieChart;
