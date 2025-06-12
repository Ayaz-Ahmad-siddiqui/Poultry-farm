import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext"; // Removed if not used
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
// import { Dialog } from "@radix-ui/react-dialog";
// import ForgetPassword from "./ForgetPassword";
import { useAppSelector, useAppDispatch } from "../redux/Hooks/Hooks";
import { loginUser, clearError } from "../redux/slices/login/loginSlice";
import { toast } from "./ui/use-toast";

const Login = () => {
  // Redux state (API errors come from here)
  const { loading, error, isAuthenticated, token } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  // Local component state (for client-side validation errors)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Router
  const navigate = useNavigate();

  // Carousel setup (no changes)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&q=80",
      title: "Modern Farm Management",
      description:
        "Track and analyze your farm data with our intuitive dashboard",
    },
    {
      image:
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80",
      title: "Real-time Monitoring",
      description:
        "Monitor environmental conditions and receive instant alerts",
    },
    {
      image:
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
      title: "Comprehensive Reporting",
      description: "Generate detailed reports to optimize your farm operations",
    },
  ];

  // Auto-scroll carousel (no changes)
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi]);

  // Clear errors when user starts typing (UPDATED)
  useEffect(() => {
    if (error && (email || password)) {
      dispatch(clearError()); // Clear Redux API error
    }
    if (formError && (email || password)) {
      // NEW: Clear local form error
      setFormError(null);
    }
  }, [email, password, error, dispatch, formError]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Login successful, navigating to dashboard.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(clearError());
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    try {
      const resultAction = await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        toast({
          title: "Login successful",
          description: "Welcome back to your dashboard!",
        duration: 2000,
          variant: "success",
        });
      } else if (loginUser.rejected.match(resultAction)) {
        const errorMessage =
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Invalid credentials.";

        toast({
          title: "Login failed",
          description: errorMessage,
          duration: 2000,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        duration: 2000,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <img src="/vite.svg" alt="Farm Logo" className="h-10 w-10 mr-3" />
              <h1 className="text-2xl font-bold">Green Valley Poultry</h1>
            </div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your farm management dashboard
            </p>
          </div>

          <Card className="w-full border-none shadow-none">
            <CardContent>
              {/* Display the Alert if either Redux API error OR local form error exists */}
              {(error || formError) && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  {/* Display Redux error if it exists, otherwise display local form error */}
                  <AlertDescription>{error || formError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-white/80"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {/* <ForgetPassword/> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-white/80"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-sm text-center text-muted-foreground">
                <p>Don't have any Account? </p>
                <p>
                  <strong className="text-green-600">
                    <Link to="/signup">Create One.</Link>
                  </strong>
                </p>
              </div>
              <div className="mt-6 text-sm text-center text-muted-foreground">
                <p>Demo credentials:</p>
                <p>
                  Username: <strong>admin</strong>, Password:{" "}
                  <strong>password</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Carousel (no changes) */}
      <div className="hidden md:block w-1/2 bg-navy relative overflow-hidden h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-navy/40 z-10"></div>
        <div className="h-full w-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {carouselSlides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] h-full relative">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-10 z-20 text-white">
                  <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-lg opacity-90">{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 right-6 flex space-x-2 z-20">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-white" : "bg-white/40"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
