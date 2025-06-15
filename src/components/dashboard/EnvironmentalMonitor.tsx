import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ThermometerIcon,
  Droplets,
  Bell,
  Settings,
  RefreshCw,
} from "lucide-react";

// Charts
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
import MyPieChart from "../ui/MyPieChart";
import TemperatureHumidityPieChart from "../ui/TemperatureHumidityPieChart ";
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
// Charts

interface EnvironmentalData {
  temprature: number; // This interface is likely for a prop, but not matching Redux state structure
  humidity: number;
  lastUpdated: string;
}

interface EnvironmentalMonitorProps {
  data?: EnvironmentalData; // This prop data is not used, Redux data is
  onRefresh?: () => void;
  onConfigureAlerts?: () => void;
}

const EnvironmentalMonitor: React.FC<EnvironmentalMonitorProps> = ({
  onRefresh = () => {
    window.location.reload();
  },
  onConfigureAlerts = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("current");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [tempThreshold, setTempThreshold] = useState([18, 32]);
  const [humidityThreshold, setHumidityThreshold] = useState([50, 75]);

  // Redux Code
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  const { data, loading, error } = useSelector(
    (state: RootState) => state.Matrics
  );

  console.log("Fetched Data:", data);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || !data.feedUsage || !data.environment)
    return <div>No data available</div>; // Added data.environment check

  // environment Temp & Humidity .
  // Ensure that `data.environment` has elements before trying to access [0]
  const latestEnvironmentEntry = data.environment
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];

  const Temp = latestEnvironmentEntry?.temperature;
  const Humidity = latestEnvironmentEntry?.humidity;
  const lastUpdatedTime = latestEnvironmentEntry?.updated_at; // Capture last updated time

  // Redux Code

  // Determine status based on thresholds - NOW USING 'Temp' and 'Humidity' constants
  const getTempStatus = (currentTemp: number | undefined) => {
    if (currentTemp === undefined) return "unknown"; // Handle case where Temp is not available
    if (currentTemp < tempThreshold[0]) return "cold";
    if (currentTemp > tempThreshold[1]) return "hot";
    return "normal";
  };

  const getHumidityStatus = (currentHumidity: number | undefined) => {
    if (currentHumidity === undefined) return "unknown"; // Handle case where Humidity is not available
    if (currentHumidity < humidityThreshold[0]) return "dry";
    if (currentHumidity > humidityThreshold[1]) return "humid";
    return "normal";
  };

  // Pass the actual fetched Temp and Humidity values
  const tempStatus = getTempStatus(Temp);
  const humidityStatus = getHumidityStatus(Humidity);

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "cold":
      case "dry":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "hot":
      case "humid":
        return "bg-red-100 text-red-800 border-red-200";
      case "unknown": // Added for when data isn't available
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Progress bar colors
  const getProgressColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500";
      case "cold":
      case "dry":
        return "bg-blue-500";
      case "hot":
      case "humid":
        return "bg-red-500";
      case "unknown": // Added for when data isn't available
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const real_kHistoricalData =
    data?.environment?.map((item: any) => ({
      time: new Date(`1970-01-01T${item.collection_time}Z`).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      ),
      humidity: parseFloat(item.humidity),
      temp: parseFloat(item.temperature),
    })) ?? [];

  // Real data for charts
  const feedConsumptionData =
    data?.feedUsage?.map((item: any) => ({
      day: new Date(item.feed_date).toLocaleDateString("en-US", {
        weekday: "short", // e.g., "Mon"
      }),
      amount: parseFloat(item.qty),
    })) ?? [];

  const sampleHistoricalData = [
    // <--- This mock data
    { time: "08:00 AM", humidity: 60, temp: 25 },
    { time: "12:00 PM", humidity: 65, temp: 28 },
    { time: "04:00 PM", humidity: 70, temp: 30 },
    { time: "08:00 PM", humidity: 55, temp: 22 },
  ];

  console.log("--- Historical Data for Chart ---", real_kHistoricalData);

  return (
    <Card className="w-full bg-primary/5 shadow-md border border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Environmental Monitoring
            </CardTitle>
            <CardDescription>
              Real-time temperature and humidity tracking
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          defaultValue="current"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Conditions</TabsTrigger>
            <TabsTrigger value="history">Historical Data</TabsTrigger>
            {/* <TabsTrigger value="settings">Alert Settings</TabsTrigger> */}
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {/* Temperature Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`border ${getStatusColor(tempStatus)}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <ThermometerIcon className="h-5 w-5 mr-2" /> Temperature
                    </CardTitle>
                    <Badge
                      variant={
                        tempStatus === "normal" ? "secondary" : "destructive"
                      }
                    >
                      {tempStatus === "normal"
                        ? "Normal"
                        : tempStatus === "hot"
                        ? "High"
                        : tempStatus === "cold"
                        ? "Low"
                        : "N/A"}{" "}
                      {/* Added N/A for unknown status */}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {Temp !== undefined ? `${Math.floor(Temp)}°C` : "N/A"}{" "}
                    {/* Display N/A if Temp is undefined */}
                  </div>
                  <Progress
                    value={Temp !== undefined ? Temp : 0} // Ensure value is a number for Progress
                    className="h-2"
                    indicatorClassName={getProgressColor(tempStatus)}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0°C</span>
                    <span>25°C</span>
                    <span>50°C</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Ideal range: {tempThreshold[0]}°C - {tempThreshold[1]}°C
                  </div>
                </CardContent>
              </Card>

              {/* Humidity Card */}
              <Card className={`border ${getStatusColor(humidityStatus)}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Droplets className="h-5 w-5 mr-2" /> Humidity
                    </CardTitle>
                    <Badge
                      variant={
                        humidityStatus === "normal"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {humidityStatus === "normal"
                        ? "Normal"
                        : humidityStatus === "humid"
                        ? "High"
                        : humidityStatus === "dry"
                        ? "Low"
                        : "N/A"}{" "}
                      {/* Added N/A for unknown status */}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {Humidity !== undefined
                      ? `${Math.floor(Humidity)}%`
                      : "N/A"}{" "}
                    {/* Display N/A if Humidity is undefined */}
                  </div>
                  <Progress
                    value={Humidity !== undefined ? Humidity : 0} // Ensure value is a number for Progress
                    className="h-2"
                    indicatorClassName={getProgressColor(humidityStatus)}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Ideal range: {humidityThreshold[0]}% -{" "}
                    {humidityThreshold[1]}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert Section */}
            {(tempStatus !== "normal" || humidityStatus !== "normal") && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Environmental Alert</AlertTitle>
                <AlertDescription>
                  {tempStatus !== "normal" && (
                    <div>
                      Temperature is {tempStatus === "hot" ? "above" : "below"}{" "}
                      the recommended range.
                    </div>
                  )}
                  {humidityStatus !== "normal" && (
                    <div>
                      Humidity is{" "}
                      {humidityStatus === "humid" ? "above" : "below"} the
                      recommended range.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 text-right">
              Last updated:{" "}
              {lastUpdatedTime
                ? new Date(lastUpdatedTime).toLocaleString()
                : "N/A"}{" "}
              {/* Display last updated time */}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <div className="h-auto rounded-md p-4 flex items-center justify-center">
                <div className="text-center h-full w-full grid gap-4">
                  <div className="">
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle>Historical Environmental Data</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={feedConsumptionData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="colorAmount"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
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
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.1}
                            />
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
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Temperature (°C)</th>{" "}
                      {/* Corrected typo */}
                      <th className="text-left py-2">Humidity (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {real_kHistoricalData.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{entry.time}</td>
                        <td className="py-2">{entry.temp}</td>
                        <td className="py-2">{entry.humidity}</td>
                      </tr>
                    ))}
                    {real_kHistoricalData.length === 0 && ( // Handle empty historical data
                      <tr>
                        <td
                          colSpan={3}
                          className="py-4 text-center text-gray-500"
                        >
                          No historical data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* <TabsContent value="settings">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="alerts-enabled">Enable Alerts</Label>
                  <div className="text-sm text-gray-500">
                    Receive notifications when conditions are out of range
                  </div>
                </div>
                <Switch
                  id="alerts-enabled"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature Alert Range (°C)</Label>{" "}
                  <Slider
                    defaultValue={tempThreshold}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={setTempThreshold}
                  />
                  <div className="flex justify-between text-sm">
                    <span>Min: {tempThreshold[0]}°C</span>
                    <span>Max: {tempThreshold[1]}°C</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Humidity Alert Range (%)</Label>
                  <Slider
                    defaultValue={humidityThreshold}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={setHumidityThreshold}
                  />
                  <div className="flex justify-between text-sm">
                    <span>Min: {humidityThreshold[0]}%</span>
                    <span>Max: {humidityThreshold[1]}%</span>
                  </div>
                </div>
              </div>

              <Button onClick={onConfigureAlerts} className="w-full">
                <Bell className="h-4 w-4 mr-2" /> Configure Notification
                Settings
              </Button>
            </div>
          </TabsContent> */}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnvironmentalMonitor;
