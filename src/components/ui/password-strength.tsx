import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { validatePassword, type PasswordValidation } from "@/lib/validation";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const validation = validatePassword(password);
  
  if (!password) return null;
  
  const getStrengthColor = (strength: PasswordValidation['strength']) => {
    switch (strength) {
      case 'weak':
        return 'text-destructive';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };
  
  const getProgressValue = (strength: PasswordValidation['strength']) => {
    switch (strength) {
      case 'weak':
        return 25;
      case 'medium':
        return 65;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  };
  
  const getProgressColor = (strength: PasswordValidation['strength']) => {
    switch (strength) {
      case 'weak':
        return 'bg-destructive';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className={cn("text-sm font-medium capitalize", getStrengthColor(validation.strength))}>
          {validation.strength}
        </span>
      </div>
      
      <Progress 
        value={getProgressValue(validation.strength)} 
        className={cn("h-2", getProgressColor(validation.strength))}
      />
      
      {validation.errors.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {validation.errors.slice(0, 3).map((error, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-destructive">•</span>
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}