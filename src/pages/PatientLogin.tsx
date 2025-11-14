import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Activity, Loader2 } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function PatientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const result = loginSchema.safeParse({ email, password });
      
      if (!result.success) {
        toast.error(result.error.issues[0].message);
        setLoading(false);
        return;
      }

      // Make API call using Axios
      const response = await axios.post('http://localhost:7777/login/patient', {
        email: result.data.email,
        password: result.data.password,
      });
      console.log("Login Response",response)

      // Store token if returned
      // if (response.data.token) {
      //   localStorage.setItem('authToken', response.data.token);
      // }

      toast.success("Logged in successfully");
      navigate("/patient");
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        toast.error(error.response.data.message || "Invalid credentials");
      } else if (error.request) {
        // Request made but no response
        toast.error("Unable to connect to server");
      } else {
        // Other errors
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-medical-light to-background p-4">
      <Card className="w-full max-w-md animate-scale-in border-2 border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-full">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Patient Login</CardTitle>
          <CardDescription>Sign in to access your health dashboard</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup-patient" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
