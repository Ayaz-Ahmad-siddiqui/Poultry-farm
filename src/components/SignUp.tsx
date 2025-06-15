import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useAppSelector, useAppDispatch } from "../redux/Hooks/Hooks";
import { signupUser, clearSignUpError, resetSignUpState } from "../redux/slices/signUp/signUpSlice"; // Import new actions
import { toast } from "./ui/use-toast";

const SignUp = () => {
  // Redux state
  const { loading, error, success } = useAppSelector((state) => state.signUp);
  const dispatch = useAppDispatch();

  // Local component state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null); // For client-side validation

  const navigate = useNavigate();

  // Carousel setup (no changes)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    { image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&q=80", title: "Modern Farm Management", description: "Track and analyze your farm data with our intuitive dashboard", },
    { image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80", title: "Real-time Monitoring", description: "Monitor environmental conditions and receive instant alerts", },
    { image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80", title: "Comprehensive Reporting", description: "Generate detailed reports to optimize your farm operations", },
  ];

  // Auto-scroll carousel (no changes)
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => { setCurrentSlide(emblaApi.selectedScrollSnap()); };
    emblaApi.on("select", onSelect);
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) { emblaApi.scrollNext(); } else { emblaApi.scrollTo(0); }
    }, 5000);
    return () => { emblaApi.off("select", onSelect); clearInterval(autoplay); };
  }, [emblaApi]);

  // Effect to handle Redux errors and form errors
  useEffect(() => {
    if (error && (username || email || password)) {
      dispatch(clearSignUpError()); // Clear Redux API error
    }
    if (formError && (username || email || password)) {
      setFormError(null); // Clear local form error
    }
  }, [username, email, password, error, formError, dispatch]);

  // Effect to navigate on successful signup
 useEffect(() => {
  if (success) {
    toast({
      title: "Signup Successful",
      description: "You have successfully signed up. Redirecting to login...",
      duration: 2000,
      variant: "success", 
    });

    dispatch(resetSignUpState());
    navigate("/login", { replace: true });
  }
}, [success, navigate, dispatch]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

   
    dispatch(clearSignUpError());
    setFormError(null); 

  
    if (!username.trim() || !email.trim() || !password.trim()) {
      setFormError("All fields are required.");
      return;
    }

     if (password.length < 6) {
    toast({
      title: "Password Too Short",
      description: "Password must be at least 6 characters long.",
      variant: "destructive",
      duration: 3000,
    });
    return;
  }

    try {
      const resultAction = await dispatch(signupUser({ name: username.trim(), email: email.trim(), password: password.trim() }));

      if (signupUser.rejected.match(resultAction)) {
        console.error("Signup failed:", resultAction.payload);
       
      }
    } catch (err: any) {
      console.error("An unexpected error occurred during signup dispatch:", err);
      setFormError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - SignUp Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <img src="/vite.svg" alt="Farm Logo" className="h-10 w-10 mr-3" />
              <h1 className="text-2xl font-bold">Green Valley Poultry</h1>
            </div>
            <h2 className="text-3xl font-bold">Welcome!</h2>
            <p className="text-muted-foreground mt-2">
              Sign Up to access your farm management dashboard
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="bg-white/80"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your Email"
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
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password" // {/* Changed for signup */}
                    className="bg-white/80"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>

              <div className="mt-6 text-sm text-center text-muted-foreground">
                <p>Already have an Account</p>
                <p>
                  <strong className="text-green-600"><Link to="/login"> Login Now!</Link></strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Carousel */}
      <div className="hidden md:block w-1/2 bg-navy relative overflow-hidden h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-navy/40 z-10"></div>

        {/* Carousel container */}
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

        {/* Navigation buttons */}
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

        {/* Dots indicator */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/40"}`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUp;