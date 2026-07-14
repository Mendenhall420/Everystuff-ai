import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AgeVerification } from "@/components/AgeVerification";
import { ConversationUI } from "@/components/ConversationUI";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [companionId, setCompanionId] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [intimacyLevel, setIntimacyLevel] = useState<"friendly" | "flirty" | "romantic">("friendly");
  const [messages, setMessages] = useState<any[]>([]);

  const { data: companion } = trpc.companions.getById.useQuery(companionId || 0, {
    enabled: companionId !== null,
  });

  const { data: userPrefs } = trpc.preferences.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: conversationMessages } = trpc.conversations.getMessages.useQuery(conversationId || 0, {
    enabled: conversationId !== null,
  });

  const getOrCreateConversationMutation = trpc.conversations.getOrCreate.useMutation();
  const sendMessageMutation = trpc.conversations.sendMessage.useMutation();
  const updatePrefsMutation = trpc.preferences.update.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else {
      const companionIdStr = sessionStorage.getItem("selectedCompanionId");
      if (companionIdStr) {
        setCompanionId(parseInt(companionIdStr, 10));
        sessionStorage.removeItem("selectedCompanionId");
      }
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    const verified = userPrefs?.ageVerified === 1;
    setAgeVerified(verified);
    if (!verified) {
      setShowAgeVerification(true);
    }
  }, [userPrefs]);

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  const handleAgeVerified = async () => {
    try {
      await updatePrefsMutation.mutateAsync({ ageVerified: 1 });
      setAgeVerified(true);
      setShowAgeVerification(false);
    } catch (error) {
      toast.error("Failed to verify age");
    }
  };

  const handleConnectCompanion = async () => {
    if (!companionId) return;
    try {
      const conv = await getOrCreateConversationMutation.mutateAsync({
        companionId,
        intimacyLevel,
      });
      setConversationId(conv.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to start conversation");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversationId) return;
    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content,
      });
      setMessages([...messages, { conversationId, role: "user", content, createdAt: new Date() }]);
      toast.success("Message sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (showAgeVerification && !ageVerified) {
    return (
      <AgeVerification
        onVerified={handleAgeVerified}
        onDismiss={() => setLocation("/")}
      />
    );
  }

  if (!companionId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="gap-2 mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a companion to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  if (!conversationId && companion) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="gap-2 mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Start Conversation</h2>
            <p className="text-muted-foreground mb-6">
              Choose your conversation style with {companion.name}
            </p>
            <div className="space-y-3">
              {(["friendly", "flirty", "romantic"] as const).map((level) => (
                <Button
                  key={level}
                  variant={intimacyLevel === level ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setIntimacyLevel(level)}
                >
                  <span className="capitalize">{level}</span>
                </Button>
              ))}
            </div>
            <Button
              className="w-full mt-6"
              onClick={handleConnectCompanion}
              disabled={getOrCreateConversationMutation.isPending}
            >
              {getOrCreateConversationMutation.isPending ? "Connecting..." : "Start Chat"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <Link href="/gallery">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="h-[600px]">
          {companion ? (
            <ConversationUI
              companionName={companion.name}
              messages={messages}
              intimacyLevel={intimacyLevel}
              onIntimacyChange={setIntimacyLevel}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading companion...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
