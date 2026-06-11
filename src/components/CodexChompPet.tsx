import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { CalculationResult } from '../types';
import { formatCurrency, formatPercent, formatTokens } from '../lib/formatting';

interface CodexChompPetProps {
  result: CalculationResult;
  scenarioName: string;
  compact?: boolean;
  demoLoop?: boolean;
}

const frameUrl = (frameIndex: number) =>
  `${import.meta.env.BASE_URL}assets/skins/codex-chomp-frames/${frameIndex}.png`;

const DEMO_SEQUENCE = [0, 1, 2, 3, 4, 5, 5];

const getProgressFrame = (progress: number): number =>
  Math.min(4, Math.max(0, Math.floor(Math.min(progress, 0.999) * 5)));

export function CodexChompPet({
  result,
  scenarioName,
  compact = false,
  demoLoop = false,
}: CodexChompPetProps) {
  const progress = result.currentBillProgress;
  const controls = useAnimation();
  const previousTotalCost = useRef(result.totalCost);
  const wasDemoLoop = useRef(demoLoop);
  const stopChompingTimer = useRef<number | null>(null);
  const stopToastTimer = useRef<number | null>(null);
  const [isChomping, setIsChomping] = useState(false);
  const [isToast, setIsToast] = useState(false);
  const [demoFrameIndex, setDemoFrameIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (stopChompingTimer.current !== null) {
        window.clearTimeout(stopChompingTimer.current);
      }
      if (stopToastTimer.current !== null) {
        window.clearTimeout(stopToastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!demoLoop) {
      setDemoFrameIndex(0);
      return;
    }

    let index = 0;
    setDemoFrameIndex(DEMO_SEQUENCE[index]);
    const interval = window.setInterval(() => {
      index = (index + 1) % DEMO_SEQUENCE.length;
      setDemoFrameIndex(DEMO_SEQUENCE[index]);
    }, 320);

    return () => window.clearInterval(interval);
  }, [demoLoop]);

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

    if (stopChompingTimer.current !== null) {
      window.clearTimeout(stopChompingTimer.current);
      stopChompingTimer.current = null;
    }

    if (nextCost > previousCost + 0.000_001) {
      const crossedWholeBill = Math.floor(nextCost) > Math.floor(previousCost);
      setIsChomping(true);
      if (crossedWholeBill) {
        setIsToast(true);
        if (stopToastTimer.current !== null) {
          window.clearTimeout(stopToastTimer.current);
        }
        stopToastTimer.current = window.setTimeout(() => {
          setIsToast(false);
          stopToastTimer.current = null;
        }, 1_250);
      }

      void controls.start({
        x: crossedWholeBill ? [0, -7, 8, -4, 4, 0] : [0, -2, 2, 0],
        y: crossedWholeBill ? [0, -2, 2, -1, 0] : [0, -1, 1, 0],
        transition: { duration: crossedWholeBill ? 0.34 : 0.2, ease: 'easeOut' },
      });

      stopChompingTimer.current = window.setTimeout(() => {
        setIsChomping(false);
        stopChompingTimer.current = null;
      }, crossedWholeBill ? 1_250 : 820);
      return;
    }

    setIsChomping(false);
  }, [controls, result.totalCost]);

  const frameIndex = demoLoop ? demoFrameIndex : isToast ? 5 : getProgressFrame(progress);
  const stage = (
    <motion.div
      animate={controls}
      className={`codex-chomp-stage ${compact ? 'codex-chomp-stage-compact' : ''} ${isChomping ? 'is-chomping' : ''} ${demoLoop ? 'is-demo-loop' : ''}`}
      aria-label="像素风 Codex 吞钞宠物"
    >
      {!compact ? (
        <div className="generated-pet-readout">
          <span>{formatTokens(result.destroyedBills)} bills</span>
          <strong>{formatPercent(progress)}</strong>
        </div>
      ) : null}
      <div className="codex-chomp-sprite-window" aria-hidden="true">
        <img
          src={frameUrl(frameIndex)}
          alt=""
          className="codex-chomp-frame-image"
          draggable={false}
        />
      </div>
    </motion.div>
  );

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

      {compact ? (
        <div className="codex-chomp-compact-anchor">
          <div className="codex-chomp-compact-anchor-inner">{stage}</div>
        </div>
      ) : stage}

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
