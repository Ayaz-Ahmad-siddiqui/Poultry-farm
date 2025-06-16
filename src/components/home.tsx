import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Profile from "@/components/Profile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LinearProgress from "@mui/material/LinearProgress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import KeyMetricsPanel from "./dashboard/KeyMetricsPanel";
import DataEntryForm from "./dashboard/DataEntryForm";
import EnvironmentalMonitor from "./dashboard/EnvironmentalMonitor";
import ReportGenerator from "./dashboard/ReportGenerator";
import { logout } from "../redux/slices/login/loginSlice";
import { toast } from "./ui/use-toast";
import Records from "./dashboard/Records";
import { useAppDispatch, useAppSelector } from "../redux/Hooks/Hooks";

// Redux
import { fetchUserProfile } from "../redux/slices/profile/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Setting from "./dashboard/Setting";

interface HomeProps {
  initialTab?: string;
}

const Home = ({ initialTab = "dashboard" }: HomeProps) => {
  const dateRangeRef = useRef(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
  });
  const [showDateRange, setShowDateRange] = useState(false);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: "selection",
    },
  ]);

  const navigate = useNavigate();
  const { logout: logoutAction } = useAuth();

  // Redux state for profile
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error, updateSuccess, passwordChangeSuccess } =
    useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        name: profile.name || "",
      });
    }
  }, [profile]);

  const handleLogout = () => {
    const { id, dismiss } = toast({
      title: "Confirm Logout",
      description: "Are you sure you want to log out?",
      action: (
        <div className="flex gap-2 mt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              dispatch(logout());
              navigate("/login", { replace: true });
              dismiss(); // Close the toast on success
            }}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dismiss(); // Just close the toast
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  // Check if screen is mobile on initial render and when window resizes

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

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

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Navigation Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden absolute top-4 left-4 z-30"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar Sheet - Only for very small screens */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hidden absolute top-4 left-4 z-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-navy">
          <div className="flex flex-col p-4">
            <div className="flex items-center gap-2 mb-8">
              <img src="/vite.svg" alt="Farm Logo" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-white">Poultry Farm</h1>
            </div>
            <nav className="flex flex-col gap-1">
              <NavItem
                id="dashboard"
                label="Dashboard"
                icon={<HomeIcon />}
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
                sidebarCollapsed={false}
              />
              <NavItem
                id="data-entry"
                label="Data Entry"
                icon={<DataIcon />}
                active={activeTab === "data-entry"}
                onClick={() => setActiveTab("data-entry")}
                sidebarCollapsed={false}
              />
              <NavItem
                id="data-records"
                label="Data Records"
                icon={<RecordsIcon />}
                active={activeTab === "data-records"}
                onClick={() => setActiveTab("data-records")}
                sidebarCollapsed={false}
              />
              <NavItem
                id="environment"
                label="Environment"
                icon={<EnvironmentIcon />}
                active={activeTab === "environment"}
                onClick={() => setActiveTab("environment")}
                sidebarCollapsed={false}
              />
              <NavItem
                id="reports"
                label="Reports"
                icon={<ReportIcon />}
                active={activeTab === "reports"}
                onClick={() => setActiveTab("reports")}
                sidebarCollapsed={false}
              />
              <NavItem
                id="settings"
                label="Settings"
                icon={<Settings className="h-5 w-5" />}
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                sidebarCollapsed={false}
              />
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed md:relative h-full z-20 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-64"
        } border-r bg-navy shadow-md ${
          isMobile && !sidebarCollapsed
            ? "translate-x-0"
            : isMobile
            ? "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 mb-8 p-4">
          <img src="/vite.svg" alt="Farm Logo" className="h-8 w-8" />
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-white">Poultry Farm</h1>
          )}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-10 bg-navy-light text-white rounded-full p-1 shadow-md border border-navy-light hidden md:block"
        >
          {sidebarCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          )}
        </button>
        <nav className="flex flex-col gap-1 p-2">
          <NavItem
            id="dashboard"
            label="Dashboard"
            icon={<HomeIcon />}
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            sidebarCollapsed={sidebarCollapsed}
          />
          <NavItem
            id="data-entry"
            label="Data Entry"
            icon={<DataIcon />}
            active={activeTab === "data-entry"}
            onClick={() => setActiveTab("data-entry")}
            sidebarCollapsed={sidebarCollapsed}
          />
          <NavItem
            id="data-records"
            label="Data Records"
            icon={<RecordsIcon />}
            active={activeTab === "data-records"}
            onClick={() => setActiveTab("data-records")}
            sidebarCollapsed={sidebarCollapsed}
          />
          <NavItem
            id="environment"
            label="Environment"
            icon={<EnvironmentIcon />}
            active={activeTab === "environment"}
            onClick={() => setActiveTab("environment")}
            sidebarCollapsed={sidebarCollapsed}
          />
          <NavItem
            id="reports"
            label="Reports"
            icon={<ReportIcon />}
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            sidebarCollapsed={sidebarCollapsed}
          />
          <NavItem
            id="settings"
            label="Settings"
            icon={<Settings className="h-5 w-5" />}
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            sidebarCollapsed={sidebarCollapsed}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 w-full`}
      >
        {/* Header */}
        <header className="h-16 border-b border-primary/20 flex items-center justify-between px-4 md:px-6">
          <h2 className="text-lg font-medium">Green Valley Poultry Farm</h2>
          <div className="flex items-center gap-4">
            {/* <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        personalInfo?.name.split(" ").slice(0, 2).join(" ") ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=farmer"
                      }
                      alt={personalInfo.name || "User"}
                    />
                    <AvatarFallback>
                      {(
                        personalInfo?.name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("") || "JD"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">
                    {personalInfo?.name.split(" ").slice(0, 2).join(" ") ||
                      "Loading..."}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab("profile");
                    navigate("/profile");
                  }}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  Farm Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex gap-2">
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
              <KeyMetricsPanel />
            </div>
          )}

          {activeTab === "data-entry" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Data Entry</h1>
              <Card>
                <CardContent className="pt-6">
                  <DataEntryForm />
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === "data-records" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">All Records</h1>
              <Card>
                <CardContent className="pt-6">
                  <Records />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "environment" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Environmental Monitoring</h1>
              <Card>
                <CardContent className="pt-6">
                  <EnvironmentalMonitor />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Reports</h1>
              <Card>
                <CardContent className="pt-6">
                  <ReportGenerator />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && <Profile />}

          {activeTab === "settings" && <Setting />}
        </div>
      </main>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ id, label, icon, active, onClick, sidebarCollapsed }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`justify-${sidebarCollapsed ? "center" : "start"} w-full ${
        active ? "font-medium" : ""
      } text-white hover:text-blue-500 hover:bg-white relative`}
      onClick={onClick}
      title={sidebarCollapsed ? label : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={sidebarCollapsed ? "" : "mr-2"}>{icon}</span>
      {!sidebarCollapsed && <span>{label}</span>}
      {sidebarCollapsed && isHovered && (
        <span className="absolute left-14 bg-navy-light px-2 py-1 rounded whitespace-nowrap z-50 transition-opacity duration-200">
          {label}
        </span>
      )}
    </Button>
  );
};

// Icon Components
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const DataIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);
const RecordsIcon = () => <ChecklistIcon />;

const EnvironmentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
    <path d="M12 3v2"></path>
    <path d="M12 19v2"></path>
    <path d="M4.22 5.64l1.41 1.41"></path>
    <path d="M18.36 19.78l1.41 1.41"></path>
    <path d="M3 12h2"></path>
    <path d="M19 12h2"></path>
    <path d="M4.22 18.36l1.41-1.41"></path>
    <path d="M18.36 4.22l1.41-1.41"></path>
  </svg>
);

const ReportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
);

const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default Home;
function logoutUser(): any {
  throw new Error("Function not implemented.");
}
