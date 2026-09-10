import { create } from 'zustand';

export type CameraPreset = 'AERIAL' | 'SOLAR' | 'BATTERY' | 'BUILDING' | 'ENERGY_NETWORK' | 'WEATHER' | 'WIND';
export type QualityLevel = 'HIGH' | 'BALANCED' | 'PERFORMANCE';
export type TimeOfDay = 'DAWN' | 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

interface SceneStoreState {
  selectedAsset: string | null;
  cameraPreset: CameraPreset;
  timeOfDay: TimeOfDay;
  qualityLevel: QualityLevel;
  showLabels: boolean;
  focusedChart: string | null;
  explanationMode: boolean;
  introComplete: boolean;
  introPaused: boolean;

  setSelectedAsset: (asset: string | null) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setQualityLevel: (level: QualityLevel) => void;
  setShowLabels: (show: boolean) => void;
  setFocusedChart: (chart: string | null) => void;
  setExplanationMode: (active: boolean) => void;
  setIntroComplete: (complete: boolean) => void;
  skipIntro: () => void;
}

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return 'DAWN';
  if (h >= 7 && h < 12) return 'MORNING';
  if (h >= 12 && h < 15) return 'NOON';
  if (h >= 15 && h < 18) return 'AFTERNOON';
  if (h >= 18 && h < 21) return 'EVENING';
  return 'NIGHT';
}

export const useSceneStore = create<SceneStoreState>((set) => ({
  selectedAsset: null,
  cameraPreset: 'AERIAL',
  timeOfDay: getTimeOfDay(),
  qualityLevel: 'BALANCED',
  showLabels: true,
  focusedChart: null,
  explanationMode: false,
  introComplete: false,
  introPaused: false,

  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset });
    // Auto-set camera preset based on asset
    if (asset === 'SOLAR_FARM') set({ cameraPreset: 'SOLAR' });
    else if (asset === 'BATTERY') set({ cameraPreset: 'BATTERY' });
    else if (asset === 'WIND_TURBINE') set({ cameraPreset: 'WIND' });
    else if (['ACADEMIC', 'COMPUTER_LAB', 'LIBRARY', 'HOSTEL', 'CANTEEN'].includes(asset || ''))
      set({ cameraPreset: 'BUILDING' });
  },
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setQualityLevel: (level) => set({ qualityLevel: level }),
  setShowLabels: (show) => set({ showLabels: show }),
  setFocusedChart: (chart) => set({ focusedChart: chart }),
  setExplanationMode: (active) => set({ explanationMode: active }),
  setIntroComplete: (complete) => set({ introComplete: complete }),
  skipIntro: () => set({ introComplete: true }),
}));
