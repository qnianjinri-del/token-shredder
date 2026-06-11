import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { CalculationResult, PetSkinId } from '../types';
import { formatCurrency, formatPercent, formatTokens } from '../lib/formatting';
import { CodexChompPet } from './CodexChompPet';
import { DohDadPet } from './DohDadPet';

interface MoneyShredderProps {
  result: CalculationResult;
  scenarioName: string;
  compact?: boolean;
  demoLoop?: boolean;
  petSkin?: PetSkinId;
}

const machineUrl = () => `${import.meta.env.BASE_URL}assets/shredder-machine.png`;

const tightMachineUrl = () => `${import.meta.env.BASE_URL}assets/shredder-machine-tight.png`;

const billUrl = () => `${import.meta.env.BASE_URL}assets/generated/token-bill-vertical.png`;

const tokenLetters = Array.from({ length: 34 }, (_, index) => {
  const letters = 'TOKEN';
  const column = index % 5;
  const row = Math.floor(index / 5);

  return {
    id: `falling-${index}`,
    letter: letters[index % letters.length],
    x: 37 + column * 6 + (row % 2) * 2,
    delay: -(index * 0.12),
    duration: 0.92 + (index % 4) * 0.1,
    drift: [-14, -7, -1, 7, 14][column],
    rotate: [-28, 18, -10, 26, -20][(index + row) % 5],
  };
});

function DollarBill({ className = '' }: { className?: string }) {
  return (
    <img
      src={billUrl()}
      alt=""
      className={`pixel-dollar-bill ${className}`}
      draggable={false}
    />
  );
}

export function MoneyShredder({
  result,
  scenarioName,
  compact = false,
  demoLoop = false,
  petSkin = 'shredder',
}: MoneyShredderProps) {
  if (petSkin === 'doh-dad') {
    return (
      <DohDadPet
        result={result}
        scenarioName={scenarioName}
        compact={compact}
        demoLoop={demoLoop}
      />
    );
  }

  if (petSkin === 'codex-chomp') {
    return (
      <CodexChompPet
        result={result}
        scenarioName={scenarioName}
        compact={compact}
        demoLoop={demoLoop}
      />
    );
  }

  return (
    <ShredderPet
      result={result}
      scenarioName={scenarioName}
      compact={compact}
      demoLoop={demoLoop}
    />
  );
}

function ShredderPet({
  result,
  scenarioName,
  compact = false,
  demoLoop = false,
}: Omit<MoneyShredderProps, 'petSkin'>) {
  const progress = result.currentBillProgress;
  const controls = useAnimation();
  const previousTotalCost = useRef(result.totalCost);
  const wasDemoLoop = useRef(demoLoop);
  const stopShreddingTimer = useRef<number | null>(null);
  const [isShredding, setIsShredding] = useState(false);

  useEffect(() => {
    return () => {
      if (stopShreddingTimer.current !== null) {
        window.clearTimeout(stopShreddingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (wasDemoLoop.current && !demoLoop) {
      previousTotalCost.current = 0;
    }

    wasDemoLoop.current = demoLoop;
  }, [demoLoop]);

  useEffect(() => {
    const previousCost = previousTotalCost.current;
    const nextCost = result.totalCost;
    previousTotalCost.current = nextCost;

    if (stopShreddingTimer.current !== null) {
      window.clearTimeout(stopShreddingTimer.current);
      stopShreddingTimer.current = null;
    }

    if (nextCost > previousCost + 0.000_001) {
      const crossedWholeBill = Math.floor(nextCost) > Math.floor(previousCost);
      const duration = crossedWholeBill ? 1_250 : 820;
      setIsShredding(true);
      void controls.start({
        x: crossedWholeBill ? [0, -8, 8, -5, 5, 0] : [0, -3, 3, 0],
        y: crossedWholeBill ? [0, -2, 2, -1, 0] : [0, -1, 1, 0],
        transition: { duration: crossedWholeBill ? 0.34 : 0.22, ease: 'easeOut' },
      });

      stopShreddingTimer.current = window.setTimeout(() => {
        setIsShredding(false);
        stopShreddingTimer.current = null;
      }, duration);
      return;
    }

    setIsShredding(false);
  }, [controls, result.totalCost]);

  const getAssetUrl = compact ? tightMachineUrl : machineUrl;
  const feedDistance = compact ? 104 : 46;
  const isOperating = demoLoop || isShredding;
  const stageStyle = {
    '--feed-y': `calc(${(progress * feedDistance).toFixed(2)}px * var(--pet-scale, 1))`,
    '--feed-distance': `calc(${feedDistance}px * var(--pet-scale, 1))`,
  } as CSSProperties;

  return (
    <section
      className={`mx-auto flex w-full flex-col items-center ${compact ? 'max-w-[260px] p-0' : 'max-w-5xl px-4 pb-6 pt-2 sm:px-6'}`}
    >
      {!compact ? (
        <div className="mb-4 grid w-full max-w-3xl gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-slate-600 dark:text-cyan-200">桌面计费宠物</p>
            <h2 className="truncate text-2xl font-black text-slate-950 dark:text-white sm:text-4xl">
              {scenarioName || '未命名 token 运行'}
            </h2>
          </div>
          <div className="pixel-total-badge">
            <span>总消耗</span>
            <strong>{formatCurrency(result.totalCost)}</strong>
          </div>
        </div>
      ) : null}

      <motion.div
        animate={controls}
        className={`generated-pet-stage ${compact ? 'generated-pet-stage-compact' : ''} ${isOperating ? 'is-shredding' : ''} ${demoLoop ? 'is-demo-loop' : ''}`}
        aria-label="像素风 token 碎钞机宠物"
        style={stageStyle}
      >
        {!compact ? (
          <div className="generated-pet-readout">
            <span>{formatTokens(result.destroyedBills)} bills</span>
            <strong>{formatPercent(progress)}</strong>
          </div>
        ) : null}
        <div className="generated-pet-frame-wrap">
          <div className="pixel-feeding-bill" aria-hidden="true">
            <DollarBill className="pixel-dollar-bill-feeding" />
          </div>
          <motion.img
            src={getAssetUrl()}
            alt="像素风 token 碎钞机宠物"
            className="generated-pet-frame generated-pet-machine"
            draggable={false}
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          />
          <div className="pet-input-slot-cover" aria-hidden="true" />
          <div className="pet-output-mouth" aria-hidden="true" />
          <div className="token-fragment-rain" aria-hidden="true">
            {tokenLetters.map((fragment) => (
              <span
                key={fragment.id}
                className="token-fragment"
                style={{
                  left: `${fragment.x}%`,
                  animationDelay: `${fragment.delay}s`,
                  animationDuration: `${fragment.duration}s`,
                  '--fragment-drift': `${fragment.drift}px`,
                  '--fragment-rotate': `${fragment.rotate}deg`,
                } as CSSProperties}
              >
                {fragment.letter}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {!compact ? (
        <div className="mt-4 grid w-full max-w-3xl gap-2 sm:grid-cols-3">
          <div className="pixel-stat-card">
            <span>单次成本</span>
            <strong>{formatCurrency(result.costPerRun)}</strong>
          </div>
          <div className="pixel-stat-card">
            <span>完整纸币</span>
            <strong>{formatTokens(result.destroyedBills)}</strong>
          </div>
          <div className="pixel-stat-card">
            <span>当前纸币</span>
            <strong>{formatPercent(progress)}</strong>
          </div>
        </div>
      ) : null}
    </section>
  );
}
