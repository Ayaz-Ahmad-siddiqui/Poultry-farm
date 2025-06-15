import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import TableCrud from "../ui/TableCrud";
import {
  updateEggProduction,
  fetchEggProductions,
  deleteEggProduction,
  clearEggProductionStatus,
} from "@/redux/slices/dataEntry/eggProductionSlice";
import {
  updateMortalityRate,
  fetchMortalityRates,
  deleteMortalityRate,
  clearMortalityRateStatus,
} from "@/redux/slices/dataEntry/mortalityRateSlice";
import {
  updateFeedUsage,
  fetchFeedUsages,
  deleteFeedUsage,
  clearFeedUsageStatus,
} from "@/redux/slices/dataEntry/feedUsageSlice";
import {
  updateEnvironment,
  fetchEnvironments,
  deleteEnvironment,
  clearEnvironmentStatus,
} from "@/redux/slices/dataEntry/environmentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/Hooks/Hooks";

const Records = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const dispatch = useAppDispatch();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    } else if (activeTab === "egg") {
      dispatch(fetchEggProductions());
    } else if (activeTab === "environment") {
      dispatch(fetchEnvironments());
    }
  }, [activeTab, dispatch]);

  const TabsName = [
    { id: "feed", name: "Feed Usage" },
    { id: "mortality", name: "Mortality Rate" },
    { id: "egg", name: "Egg Production" },
    { id: "environment", name: "Environment Control" },
  ];

const editableDropdowns={
  "Feed Type": [
    { label: "Starter Feed", value: "Starter" },
    { label: "Grower Feed", value: "Grower" },
    { label: "Finisher Feed", value: "Finisher" },
    { label: "Layer Feed", value: "Layer" },
  ],
  "Cause of Death": [
    { label: "Disease", value: "disease" },
    { label: "Injury", value: "injury" },
    { label: "Predator", value: "predator" },
    { label: "Unknown", value: "unknown" }
  ]
}

  const { feedUsages } = useAppSelector((state) => state.feedUsage);

  const { eggProductions } = useAppSelector((state) => state.eggProduction);

  const { mortalityRates } = useAppSelector((state) => state.mortalityRate);

  const { environments } = useAppSelector((state) => state.environment);

  const getTableData = () => {
    switch (activeTab) {
      case "feed":
        return feedUsages.map((item) => ({
          id: item.id.toString(),
          "Feed Type": item.feed_type,
          "Quantity (kg)": item.qty,
          "Time of Feeding": item.time_of_feeding,
          Date: item.feed_date,
          Notes: item.notes || "-",
        }));
      case "mortality":
        return mortalityRates.map((item) => ({
          id: item.id.toString(),
          "Number of Deaths": item.no_of_deaths,
          "Cause of Death": item.cause_of_death,
          Location: item.location_farm || "-",
          Date: item.mortality_date,
        }));
      case "egg":
        return eggProductions.map((item) => ({
          id: item.id.toString(),
          "Total Eggs": item.total_eggs,
          "Broken Eggs": item.broken_eggs,
          "Collection Time": item.collection_time,
          Date: item.collection_date,
          Notes: item.notes || "-",
        }));
      case "environment":
        return environments.map((item) => ({
          id: item.id.toString(),
          Temperature: item.temperature,
          Humidity: item.humidity,
          Time: item.collection_time,
          Date: item.collection_date,
        }));
      default:
        return [];
    }
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case "feed":
        return [
          "Feed Type",
          "Quantity (kg)",
          "Time of Feeding",
          "Date",
          "Notes",
        ];
      case "mortality":
        return ["Number of Deaths", "Cause of Death", "Location", "Date"];
      case "egg":
        return [
          "Total Eggs",
          "Broken Eggs",
          "Collection Time",
          "Date",
          "Notes",
        ];
      case "environment":
        return ["Temperature", "Humidity", "Time", "Date"];
      default:
        return [];
    }
  };

  const handleTableUpdate = (id: string, updatedData: Record<string, any>) => {
    const numericId = parseInt(id);

    const commonSuccessHandler = (fetchAction: any) => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      dispatch(fetchAction());
    };

    const commonErrorHandler = (message: string) => {
      setShowError(true);
      setErrorMessage(message);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
      }, 5000);
    };

    try {
      if (activeTab === "feed") {
        const data = {
          feed_date: updatedData["Date"],
          feed_type: updatedData["Feed Type"],
          qty: parseFloat(updatedData["Quantity (kg)"]),
          time_of_feeding: updatedData["Time of Feeding"],
          notes:
            updatedData["Notes"] === "-" ? undefined : updatedData["Notes"],
        };
        dispatch(updateFeedUsage({ id: numericId, feedData: data }))
          .then(() => commonSuccessHandler(fetchFeedUsages()))
          .catch(() => commonErrorHandler("Failed to update feed usage."));
      } else if (activeTab === "mortality") {
        const data = {
          mortality_date: updatedData["Date"],
          no_of_deaths: parseInt(updatedData["Number of Deaths"]),
          cause_of_death: updatedData["Cause of Death"],
          location_farm: updatedData["Location"],
          notes:
            updatedData["Notes"] === "-" ? undefined : updatedData["Notes"],
        };
        dispatch(updateMortalityRate({ id: numericId, mortalityData: data }))
          .then(() => commonSuccessHandler(fetchMortalityRates()))
          .catch(() => commonErrorHandler("Failed to update mortality rate."));
      } else if (activeTab === "egg") {
        const data = {
          collection_date: updatedData["Date"],
          total_eggs: parseInt(updatedData["Total Eggs"]),
          broken_eggs: parseInt(updatedData["Broken Eggs"]),
          collection_time: updatedData["Collection Time"],
          notes:
            updatedData["Notes"] === "-" ? undefined : updatedData["Notes"],
        };
        dispatch(updateEggProduction({ id: numericId, eggData: data }))
          .then(() => commonSuccessHandler(fetchEggProductions()))
          .catch(() => commonErrorHandler("Failed to update egg production."));
      } else if (activeTab === "environment") {
        const data = {
          collection_date: updatedData["Date"],
          temperature: parseFloat(updatedData["Temperature"]),
          humidity: parseFloat(updatedData["Humidity"]),
          collection_time: updatedData["Time"],
        };
        dispatch(updateEnvironment({ id: numericId, envData: data }))
          .then(() => commonSuccessHandler(fetchEnvironments()))
          .catch(() =>
            commonErrorHandler("Failed to update environment data.")
          );
      }
    } catch (error: any) {
      commonErrorHandler("Unexpected error occurred.");
    }
  };

  const handleTableDelete = (id: string) => {
    const numericId = parseInt(id);
    const commonSuccessHandler = (fetchAction: any) => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      dispatch(fetchAction());
    };

    const commonErrorHandler = (message: string) => {
      setShowError(true);
      setErrorMessage(message);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
      }, 5000);
    };

    try {
      if (activeTab === "feed") {
        dispatch(deleteFeedUsage(numericId))
          .then(() => commonSuccessHandler(fetchFeedUsages()))
          .catch(() => commonErrorHandler("Failed to delete feed usage."));
      } else if (activeTab === "mortality") {
        dispatch(deleteMortalityRate(numericId))
          .then(() => commonSuccessHandler(fetchMortalityRates()))
          .catch(() => commonErrorHandler("Failed to delete mortality rate."));
      } else if (activeTab === "egg") {
        dispatch(deleteEggProduction(numericId))
          .then(() => commonSuccessHandler(fetchEggProductions()))
          .catch(() => commonErrorHandler("Failed to delete egg production."));
      } else if (activeTab === "environment") {
        dispatch(deleteEnvironment(numericId))
          .then(() => commonSuccessHandler(fetchEnvironments()))
          .catch(() =>
            commonErrorHandler("Failed to delete environment data.")
          );
      }
    } catch {
      commonErrorHandler("Unexpected error occurred.");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Your All Records Saved Here.</h1>
      <p className="mb-3">Switch Tabs To Explore Relevant Data</p>

      <Tabs
        defaultValue="feed"
        className="w-full mt-5"
        onValueChange={setActiveTab}
      >
        <TabsList>
          {TabsName.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {TabsName.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="p-4 w-full">
              <TableCrud
                itemsPerPage={5}
                col={getTableColumns()}
                data={getTableData()}
                action={true}
                Pagination={true}
                onUpdate={handleTableUpdate}
                onDelete={handleTableDelete}
               editableDropdowns={editableDropdowns}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Records;
