import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Brain, MessageSquare, TrendingUp, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FieveAI
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/signin-patient">
              <Button variant="outline">Patient Login</Button>
            </Link>
            <Link to="/signin-clinician">
              <Button variant="outline">Clinician Login</Button>
            </Link>
            
            <Link to="/patient">
              <Button variant="outline">Patient App</Button>
            </Link>
            <Link to="/clinician">
              <Button className="bg-gradient-primary">Clinician Dashboard</Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-20 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Intelligent Remote Fever
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Monitoring & Analytics
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empowering patients and clinicians with AI-driven real-time fever tracking,
            predictive analytics, and automated follow-ups—improving outcomes and easing
            healthcare burdens.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/patient">
              <Button size="lg" className="bg-gradient-primary hover-lift">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="hover-lift">
              Watch Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Healthcare Platform</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover-lift animate-scale-in border-2 border-border">
            <Activity className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
            <p className="text-muted-foreground">
              Seamless IoT thermometer integration with continuous temperature tracking and
              automated data sync.
            </p>
          </Card>

          <Card className="p-6 hover-lift animate-scale-in border-2 border-border" style={{ animationDelay: '0.1s' }}>
            <Brain className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">AI-Powered Predictions</h3>
            <p className="text-muted-foreground">
              LSTM models analyze fever trends and predict risk patterns for timely
              intervention.
            </p>
          </Card>

          <Card className="p-6 hover-lift animate-scale-in border-2 border-border" style={{ animationDelay: '0.2s' }}>
            <MessageSquare className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Multilingual Chatbot</h3>
            <p className="text-muted-foreground">
              BERT-powered conversational AI conducts symptom checks in English, Hindi, and
              Kannada.
            </p>
          </Card>

          <Card className="p-6 hover-lift animate-scale-in border-2 border-border" style={{ animationDelay: '0.3s' }}>
            <Bell className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Intelligent Alerts</h3>
            <p className="text-muted-foreground">
              Automated notifications for persistent fevers with priority-based escalation to
              clinicians.
            </p>
          </Card>

          <Card className="p-6 hover-lift animate-scale-in border-2 border-border" style={{ animationDelay: '0.4s' }}>
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Clinician Dashboard</h3>
            <p className="text-muted-foreground">
              Comprehensive patient analytics, outbreak heatmaps, and risk stratification
              tools.
            </p>
          </Card>

          <Card className="p-6 hover-lift animate-scale-in border-2 border-border" style={{ animationDelay: '0.5s' }}>
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Predictive Analytics</h3>
            <p className="text-muted-foreground">
              Advanced forecasting for public health surveillance and outbreak detection.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-primary text-primary-foreground py-16 my-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-bounce-in">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-foreground/80">Early Detection Rate</div>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold mb-2">48hrs</div>
              <div className="text-primary-foreground/80">Faster Intervention</div>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold mb-2">3x</div>
              <div className="text-primary-foreground/80">Better Adherence</div>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-primary-foreground/80">Patients Monitored</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="p-12 max-w-3xl mx-auto border-2 border-primary/20 animate-glow">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Fever Care?</h2>
          <p className="text-muted-foreground mb-8">
            Join healthcare providers using FieveAI to improve patient outcomes and reduce
            hospital burdens.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/patient">
              <Button size="lg" className="bg-gradient-primary">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FieveAI. Built for MICRO LABS HACKATHON 2025.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
