import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import type { Companion } from "../../../drizzle/schema";

interface CompanionProfileCardProps {
  companion: Companion;
  showCategory?: boolean;
  onConnect?: () => void;
}

export function CompanionProfileCard({
  companion,
  showCategory = false,
  onConnect,
}: CompanionProfileCardProps) {
  const personalityIcons: Record<string, React.ReactNode> = {
    friendly: <Sparkles className="h-3 w-3" />,
    flirty: <Heart className="h-3 w-3" />,
    romantic: <Heart className="h-3 w-3 fill-current" />,
    intellectual: <Sparkles className="h-3 w-3" />,
    adventurous: <Sparkles className="h-3 w-3" />,
  };

  return (
    <Card className="card-elegant overflow-hidden hover:shadow-lg transition-shadow">
      {companion.imageUrl && (
        <div className="h-48 overflow-hidden bg-muted">
          <img
            src={companion.imageUrl}
            alt={companion.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2">{companion.name}</h3>
        
        {/* Personality and Conversation Style Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {companion.personalityType && (
            <Badge variant="secondary" className="gap-1">
              {personalityIcons[companion.personalityType]}
              <span className="capitalize">{companion.personalityType}</span>
            </Badge>
          )}
          {companion.conversationStyle && (
            <Badge variant="outline" className="text-xs">
              {companion.conversationStyle}
            </Badge>
          )}
          {showCategory && companion.category && (
            <Badge variant="outline" className="text-xs">
              {companion.category}
            </Badge>
          )}
        </div>

        {companion.description && (
          <p className="mb-6 text-sm leading-relaxed">{companion.description}</p>
        )}
        <Button className="w-full" onClick={onConnect}>
          Connect
        </Button>
      </div>
    </Card>
  );
}
