import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PenTool, 
  Bot, 
  Palette, 
  Download, 
  Users, 
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-booksmith.jpg";

const Landing = () => {
  const features = [
    {
      icon: Bot,
      title: "AI Writing Assistant",
      description: "Get intelligent suggestions, continue your story, and overcome writer's block with our advanced AI companion."
    },
    {
      icon: PenTool,
      title: "Rich Text Editor",
      description: "Write with a distraction-free editor designed specifically for authors, with chapters, notes, and version control."
    },
    {
      icon: Users,
      title: "Character Development",
      description: "Create detailed character profiles, track relationships, and maintain consistency throughout your story."
    },
    {
      icon: Globe,
      title: "Worldbuilding Tools",
      description: "Build rich, immersive worlds with maps, cultures, and lore that readers will remember."
    },
    {
      icon: Palette,
      title: "Cover Generation",
      description: "Create stunning book covers with AI-powered design tools and professional templates."
    },
    {
      icon: Download,
      title: "Export & Publish",
      description: "Export to PDF, ePub, or publish directly to major platforms with one click."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Write",
      description: "Start with our AI-assisted editor and bring your story to life"
    },
    {
      number: "02", 
      title: "Design",
      description: "Create characters, build worlds, and design your perfect cover"
    },
    {
      number: "03",
      title: "Publish",
      description: "Export your masterpiece and share it with the world"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-glow/80" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent-foreground mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Writing Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
                Forge your book,{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  one page at a time
                </span>
              </h1>
              
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl">
                The complete writing platform that combines AI assistance, 
                rich editing tools, and professional publishing features to help 
                you write, design, and publish your masterpiece.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild className="shadow-glow">
                  <Link to="/auth/register">
                    Start Writing Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="#features">
                    See Features
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="The Booksmith writing platform interface" 
                className="w-full rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Simple Steps to Your Published Book
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From first draft to published masterpiece, we guide you through every step
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <Card key={step.number} className="text-center border-0 shadow-soft bg-gradient-card">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-primary mb-4">{step.number}</div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Write & Publish
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools designed specifically for authors and storytellers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="group hover:shadow-elegant transition-all duration-300 border-0 bg-gradient-card">
                  <CardContent className="p-6">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-glow/80" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Writing Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of authors who have chosen The Booksmith to bring their stories to life
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="shadow-glow">
              <Link to="/auth/register">
                Start Writing Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Export anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;