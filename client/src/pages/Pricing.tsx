import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ArrowLeft, Check, X, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { data: plans, isLoading } = trpc.subscriptionPlans.list.useQuery();

  const standardPlan = plans?.find(p => p.name === "Standard");
  const proPlan = plans?.find(p => p.name === "Pro");

  const features = [
    { name: "AI Companions Access", standard: true, pro: true },
    { name: "Basic Conversations", standard: true, pro: true },
    { name: "Priority Support", standard: false, pro: true },
    { name: "Advanced Features", standard: false, pro: true },
    { name: "Unlimited Conversations", standard: false, pro: true },
    { name: "Custom Preferences", standard: false, pro: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground">Choose the perfect plan for your needs</p>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Cards View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
                {/* Standard Plan */}
                {standardPlan && (
                  <Card className="card-elegant flex flex-col relative">
                    <div className="mb-8">
                      <h3 className="mb-4 text-2xl font-bold">{standardPlan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-bold">${(standardPlan.pricePerMonth / 100).toFixed(2)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {standardPlan.description && (
                        <p className="text-sm text-muted-foreground">{standardPlan.description}</p>
                      )}
                    </div>
                    
                    {isAuthenticated ? (
                      <Link href="/account">
                        <Button className="w-full mb-8">Choose Plan</Button>
                      </Link>
                    ) : (
                      <a href={getLoginUrl()}>
                        <Button className="w-full mb-8">Get Started</Button>
                      </a>
                    )}

                    <div className="space-y-3">
                      {features.map((feature) => (
                        <div key={feature.name} className="flex items-center gap-3">
                          {feature.standard ? (
                            <Check className="h-5 w-5 text-accent flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={feature.standard ? "text-foreground" : "text-muted-foreground"}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Pro Plan */}
                {proPlan && (
                  <Card className="card-elegant flex flex-col relative border-accent/50 bg-gradient-to-br from-accent/5 to-accent/2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                    
                    <div className="mb-8 pt-4">
                      <h3 className="mb-4 text-2xl font-bold">{proPlan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-bold">${(proPlan.pricePerMonth / 100).toFixed(2)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {proPlan.description && (
                        <p className="text-sm text-muted-foreground">{proPlan.description}</p>
                      )}
                    </div>
                    
                    {isAuthenticated ? (
                      <Link href="/account">
                        <Button className="w-full mb-8">Choose Plan</Button>
                      </Link>
                    ) : (
                      <a href={getLoginUrl()}>
                        <Button className="w-full mb-8">Get Started</Button>
                      </a>
                    )}

                    <div className="space-y-3">
                      {features.map((feature) => (
                        <div key={feature.name} className="flex items-center gap-3">
                          {feature.pro ? (
                            <Check className="h-5 w-5 text-accent flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={feature.pro ? "text-foreground" : "text-muted-foreground"}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Comparison Table */}
              <div className="mb-16 overflow-x-auto">
                <div className="min-w-full rounded-lg border border-border bg-card">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 text-left font-semibold">Feature</th>
                        <th className="px-6 py-4 text-center font-semibold">Standard</th>
                        <th className="px-6 py-4 text-center font-semibold">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, idx) => (
                        <tr key={feature.name} className={idx % 2 === 0 ? "" : "bg-muted/30"}>
                          <td className="px-6 py-4 font-medium">{feature.name}</td>
                          <td className="px-6 py-4 text-center">
                            {feature.standard ? (
                              <Check className="h-5 w-5 text-accent mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {feature.pro ? (
                              <Check className="h-5 w-5 text-accent mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto mt-16 pt-16 border-t border-border">
            <h2 className="mb-8 text-3xl font-bold text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Can I change my plan anytime?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-semibold">Is there a free trial?</h3>
                <p className="text-muted-foreground">We offer a 7-day free trial for both plans. No credit card required to get started.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-semibold">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and other popular payment methods.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-semibold">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">Absolutely. Cancel your subscription at any time with no questions asked. Your access continues until the end of your billing period.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/50 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-lg border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of users enjoying premium AI companion experiences.
            </p>
            {isAuthenticated ? (
              <Link href="/account">
                <Button size="lg" className="gap-2">
                  Choose Your Plan <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  Get Started <Sparkles className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
