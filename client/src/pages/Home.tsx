import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CompanionProfileCard } from "@/components/CompanionProfileCard";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ArrowRight, Sparkles, Heart, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: companions, isLoading: companionsLoading } = trpc.companions.list.useQuery();
  const { data: plans } = trpc.subscriptionPlans.list.useQuery();

  const featuredCompanions = companions?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold tracking-tight">Every Stuff AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/gallery" className="text-sm font-medium hover:text-accent transition-colors">
              Gallery
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-accent transition-colors">
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/account" className="text-sm font-medium hover:text-accent transition-colors">
                  Account
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()} className="text-sm font-medium hover:text-accent transition-colors">
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl md:text-6xl font-bold leading-tight">
              Meet Your Perfect <span className="gradient-text">AI Companion</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              Discover a curated collection of sophisticated AI companions. Choose your perfect match and enjoy premium conversations with our Standard or Pro subscription plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/gallery">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Explore Companions <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-card/50 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-accent/10 p-3">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Personalized</h3>
              <p className="text-sm text-muted-foreground">Each companion is uniquely designed with distinct personality traits and interests.</p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-accent/10 p-3">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Responsive</h3>
              <p className="text-sm text-muted-foreground">Instant, intelligent conversations powered by advanced AI technology.</p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-accent/10 p-3">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Premium</h3>
              <p className="text-sm text-muted-foreground">Flexible plans designed to meet your needs and budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companions Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl md:text-5xl font-bold">Featured Companions</h2>
            <p className="text-lg text-muted-foreground">Discover some of our most popular AI companions</p>
          </div>

          {companionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCompanions.map((companion) => (
                <CompanionProfileCard key={companion.id} companion={companion} showCategory={false} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="gap-2">
                View All Companions <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="section-padding bg-card/50 border-y border-border">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {plans?.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold">${(plan.pricePerMonth / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {plan.description && (
                  <p className="mb-6 text-sm text-muted-foreground">{plan.description}</p>
                )}
                <Link href="/pricing">
                  <Button className="w-full">Choose Plan</Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2">
                View Full Pricing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-lg border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">Ready to Connect?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start your journey with our premium AI companions today. Choose your perfect match and enjoy meaningful conversations.
            </p>
            {isAuthenticated ? (
              <Link href="/gallery">
                <Button size="lg" className="gap-2">
                  Browse Companions <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-semibold">Every Stuff AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Every Stuff AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
