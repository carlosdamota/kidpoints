import { Zap, Rocket, PawPrint, Crown, Car, Star, Bot } from 'lucide-react';
import { ChildProfile } from '../types';

interface ThemeIconProps {
  theme?: ChildProfile['theme'];
  className?: string;
  size?: number;
  fill?: string;
}

export function ThemeIcon({ theme, className, size = 24, fill }: ThemeIconProps) {
  const props = { className, size, fill };
  switch (theme) {
    case 'robots':
      return <Bot {...props} />;
    case 'space':
      return <Rocket {...props} />;
    case 'dinosaurs':
      return <PawPrint {...props} />;
    case 'princesses':
      return <Crown {...props} />;
    case 'cars':
      return <Car {...props} />;
    default:
      return <Star {...props} />;
  }
}
