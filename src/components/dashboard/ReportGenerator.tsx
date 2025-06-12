import React, { useState } from "react";
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
import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { addDays, format } from "date-fns";

interface ReportGeneratorProps {
  farmName?: string;
}

const ReportGenerator = ({
  farmName = "Sample Farm",
}: ReportGeneratorProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    addDays(new Date(), 7),
  );
  const [reportType, setReportType] = useState("daily");
  const [activeTab, setActiveTab] = useState("preview");

  // Mock data for the report
  const mockData = [
    {
      date: "2023-06-01",
      feedUsage: "45 kg",
      mortality: 2,
      eggProduction: 850,
      temperature: "24°C",
      humidity: "65%",
    },
    {
      date: "2023-06-02",
      feedUsage: "43 kg",
      mortality: 1,
      eggProduction: 842,
      temperature: "25°C",
      humidity: "63%",
    },
    {
      date: "2023-06-03",
      feedUsage: "44 kg",
      mortality: 0,
      eggProduction: 855,
      temperature: "23°C",
      humidity: "67%",
    },
    {
      date: "2023-06-04",
      feedUsage: "46 kg",
      mortality: 3,
      eggProduction: 840,
      temperature: "26°C",
      humidity: "62%",
    },
    {
      date: "2023-06-05",
      feedUsage: "45 kg",
      mortality: 1,
      eggProduction: 848,
      temperature: "24°C",
      humidity: "64%",
    },
  ];

  const handleExport = (format: string) => {
    // In a real application, this would trigger the export functionality
    console.log(`Exporting report in ${format} format`);
    // Show a success message or download the file
  };

  return (
    <div className="bg-primary/5 p-6 rounded-lg shadow-md border border-primary/20 w-full">
      <h2 className="text-2xl font-bold mb-6">Report Generator</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>
              Select start and end dates for your report
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="border rounded-md"
              />
            </div>
          </CardContent>
        </Card>

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
                <Button variant="outline" size="sm" className="rounded-full">
                  Feed Usage
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  Mortality
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  Egg Production
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  Environment
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Generate Report</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Download your report in different formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport("csv")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport("excel")}
            >
              <FileType className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
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
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Print Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Table View</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Feed Usage</TableHead>
                      <TableHead>Mortality</TableHead>
                      <TableHead>Egg Production</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead>Humidity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.feedUsage}</TableCell>
                        <TableCell>{row.mortality}</TableCell>
                        <TableCell>{row.eggProduction}</TableCell>
                        <TableCell>{row.temperature}</TableCell>
                        <TableCell>{row.humidity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <div className="flex justify-center items-center h-64 border rounded-md bg-gray-50">
                <p className="text-gray-500">
                  Chart visualizations would appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Feed Consumption
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">223 kg</div>
                      <p className="text-sm text-muted-foreground">
                        Total for selected period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mortality Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">1.4%</div>
                      <p className="text-sm text-muted-foreground">
                        Average for selected period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Egg Production</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">4,235</div>
                      <p className="text-sm text-muted-foreground">
                        Total for selected period
                      </p>
                    </CardContent>
                  </Card>
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
