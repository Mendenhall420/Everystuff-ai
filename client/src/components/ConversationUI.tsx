import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Heart, Sparkles } from "lucide-react";
import type { Message } from "../../../drizzle/schema";

interface ConversationUIProps {
  companionName: string;
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  intimacyLevel: "friendly" | "flirty" | "romantic";
  onIntimacyChange?: (level: "friendly" | "flirty" | "romantic") => void;
}

export function ConversationUI({
  companionName,
  messages,
  isLoading = false,
  onSendMessage,
  intimacyLevel,
  onIntimacyChange,
}: ConversationUIProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setSending(true);
    try {
      await onSendMessage(input);
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const intimacyIcons = {
    friendly: <Sparkles className="h-4 w-4" />,
    flirty: <Heart className="h-4 w-4" />,
    romantic: <Heart className="h-4 w-4 fill-current" />,
  };

  const intimacyLabels = {
    friendly: "Friendly",
    flirty: "Flirty",
    romantic: "Romantic",
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{companionName}</h2>
          <div className="flex gap-2">
            {onIntimacyChange && (
              <>
                {(["friendly", "flirty", "romantic"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={intimacyLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => onIntimacyChange(level)}
                    className="gap-2"
                  >
                    {intimacyIcons[level]}
                    {intimacyLabels[level]}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Current mood: <span className="font-semibold capitalize">{intimacyLevel}</span>
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Start a conversation with {companionName}</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card/50 p-4">
        <div className="flex gap-2">
          <Input
            placeholder={`Message ${companionName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sending || isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
