import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AgeVerificationProps {
  onVerified: () => void;
  onDismiss: () => void;
}

export function AgeVerification({ onVerified, onDismiss }: AgeVerificationProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) {
      localStorage.setItem("ageVerified", "true");
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="card-elegant max-w-md mx-4">
        <div className="flex gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Age Verification</h2>
            <p className="text-muted-foreground">
              This platform contains content intended for adults 18 years and older. By continuing, you confirm that you are at least 18 years old.
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-muted rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">
              I confirm that I am 18 years or older
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onDismiss}
            className="flex-1"
          >
            Decline
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="flex-1"
          >
            I Agree
          </Button>
        </div>
      </Card>
    </div>
  );
}
