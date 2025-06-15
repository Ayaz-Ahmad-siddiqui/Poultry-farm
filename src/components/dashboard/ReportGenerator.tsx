import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
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
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAppDispatch, useAppSelector } from "@/redux/Hooks/Hooks";
import { fetchFeedUsages } from "@/redux/slices/dataEntry/feedUsageSlice";
import { fetchMortalityRates } from "@/redux/slices/dataEntry/mortalityRateSlice";
import { fetchEggProductions } from "@/redux/slices/dataEntry/eggProductionSlice";
import { fetchEnvironments } from "@/redux/slices/dataEntry/environmentSlice";

interface ReportGeneratorProps {
  farmName?: string;
}

interface KeyMetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: React.ReactNode;
}

const ReportGenerator = ({
  farmName = "Sample Farm",
}: ReportGeneratorProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    addDays(new Date(), 7)
  );
  const dispatch = useAppDispatch();
  const [reportType, setReportType] = useState("daily");
  const [activeTab, setActiveTab] = useState("preview");
  const printRef = useRef(null);
  const dateRangeRef = useRef(null);
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: "selection",
    },
  ]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Feed Usage");
  const startDate = state[0].startDate;
  const EndDate = state[0].endDate ?? new Date();

  const [showDateRange, setShowDateRange] = useState(false);
  const [isDateFiltered, setIsDateFiltered] = useState(false);

  const feedUsageData = useAppSelector((state) => state.feedUsage.feedUsages);
  const mortalityData = useAppSelector(
    (state) => state.mortalityRate.mortalityRates
  );
  const eggProductionData = useAppSelector(
    (state) => state.eggProduction.eggProductions
  );
  const environmentData = useAppSelector(
    (state) => state.environment.environments
  );

  useEffect(() => {
    dispatch(fetchFeedUsages());
    dispatch(fetchMortalityRates());
    dispatch(fetchEggProductions());
    dispatch(fetchEnvironments());
  }, [dispatch]);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dateRangeRef.current &&
      !dateRangeRef.current.contains(event.target as Node)
    ) {
      setShowDateRange(false);
    }
  };

  if (showDateRange) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showDateRange]);

  const { data, loading, error } = useSelector(
    (state: RootState) => state.Matrics
  );

  // Real data for charts
  const feedConsumptionData =
    data?.feedUsage?.map((item: any) => ({
      day: new Date(item.feed_date).toLocaleDateString("en-US", {
        weekday: "short", // e.g., "Mon"
      }),
      amount: parseFloat(item.qty),
    })) ?? [];

  const exportToExcel = () => {
    let dataToExport: any[] = [];
    let headers: string[] = [];

    if (selectedCategory === "Feed Usage") {
      dataToExport = feedUsageData.map((row) => ({
        Date: row.feed_date,
        "Feed Type": row.feed_type,
        Quantity: row.qty,
        Time: row.time_of_feeding,
        Notes: row.notes,
      }));
    } else if (selectedCategory === "Mortality") {
      dataToExport = mortalityData.map((row) => ({
        "No. of Deaths": row.no_of_deaths,
        "Cause of Death": row.cause_of_death,
        Location: row.location_farm,
        Notes: row.notes,
      }));
    } else if (selectedCategory === "Egg Production") {
      dataToExport = eggProductionData.map((row) => ({
        "Total Eggs": row.total_eggs,
        "Broken Eggs": row.broken_eggs,
        "Collection Time": row.collection_time,
        Notes: row.notes,
      }));
    } else if (selectedCategory === "Environment") {
      dataToExport = environmentData.map((row) => ({
        Date: row.collection_date,
        Temperature: row.temperature,
        Humidity: row.humidity,
        Time: row.collection_time,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      selectedCategory || "Sheet1"
    );
    XLSX.writeFile(workbook, `${selectedCategory || "report"}.xlsx`);
  };

  const exportToPDF = () => {
    let columns: string[] = [];
    let rows: any[][] = [];

    if (selectedCategory === "Feed Usage") {
      columns = ["Date", "Feed Type", "Quantity", "Time", "Notes"];
      rows = feedUsageData.map((row) => [
        row.feed_date,
        row.feed_type,
        row.qty,
        row.time_of_feeding,
        row.notes,
      ]);
    } else if (selectedCategory === "Mortality") {
      columns = ["No. of Deaths", "Cause of Death", "Location", "Notes"];
      rows = mortalityData.map((row) => [
        row.no_of_deaths,
        row.cause_of_death,
        row.location_farm,
        row.notes,
      ]);
    } else if (selectedCategory === "Egg Production") {
      columns = ["Total Eggs", "Broken Eggs", "Collection Time", "Notes"];
      rows = eggProductionData.map((row) => [
        row.total_eggs,
        row.broken_eggs,
        row.collection_time,
        row.notes,
      ]);
    } else if (selectedCategory === "Environment") {
      columns = ["Date", "Temperature", "Humidity", "Time"];
      rows = environmentData.map((row) => [
        row.collection_date,
        row.temperature,
        row.humidity,
        row.collection_time,
      ]);
    }

    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
    });
    doc.save(`${selectedCategory || "report"}.pdf`);
  };

  const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isWithinRange = (dateStr: string | Date) => {
  const date = normalizeDate(new Date(dateStr));
  const from = normalizeDate(startDate);
  const to = normalizeDate(EndDate);

  return date >= from && date <= to;
};

const getFilteredData = () => {
  if (!isDateFiltered) {
    switch (selectedCategory) {
      case "Feed Usage":
        return feedUsageData;
      case "Mortality":
        return mortalityData;
      case "Egg Production":
        return eggProductionData;
      case "Environment":
        return environmentData;
      default:
        return [];
    }
  }

  // Filtered by date range
  switch (selectedCategory) {
    case "Feed Usage":
      return feedUsageData.filter((row) => isWithinRange(row.feed_date));
    case "Mortality":
      return mortalityData.filter((row) => isWithinRange(row.mortality_date));
    case "Egg Production":
      return eggProductionData.filter((row) => isWithinRange(row.collection_date));
    case "Environment":
      return environmentData.filter((row) =>
        isWithinRange(row.collection_date)
      );
    default:
      return [];
  }
};

const filteredData = getFilteredData();

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

  // Mortality
  const Mortality = data.mortality
    .slice()
    .sort(
      (a, b) =>
        new Date(b.mortality_date).getTime() -
        new Date(a.mortality_date).getTime()
    )[0]?.no_of_deaths;

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
          title: "Mortality Rate",
          value: `${Mortality} %`,
          trend: "down",
          trendValue: "1.2%",
          icon: <TrendingDownIcon className="h-4 w-4" />,
        },
      ]
    : [];

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

  const handlePrintPreview = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const newWindow = window.open("", "", "width=900,height=650");

    if (newWindow) {
      newWindow.document.write(`
      <html>
        <head>
          <title>Print Preview - ${selectedCategory}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>${selectedCategory} Report</h2>
          ${printContents}
        </body>
      </html>
    `);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    }
  };

  return (
    <div className="bg-primary/5 p-6 rounded-lg shadow-md border border-primary/20 w-full">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-6">Report Generator</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDateFiltered(false)}>
            Clear Filter
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDateRange((prev) => !prev)}
          >
            {state[0].startDate
              ? format(state[0].startDate, "PP")
              : "Select Date"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowDateRange((prev) => !prev)}
          >
            Continuous
          </Button>
          {showDateRange && (
             <div ref={dateRangeRef} className="absolute z-50 mt-2">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => {
                setState([item.selection]);
                setIsDateFiltered(true);
              }}
              moveRangeOnFirstSelection={false}
              ranges={state}
            />
          </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Options</CardTitle>
          <CardDescription>Configure your report settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Report Type
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {["Feed Usage", "Mortality", "Egg Production", "Environment"].map(
                (category) => (
                  <Button
                    key={category}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full transition-colors ${
                      selectedCategory === category
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePrintPreview}>Generate Report</Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                {date && endDate ? (
                  <>
                    From {format(date, "PPP")} to {format(endDate, "PPP")}
                  </>
                ) : (
                  "Select date range to preview report"
                )}
              </CardDescription>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button onClick={() => exportToPDF()} title="Export as PDF">
                <FileText className="h-4 w-4" />
              </Button>
              <Button onClick={() => exportToExcel()} title="Export as Excel">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={handlePrintPreview}>
                <Download className="mr-2 h-4 w-4" />
                Print Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Table View</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {activeTab === "preview" && selectedCategory === "Feed Usage" && (
              <div ref={printRef}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Feed Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* {feedUsageData.map((row, index) => ( */}
                      {filteredData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.feed_date}</TableCell>
                        <TableCell>{row.feed_type}</TableCell>
                        <TableCell>{row.qty}</TableCell>
                        <TableCell>{row.time_of_feeding}</TableCell>
                        <TableCell>{row.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {activeTab === "preview" && selectedCategory === "Mortality" && (
              <div ref={printRef}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. of Deaths</TableHead>
                      <TableHead>Cause of Death</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* {mortalityData.map((row, index) => ( */}
                    {filteredData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.no_of_deaths}</TableCell>
                        <TableCell>{row.cause_of_death}</TableCell>
                        <TableCell>{row.location_farm}</TableCell>
                        <TableCell>{row.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {activeTab === "preview" &&
              selectedCategory === "Egg Production" && (
                <div ref={printRef}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Total Eggs</TableHead>
                        <TableHead>Broken Eggs</TableHead>
                        <TableHead>Collection Time</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* {eggProductionData.map((row, index) => ( */}
                      {filteredData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.total_eggs}</TableCell>
                          <TableCell>{row.broken_eggs}</TableCell>
                          <TableCell>{row.collection_time}</TableCell>
                          <TableCell>{row.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            {activeTab === "preview" && selectedCategory === "Environment" && (
              <div ref={printRef}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead>Humidity</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* {environmentData.map((row, index) => ( */}
                    {filteredData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.collection_date}</TableCell>
                        <TableCell>{row.temperature}</TableCell>
                        <TableCell>{row.humidity}</TableCell>
                        <TableCell>{row.collection_time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <TabsContent value="charts">
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
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
