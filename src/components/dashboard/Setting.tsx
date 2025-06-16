import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import {
  createSettings,
  updateSettings,
  selectSettings,
  selectSettingsLoading,
  selectSettingsError,
  resetSettingsState,
  fetchSettings,
} from "../../redux/slices/settings/SettingsSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { toast } from "../ui/use-toast";

const DEFAULT_FORM = {
  farmName: "",
  farmLocation: "",
  farmSize: 0,
  noOfBirds: 0,
  emailNotification: false,
  smsNotification: false,
  pushNotification: false,
  measuringUnit: "Metric",
  dataRetentionPeriod: "6 Month",
};

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);

  // Local form state
  const [form, setForm] = useState(DEFAULT_FORM);

  // Track last action result
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
   

    // Always load settingsData from localStorage on mount
    const settingsData = localStorage.getItem("settingsData");
    if (settingsData) {
      const parsed = JSON.parse(settingsData);
      // Hydrate Redux (if you want)
      dispatch({
        type: "settings/hydrate",
        payload: parsed,
      });
      // Hydrate form state directly
      setForm({
        farmName: parsed.farmName || "",
        farmLocation: parsed.farmLocation || "",
        farmSize: parsed.farmSize || 0,
        noOfBirds: parsed.noOfBirds || 0,
        emailNotification: parsed.emailNotification ?? false,
        smsNotification: parsed.smsNotification ?? false,
        pushNotification: parsed.pushNotification ?? false,
        measuringUnit: parsed.measuringUnit || "Metric",
        dataRetentionPeriod: parsed.dataRetentionPeriod || "6 Month",
      });
    }
  }, [dispatch]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSwitch = (id: string, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelect = (id: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleReset = () => {
    if (settings) {
      setForm({
        farmName: settings.farmName || "",
        farmLocation: settings.farmLocation || "",
        farmSize: settings.farmSize || 0,
        noOfBirds: settings.noOfBirds || 0,
        emailNotification: settings.emailNotification ?? false,
        smsNotification: settings.smsNotification ?? false,
        pushNotification: settings.pushNotification ?? false,
        measuringUnit: settings.measuringUnit || "Metric",
        dataRetentionPeriod: settings.dataRetentionPeriod || "6 Month",
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    dispatch(resetSettingsState());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let action;
    // Only create if there is no id in localStorage and no settings in Redux
    const storedId = localStorage.getItem("settingsId");
    if ((settings && settings.id) || storedId) {
      // Use id from Redux or localStorage
      const id = settings?.id || Number(storedId);
      action = updateSettings({ ...form, id });
    } else {
      action = createSettings(form);
    }
    const resultAction = await dispatch(action);
    setLastResult(resultAction);

    if (resultAction.type.endsWith("/fulfilled")) {
      toast({
        title: "Success",
        description: "Settings saved successfully.",
        variant: "success",
      });
      // Save full settings object to localStorage
      if (resultAction.payload) {
        localStorage.setItem("settingsData", JSON.stringify(resultAction.payload));
      }
      // If created, store id in localStorage and update Redux
      if (!storedId && resultAction.payload?.id) {
        localStorage.setItem("settingsId", resultAction.payload.id.toString());
        dispatch(fetchSettings(resultAction.payload.id));
      }
    } else if (resultAction.type.endsWith("/rejected")) {
      toast({
        title: "Error",
        description:
          (resultAction.payload && Array.isArray(resultAction.payload)
            ? resultAction.payload[0]
            : resultAction.payload) || "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  // Optionally, log status changes
  useEffect(() => {
    if (lastResult) {
      console.log("Last result status:", lastResult.type);
      if (lastResult.payload) {
        console.log("Returned data:", lastResult.payload);
      }
      if (lastResult.error) {
        console.log("Error:", lastResult.error);
      }
    }
  }, [lastResult]);

  // Error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardContent className="pt-6 ">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Farm Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Farm Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      value={form.farmName}
                      onChange={handleChange}
                      placeholder="Enter farm name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmLocation">Farm Location</Label>
                    <Input
                      id="farmLocation"
                      value={form.farmLocation}
                      onChange={handleChange}
                      placeholder="Enter farm location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (sq. meters)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      value={form.farmSize}
                      onChange={handleChange}
                      placeholder="Enter farm size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noOfBirds">Number of Birds</Label>
                    <Input
                      id="noOfBirds"
                      type="number"
                      value={form.noOfBirds}
                      onChange={handleChange}
                      placeholder="Enter bird count"
                    />
                  </div>
                </div>
              </div>

              {/* Alert Preferences */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Alert Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotification" className="mb-1 block">
                        Email Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotification"
                      checked={form.emailNotification}
                      onCheckedChange={(v) =>
                        handleSwitch("emailNotification", v)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotification" className="mb-1 block">
                        SMS Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotification"
                      checked={form.smsNotification}
                      onCheckedChange={(v) =>
                        handleSwitch("smsNotification", v)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotification" className="mb-1 block">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via push notifications
                      </p>
                    </div>
                    <Switch
                      id="pushNotification"
                      checked={form.pushNotification}
                      onCheckedChange={(v) =>
                        handleSwitch("pushNotification", v)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">System Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="measuringUnit">Measurement Units</Label>
                    <Select
                      value={form.measuringUnit}
                      onValueChange={(v) => handleSelect("measuringUnit", v)}
                    >
                      <SelectTrigger id="measuringUnit">
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Metric">Metric (°C, kg)</SelectItem>
                        <SelectItem value="Imperial">
                          Imperial (°F, lb)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataRetentionPeriod">
                      Data Retention Period
                    </Label>
                    <Select
                      value={form.dataRetentionPeriod}
                      onValueChange={(v) =>
                        handleSelect("dataRetentionPeriod", v)
                      }
                    >
                      <SelectTrigger id="dataRetentionPeriod">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3 Month">3 Months</SelectItem>
                        <SelectItem value="6 Month">6 Months</SelectItem>
                        <SelectItem value="1 Year">1 Year</SelectItem>
                        <SelectItem value="Forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm pt-2">{error}</div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
