import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ThermometerIcon,
  DropletIcon,
  EggIcon,
  LineChart as LineChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import LinearProgress from '@mui/material/LinearProgress';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useSelector } from "react-redux";
import { fetchMetrics } from "../../redux/slices/metrics/MetricsSlice";
import { RootState } from "../../redux/store";
import { useAppDispatch } from "../../redux/Hooks/Hooks";
interface KeyMetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: React.ReactNode;
}

const KeyMetricCard = (
  { title, value, trend, trendValue, icon }: KeyMetricCardProps = {
    title: "Metric",
    value: "10",
    trend: "neutral",
    trendValue: "20%",
    icon: <LineChartIcon className="h-4 w-4" />,
  }
) => {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && (
            <ArrowUpIcon className="h-3 w-3 mr-1 text-green-500" />
          )}
          {trend === "down" && (
            <ArrowDownIcon className="h-3 w-3 mr-1 text-red-500" />
          )}
          {trend === "neutral" && <span className="h-3 w-3 mr-1">-</span>}
          <span
            className={`${
              trend === "up"
                ? "text-green-500"
                : trend === "down"
                ? "text-red-500"
                : ""
            }`}
          >
            {trendValue}
          </span>
          <span className="ml-1">from previous period</span>
        </p>
      </CardContent>
    </Card>
  );
};

const KeyMetricsPanel = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  const { data, loading, error } = useSelector(
    (state: RootState) => state.Matrics
  );

  if (loading) return <LinearProgress color="success" />;
  if (error) return <div>Error: {error}</div>;
  if (!data || !data.feedUsage) return <div>No data available</div>;

  // Feed Consumption qty.
  const latestQty = data.feedUsage
    .slice()
    .sort(
      (a, b) =>
        new Date(b.feed_date).getTime() - new Date(a.feed_date).getTime()
    )[0]?.qty;

  // eggProduction total_eggs.
  const eggProduction = data.eggProduction
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0]?.total_eggs;

  // environment Temp  & Humidity .
  const Temp = data.environment
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0]?.temperature;

  const Humidity = data.environment
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0]?.humidity;

  // Mortality
  const Mortality = data.mortality
    .slice()
    .sort(
      (a, b) =>
        new Date(b.mortality_date).getTime() -
        new Date(a.mortality_date).getTime()
    )[0]?.no_of_deaths;

  // Real data for charts
  const feedConsumptionData =
    data?.feedUsage?.map((item: any) => ({
      day: new Date(item.feed_date).toLocaleDateString("en-US", {
        weekday: "short", // e.g., "Mon"
      }),
      amount: parseFloat(item.qty), 
    })) ?? [];

  const growthRateData = [
    { week: "Week 1", weight: 150, target: 155 },
    { week: "Week 2", weight: 320, target: 310 },
    { week: "Week 3", weight: 490, target: 470 },
    { week: "Week 4", weight: 650, target: 630 },
    { week: "Week 5", weight: 820, target: 800 },
    { week: "Week 6", weight: 980, target: 950 },
  ];

  const metrics = data
    ? [
        {
          title: "Feed Consumption",
          value: `${latestQty} Kg`,
          trend: "down",
          trendValue: "3.2%",
          icon: <TrendingDownIcon className="h-4 w-4" />,
        },
        {
          title: "Egg Production",
          value: `${eggProduction} eggs`,
          trend: "up",
          trendValue: "4.3%",
          icon: <EggIcon className="h-4 w-4" />,
        },
        {
          title: "Temperature",
          value: `${Temp}°C`,
          trend: "neutral",
          trendValue: "0%",
          icon: <ThermometerIcon className="h-4 w-4" />,
        },
        {
          title: "Humidity",
          value: `${Humidity} %`,
          trend: "up",
          trendValue: "5%",
          icon: <DropletIcon className="h-4 w-4" />,
        },
        {
          title: "Mortality Rate",
          value: `${Mortality} %`,
          trend: "down",
          trendValue: "1.2%",
          icon: <TrendingDownIcon className="h-4 w-4" />,
        },
      ]
    : [];

  return (
    <div className="w-full bg-primary/5 p-6 rounded-lg shadow-md border border-primary/20">
      <h2 className="text-xl font-semibold mb-4">Key Farm Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <KeyMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend as "up" | "down" | "neutral"}
            trendValue={metric.trendValue}
            icon={metric.icon}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Feed Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={feedConsumptionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" />
                <YAxis unit=" kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  name="Feed Used"
                  unit=" kg"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Growth Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={growthRateData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="week" />
                <YAxis unit=" g" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Actual Weight"
                  unit=" g"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target Weight"
                  unit=" g"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyMetricsPanel;
