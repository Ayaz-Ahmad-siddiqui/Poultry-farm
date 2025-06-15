import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TableCrud from "@/components/ui/TableCrud";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useAppDispatch, useAppSelector } from "@/redux/Hooks/Hooks";
import {
  createFeedUsage,
  fetchFeedUsages,
  updateFeedUsage,
  deleteFeedUsage,
  clearFeedUsageStatus,
} from "@/redux/slices/dataEntry/feedUsageSlice";
import {
  createEnvironment,
  fetchEnvironments,
  updateEnvironment,
  deleteEnvironment,
  clearEnvironmentStatus,
} from "@/redux/slices/dataEntry/environmentSlice";
import {
  createEggProduction,
  fetchEggProductions,
  updateEggProduction,
  deleteEggProduction,
  clearEggProductionStatus,
} from "@/redux/slices/dataEntry/eggProductionSlice";
import {
  createMortalityRate,
  fetchMortalityRates,
  updateMortalityRate,
  deleteMortalityRate,
  clearMortalityRateStatus,
  MortalityRate,
} from "@/redux/slices/dataEntry/mortalityRateSlice";
import { toast } from "../ui/use-toast";

interface DataEntryFormProps {
  onSubmit?: (data: any) => void;
}

const DataEntryForm = ({ onSubmit = () => {} }: DataEntryFormProps) => {
  const dispatch = useAppDispatch();

  const {
    loading: feedLoading,
    error: feedError,
    createSuccess: feedCreateSuccess,
    feedUsages,
  } = useAppSelector((state) => state.feedUsage);
  const {
    loading: envLoading,
    error: envError,
    createSuccess: envCreateSuccess,
    environments,
  } = useAppSelector((state) => state.environment);
  const { 
    loading: eggLoading,
    error: eggError,
    createSuccess: eggCreateSuccess,
    eggProductions,
  } = useAppSelector((state) => state.eggProduction);
  const {
    loading: mortalityLoading,
    error: mortalityError,
    createSuccess: mortalityCreateSuccess,
    mortalityRates,
  } = useAppSelector((state) => state.mortalityRate);

  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("feed");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [TableIsHidden, setTableIsHidden] = useState(false);

  const [feedData, setFeedData] = useState({
    feedType: "",
    quantity: "",
    timeOfFeeding: "",
    notes: "",
  });

  const [mortalityData, setMortalityData] = useState({
    count: "",
    cause: "",
    location: "",
    notes: "",
  });

  const [eggData, setEggData] = useState({
    totalCount: "",
    brokenCount: "",
    collectionTime: "",
    notes: "",
  });

  const [envoirments, setEnvoirments] = useState({
    temprature: "",
    humidity: "",
    time: "",
    date: "",
  });

  useEffect(() => {
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");
    dispatch(clearFeedUsageStatus());
    dispatch(clearEnvironmentStatus());
    dispatch(clearEggProductionStatus());
    dispatch(clearMortalityRateStatus());

    if (activeTab === "feed") {
      dispatch(fetchFeedUsages());
    } else if (activeTab === "mortality") {
      dispatch(fetchMortalityRates());
    } else if (activeTab === "eggData") {
      dispatch(fetchEggProductions());
    } else if (activeTab === "envoirments") {
      dispatch(fetchEnvironments());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (feedCreateSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearFeedUsageStatus());
      }, 3000);
    }
    if (mortalityCreateSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearMortalityRateStatus());
      }, 3000);
    }
    if (eggCreateSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearEggProductionStatus());
      }, 3000);
    }
    if (envCreateSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearEnvironmentStatus());
      }, 3000);
    }

    if (feedCreateSuccess || mortalityCreateSuccess || eggCreateSuccess || envCreateSuccess) {
      if (activeTab === "feed") dispatch(fetchFeedUsages());
      if (activeTab === "mortality") dispatch(fetchMortalityRates());
      if (activeTab === "eggData") dispatch(fetchEggProductions());
      if (activeTab === "envoirments") dispatch(fetchEnvironments());
    }
  }, [feedCreateSuccess, mortalityCreateSuccess, eggCreateSuccess, envCreateSuccess, activeTab, dispatch]);

  useEffect(() => {
    if (feedError) {
      setShowError(true);
      setErrorMessage(feedError);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
        dispatch(clearFeedUsageStatus());
      }, 5000);
    }
    if (mortalityError) {
      setShowError(true);
      setErrorMessage(mortalityError);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
        dispatch(clearMortalityRateStatus());
      }, 5000);
    }
    if (eggError) {
      setShowError(true);
      setErrorMessage(eggError);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
        dispatch(clearEggProductionStatus());
      }, 5000);
    }
    if (envError) {
      setShowError(true);
      setErrorMessage(envError);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
        dispatch(clearEnvironmentStatus());
      }, 5000);
    }
  }, [feedError, mortalityError, eggError, envError, activeTab, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Submitting data for tab:", activeTab);
  e.preventDefault();
  const formattedDate = format(date, "yyyy-MM-dd");
  let submissionData: any;

  try {
    if (activeTab === "feed") {
      submissionData = {
        feed_date: formattedDate,
        feed_type: feedData.feedType,
        qty: parseFloat(feedData.quantity),
        time_of_feeding: feedData.timeOfFeeding,
        notes: feedData.notes,
      };
  
      const result = await dispatch(createFeedUsage(submissionData));
      if (createFeedUsage.fulfilled.match(result)) {
        toast({ title: "Feed data submitted", description: "Feed usage recorded successfully.", variant: "success" });
        setFeedData({ feedType: "", quantity: "", timeOfFeeding: "", notes: "" });
      } else {
        toast({ title: "Submission failed", description: String(result.payload) || "Failed to submit feed data.", variant: "destructive" });
      }
    }

    else if (activeTab === "mortality") {
      const mortalityPayload: Omit<MortalityRate, "id" | "notes"> = {
        mortality_date: formattedDate,
        no_of_deaths: parseInt(mortalityData.count),
        cause_of_death: mortalityData.cause,
        location_farm: mortalityData.location,
      };
      submissionData = {
        ...mortalityPayload,
        notes: mortalityData.notes,
      };
      const result = await dispatch(createMortalityRate(mortalityPayload));
      if (createMortalityRate.fulfilled.match(result)) {
        toast({ title: "Mortality data submitted", description: "Mortality record saved.", variant: "success" });
        setMortalityData({ count: "", cause: "", location: "", notes: "" });
      } else {
        toast({ title: "Submission failed", description: String(result.payload) || "Failed to submit mortality data.", variant: "destructive" });
      }
    }

    else if (activeTab === "eggData") {
      submissionData = {
        collection_date: formattedDate,
        total_eggs: parseInt(eggData.totalCount),
        broken_eggs: parseInt(eggData.brokenCount),
        collection_time: eggData.collectionTime,
        notes: eggData.notes,
      };
      const result = await dispatch(createEggProduction(submissionData));
      if (createEggProduction.fulfilled.match(result)) {
        toast({ title: "Egg production submitted", description: "Egg data recorded successfully.",variant: "success" });
        setEggData({ totalCount: "", brokenCount: "", collectionTime: "", notes: "" });
      } else {
        toast({ title: "Submission failed", description: String(result.payload) || "Failed to submit egg data.", variant: "destructive" });
      }
    }

    else if (activeTab === "envoirments") {
      submissionData = {
        collection_date: formattedDate,
        temperature: parseFloat(envoirments.temprature),
        humidity: parseFloat(envoirments.humidity),
        collection_time: envoirments.time,
      };
      const result = await dispatch(createEnvironment(submissionData));
      if (createEnvironment.fulfilled.match(result)) {
        toast({ title: "Environment data submitted", description: "Environment conditions recorded.", variant: "success" });
        setEnvoirments({ temprature: "", humidity: "", time: "", date: "" });
      } else {
        toast({ title: "Submission failed", description: String(result.payload) || "Failed to submit environment data.", variant: "destructive" });
      }
    }

    // Call callback if needed
    onSubmit(submissionData);

  } catch (err) {
    toast({
      title: "Unexpected error",
      description: "Something went wrong while submitting the form.",
      variant: "destructive",
    });
  }
};


  const handleFeedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMortalityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMortalityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEggChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEggData((prev) => ({ ...prev, [name]: value }));
  };

  const hanndleEnvoirmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEnvoirments((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableUpdate = (id: string, updatedData: Record<string, any>) => {
    const numericId = parseInt(id);

    if (activeTab === "feed") {
      const transformedFeedData = {
        feed_date: updatedData["Date"],
        feed_type: updatedData["Feed Type"],
        qty: parseFloat(updatedData["Quantity (kg)"]),
        time_of_feeding: updatedData["Time of Feeding"],
        notes: updatedData["Notes"],
      };
      if (transformedFeedData.notes === undefined || transformedFeedData.notes === "-") {
        delete transformedFeedData.notes;
      }

      dispatch(updateFeedUsage({ id: numericId, feedData: transformedFeedData }))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchFeedUsages());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to update feed usage.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    } else if (activeTab === "mortality") {
      const transformedMortalityData = {
        mortality_date: updatedData["Date"],
        no_of_deaths: parseInt(updatedData["Number of Deaths"]),
        cause_of_death: updatedData["Cause of Death"],
        location_farm: updatedData["Location"],
        notes: updatedData["Notes"],
      };
      if (transformedMortalityData.notes === undefined || transformedMortalityData.notes === "-") {
        delete transformedMortalityData.notes;
      }
      dispatch(updateMortalityRate({ id: numericId, mortalityData: transformedMortalityData }))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchMortalityRates());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to update mortality rate.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    } else if (activeTab === "eggData") {
      const transformedEggData = {
        collection_date: updatedData["Date"],
        total_eggs: parseInt(updatedData["Total Eggs"]),
        broken_eggs: parseInt(updatedData["Broken Eggs"]),
        collection_time: updatedData["Collection Time"],
        notes: updatedData["Notes"],
      };
      if (transformedEggData.notes === undefined || transformedEggData.notes === "-") {
        delete transformedEggData.notes;
      }
      dispatch(updateEggProduction({ id: numericId, eggData: transformedEggData }))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchEggProductions());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to update egg production.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    } else if (activeTab === "envoirments") {
      const transformedEnvData = {
        collection_date: updatedData["Date"],
        temperature: parseFloat(updatedData["Temperature"]),
        humidity: parseFloat(updatedData["Humidity"]),
        collection_time: updatedData["Time"],
      };
      dispatch(updateEnvironment({ id: numericId, envData: transformedEnvData }))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchEnvironments());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to update environment data.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    }
  };

  const handleTableDelete = (id: string) => {
    const numericId = parseInt(id);

    if (activeTab === "feed") {
      dispatch(deleteFeedUsage(numericId))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchFeedUsages());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to delete feed usage.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    } else if (activeTab === "mortality") {
      dispatch(deleteMortalityRate(numericId))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchMortalityRates());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to delete mortality rate.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    } else if (activeTab === "eggData") {
      dispatch(deleteEggProduction(numericId))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchEggProductions());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to delete egg production.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    } else if (activeTab === "envoirments") {
      dispatch(deleteEnvironment(numericId))
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          dispatch(fetchEnvironments());
        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage(error.message || "Failed to delete environment data.");
          setTimeout(() => { setShowError(false); setErrorMessage(""); }, 5000);
        });
    }
  };

  const getTableData = () => {
    if (activeTab === "feed") {
      return feedUsages.map((item) => ({
        id: item.id.toString(),
        "Feed Type": item.feed_type,
        "Quantity (kg)": item.qty,
        "Time of Feeding": item.time_of_feeding,
        "Date": item.feed_date,
        "Notes": item.notes || "-",
      }));
    } else if (activeTab === "mortality") {
      return mortalityRates.map((item) => ({
        id: item.id.toString(),
        "Number of Deaths": item.no_of_deaths,
        "Cause of Death": item.cause_of_death,
        "Location": item.location_farm || "-",
        "Date": item.mortality_date,
      }));
    } else if (activeTab === "eggData") {
      return eggProductions.map((item) => ({
        id: item.id.toString(),
        "Total Eggs": item.total_eggs,
        "Broken Eggs": item.broken_eggs,
        "Collection Time": item.collection_time,
        "Date": item.collection_date,
        "Notes": item.notes || "-",
      }));
    } else if (activeTab === "envoirments") {
      return environments.map((item) => ({
        id: item.id.toString(),
        "Temperature": item.temperature,
        "Humidity": item.humidity,
        "Time": item.collection_time,
        "Date": item.collection_date,
      }));
    }
    return [];
  };

  const getTableColumns = () => {
    if (activeTab === "feed") {
      return ["Feed Type", "Quantity (kg)", "Time of Feeding", "Date", "Notes"];
    } else if (activeTab === "mortality") {
      return ["Number of Deaths", "Cause of Death", "Location", "Date"];
    } else if (activeTab === "eggData") {
      return ["Total Eggs", "Broken Eggs", "Collection Time", "Date", "Notes"];
    } else if (activeTab === "envoirments") {
      return ["Temperature", "Humidity", "Time", "Date"];
    }
    return [];
  };

  return (
    <div className="w-full bg-primary/5 p-6 rounded-lg shadow-md border border-primary/20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daily Data Entry</CardTitle>
          <CardDescription>
            Record daily farm data including feed usage, mortality rates, and
            egg production.
          </CardDescription>

          <div className="flex items-center space-x-4 mt-4">
            <Label htmlFor="date">Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent>
          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success!</AlertTitle>
              <AlertDescription className="text-green-600">
                Data successfully saved!
              </AlertDescription>
            </Alert>
          )}

          {showError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>
                {errorMessage || "An unexpected error occurred."}
              </AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="feed">Feed Usage</TabsTrigger>
              <TabsTrigger value="mortality">Mortality Rates</TabsTrigger>
              <TabsTrigger value="eggData">Egg Production</TabsTrigger>
              <TabsTrigger value="envoirments">Environment Control</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="mt-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="feedType">Feed Type</Label>
                    <Select
                      value={feedData.feedType}
                      onValueChange={(value) =>
                        setFeedData({ ...feedData, feedType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select feed type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Starter">Starter Feed</SelectItem>
                        <SelectItem value="Grower">Grower Feed</SelectItem>
                        <SelectItem value="Finisher">Finisher Feed</SelectItem>
                        <SelectItem value="Layer">Layer Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.01"
                      placeholder="Enter quantity"
                      value={feedData.quantity}
                      onChange={handleFeedChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeOfFeeding">Time of Feeding</Label>
                    <Input
                      id="timeOfFeeding"
                      name="timeOfFeeding"
                      type="time"
                      value={feedData.timeOfFeeding}
                      onChange={handleFeedChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Additional notes"
                      value={feedData.notes}
                      onChange={handleFeedChange}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 me-4 w-full md:w-auto" disabled={feedLoading}>
                  {feedLoading ? "Saving..." : "Save Feed Data"}
                </Button>
                <Button
                  variant="outline"
                  type="reset"
                  onClick={() => {
                    setFeedData({
                      feedType: "",
                      quantity: "",
                      timeOfFeeding: "",
                      notes: "",
                    });
                  }}
                  className="mt-6 w-full md:w-auto"
                >
                  Reset Form
                </Button>
                {/* <Button type="button" variant="ghost" className="mx-6 hover:bg-blue-50" onClick={() => setTableIsHidden(!TableIsHidden)}>
                  {TableIsHidden === true ? "Hide Table" : "Show Table ↓"}
                </Button> */}
              </form>
            </TabsContent>

            <TabsContent value="mortality" className="mt-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="count">Number of Deaths</Label>
                    <Input
                      id="count"
                      name="count"
                      type="number"
                      placeholder="Enter count"
                      value={mortalityData.count}
                      onChange={handleMortalityChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cause">Cause (if known)</Label>
                    <Select
                      value={mortalityData.cause}
                      onValueChange={(value) =>
                        setMortalityData({ ...mortalityData, cause: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cause" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disease">Disease</SelectItem>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="Predator">Predator</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location in Farm</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Enter location"
                      value={mortalityData.location}
                      onChange={handleMortalityChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Additional notes"
                      value={mortalityData.notes}
                      onChange={handleMortalityChange}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 me-4 w-full md:w-auto" disabled={mortalityLoading}>
                  {mortalityLoading ? "Saving..." : "Save Mortality Data"}
                </Button>
                <Button
                  variant="outline"
                  type="reset"
                  onClick={() => {
                    setMortalityData({
                      count: "",
                      cause: "",
                      location: "",
                      notes: "",
                    });
                  }}
                  className="mt-6 w-full md:w-auto"
                >
                  Reset Form
                </Button>
                {/* <Button type="button" variant="ghost" className="mx-6 hover:bg-blue-50" onClick={() => setTableIsHidden(!TableIsHidden)}>
                  {TableIsHidden === true ? "Hide Table" : "Show Table ↓"}
                </Button> */}
              </form>
            </TabsContent>

            <TabsContent value="eggData" className="mt-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalCount">Total Eggs Collected</Label>
                    <Input
                      id="totalCount"
                      name="totalCount"
                      type="number"
                      placeholder="Enter total count"
                      value={eggData.totalCount}
                      onChange={handleEggChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brokenCount">Broken/Damaged Eggs</Label>
                    <Input
                      id="brokenCount"
                      name="brokenCount"
                      type="number"
                      placeholder="Enter broken count"
                      value={eggData.brokenCount}
                      onChange={handleEggChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionTime">Collection Time</Label>
                    <Input
                      id="collectionTime"
                      name="collectionTime"
                      type="time"
                      value={eggData.collectionTime}
                      onChange={handleEggChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Additional notes"
                      value={eggData.notes}
                      onChange={handleEggChange}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 me-4 w-full md:w-auto" disabled={eggLoading}>
                  {eggLoading ? "Saving..." : "Save Egg Production Data"}
                </Button>
                <Button
                  variant="outline"
                  type="reset"
                  onClick={() => {
                    setEggData({
                      totalCount: "",
                      brokenCount: "",
                      collectionTime: "",
                      notes: "",
                    });
                  }}
                  className="mt-6 w-full md:w-auto"
                >
                  Reset Form
                </Button>
                {/* <Button type="button" variant="ghost" className="mx-6 hover:bg-blue-50" onClick={() => setTableIsHidden(!TableIsHidden)}>
                  {TableIsHidden === true ? "Hide Table" : "Show Table ↓"}
                </Button> */}
              </form>
            </TabsContent>

            <TabsContent value="envoirments" className="mt-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="temprature ">Set Temperature </Label>
                    <Input
                      id="temprature"
                      name="temprature"
                      type="number"
                      step="0.1"
                      placeholder="Set Temperature... "
                      value={envoirments.temprature}
                      onChange={hanndleEnvoirmentChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity</Label>
                    <Input
                      id="humidity"
                      name="humidity"
                      type="number"
                      step="0.1"
                      placeholder="Enter humidity"
                      value={envoirments.humidity}
                      onChange={hanndleEnvoirmentChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={envoirments.time}
                      onChange={hanndleEnvoirmentChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={envoirments.date}
                        onChange={hanndleEnvoirmentChange}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 me-4 w-full md:w-auto"
                  disabled={envLoading}
                >
                  {envLoading ? "Saving..." : "Save Temperature Settings"}
                </Button>
                <Button
                  variant="outline"
                  type="reset"
                  onClick={() => {
                    setEnvoirments({
                      temprature: "",
                      humidity: "",
                      time: "",
                      date: "",
                    });
                  }}
                  className="mt-6 w-full md:w-auto"
                >
                  Reset Form
                </Button>
                {/* <Button type="button" variant="ghost" className="mx-6 hover:bg-blue-50" onClick={() => setTableIsHidden(!TableIsHidden)}>
                  {TableIsHidden === true ? "Hide Table" : "Show Table ↓"}
                </Button> */}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        {TableIsHidden && (
          <CardFooter className="flex flex-col justify-between border-t pt-6">
            <CardTitle className=" text-center m-auto text-xl mb-6">
              {activeTab === "feed" && "Feed Usage History Details"}
              {activeTab === "mortality" && "Mortality Rate History Details"}
              {activeTab === "eggData" && "Egg Production History Details"}
              {activeTab === "envoirments" && "Environment Control History Details"}
            </CardTitle>
            <hr />
            <TableCrud
              itemsPerPage={5}
              col={getTableColumns()}
              data={getTableData()}
              action={true}
              Pagination={true}
              onUpdate={handleTableUpdate}
              onDelete={handleTableDelete}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default DataEntryForm;