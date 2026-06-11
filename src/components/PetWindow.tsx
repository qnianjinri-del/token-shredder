import { useEffect, type CSSProperties } from 'react';
import { clampPetScale } from '../lib/pet';
import type { CalculationResult, PetSkinId } from '../types';
import { MoneyShredder } from './MoneyShredder';

interface PetWindowProps {
  scenarioName: string;
  result: CalculationResult;
  petScale: number;
  petSkin: PetSkinId;
  demoLoop: boolean;
}

export function PetWindow({ scenarioName, result, petScale, petSkin, demoLoop }: PetWindowProps) {
  const safePetScale = clampPetScale(petScale);
  const petStyle = { '--pet-scale': safePetScale } as CSSProperties;

  useEffect(() => {
    void window.tokenShredderDesktop?.resizePet(safePetScale);
  }, [safePetScale]);

  return (
    <main
      className="desktop-pet-shell min-h-screen bg-transparent"
      style={petStyle}
    >
      <MoneyShredder
        result={result}
        scenarioName={scenarioName}
        compact
        demoLoop={demoLoop}
        petSkin={petSkin}
      />
    </main>
  );
}
