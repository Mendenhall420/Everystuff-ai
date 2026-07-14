import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, LogOut, Sparkles, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: subscription } = trpc.subscriptions.getUserSubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: plans } = trpc.subscriptionPlans.list.useQuery();
  const createSubscription = trpc.subscriptions.create.useMutation();
  const cancelSubscription = trpc.subscriptions.cancel.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentPlan = plans?.find(p => p.id === subscription?.planId);
  const availablePlans = plans?.filter(p => p.id !== subscription?.planId) || [];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSelectPlan = async (planId: number) => {
    try {
      await createSubscription.mutateAsync(planId);
      // Refresh subscription data
      window.location.reload();
    } catch (error) {
      console.error("Failed to select plan:", error);
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      try {
        await cancelSubscription.mutateAsync();
        window.location.reload();
      } catch (error) {
        console.error("Failed to cancel subscription:", error);
      }
    }
  };

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
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Account Settings</h1>
          <p className="text-lg text-muted-foreground">Manage your profile and subscription</p>
        </div>
      </div>

      {/* Content */}
      <section className="py-12">
        <div className="container max-w-2xl">
          {/* Profile Section */}
          <Card className="card-elegant mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user.email || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Card>

          {/* Current Subscription */}
          <Card className="card-elegant mb-8">
            <h2 className="text-2xl font-bold mb-6">Current Subscription</h2>
            
            {subscription && currentPlan ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold">${(currentPlan.pricePerMonth / 100).toFixed(2)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="font-semibold text-accent capitalize">{subscription.status}</span>
                      </p>
                    </div>
                    <Check className="h-6 w-6 text-accent" />
                  </div>
                  {currentPlan.description && (
                    <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Started</label>
                    <p className="font-semibold">{new Date(subscription.startDate).toLocaleDateString()}</p>
                  </div>
                  {subscription.endDate && (
                    <div>
                      <label className="text-muted-foreground">Ends</label>
                      <p className="font-semibold">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {subscription.status === "active" && (
                  <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelSubscription.isPending}>
                    {cancelSubscription.isPending ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6">Choose a plan to get started</p>
              </div>
            )}
          </Card>

          {/* Available Plans */}
          {availablePlans.length > 0 && (
            <Card className="card-elegant">
              <h2 className="text-2xl font-bold mb-6">
                {subscription ? "Upgrade or Downgrade" : "Choose a Plan"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePlans.map((plan) => (
                  <div key={plan.id} className="rounded-lg border border-border p-6 hover:border-accent/50 transition-colors">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold">${(plan.pricePerMonth / 100).toFixed(2)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={createSubscription.isPending}
                    >
                      {createSubscription.isPending ? "Processing..." : "Select Plan"}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
