import { Ionicons } from '@expo/vector-icons';
import { Pet } from '@/lib/types';

export const getPetTypeIcon = (petType?: Pet['type']): keyof typeof Ionicons.glyphMap => {
  switch (petType) {
    case 'dog':
      return 'paw';
    case 'cat':
      return 'paw';
    case 'bird':
      return 'leaf';
    case 'rabbit':
      return 'paw';
    case 'hamster':
      return 'paw';
    case 'fish':
      return 'fish';
    case 'reptile':
      return 'fish';
    default:
      return 'paw';
  }
};

export const getPetTypeColor = (petType?: Pet['type']): string => {
  switch (petType) {
    case 'dog':
      return '#FFB3D1';
    case 'cat':
      return '#B3FFD9';
    case 'bird':
      return '#C8B3FF';
    case 'rabbit':
      return '#FFDAB3';
    case 'hamster':
      return '#FFF3B3';
    case 'fish':
      return '#87CEEB';
    case 'reptile':
      return '#98FB98';
    default:
      return '#FFB3D1';
  }
};
