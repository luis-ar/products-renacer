import { Poligono } from '@/types';
import React from 'react'
import PlanoUrbanizacion from './polygon';
import { StageData } from '@/lib/types';

const StagesMap = ({ stageData }: { stageData: StageData[] }) => {
  const stages: Poligono[] = [
    {
      nombre: "Stage central",
      coords: [[50, 50], [150, 50], [200, 120], [120, 200], [60, 150]],
      fill: "lightgreen",
      stroke: "green",
    },
    {
      nombre: "Stage 1",
      coords: [[50, 50], [150, 50], [150, 20], [50, 20]],
      fill: "lightblue",
      stroke: "blue",
    },
    {
      nombre: "Stage 2",
      coords: [[150, 50], [200, 120], [220, 120], [170, 50]],
      fill: "lightcoral",
      stroke: "red",
    },
    {
      nombre: "Stage amarillo",
      coords: [[200, 120], [120, 200], [140, 220], [220, 140]],
      fill: "khaki",
      stroke: "orange",
    },
    {
      nombre: "Stage morado",
      coords: [[120, 200], [60, 150], [40, 170], [100, 220]],
      fill: "plum",
      stroke: "purple",
    },
    {
      nombre: "Stage gris",
      coords: [[60, 150], [50, 50], [30, 50], [40, 160]],
      fill: "lightgray",
      stroke: "gray",
    },
  ];

  // Map dynamic metadata to stages
  const enrichedStages = stages.map(stage => {
    // Attempt to match "Stage 1" with "Etapa 01" or "Stage 1"
    const matchedData = stageData.find(d => {
      const stageNum = stage.nombre.match(/\d+/)?.[0];
      const dataNum = d.stageName.match(/\d+/)?.[0] || d.stageCode.match(/\d+/)?.[0];
      return stageNum && dataNum && parseInt(stageNum) === parseInt(dataNum);
    });

    if (matchedData) {
      return {
        ...stage,
        metadata: {
          totalBlocks: matchedData.totalBlocks,
          totalLots: matchedData.totalLots,
          blocks: matchedData.blocks.map(b => ({
            name: b.blockName,
            lotCount: b.lots.length
          }))
        }
      };
    }
    return stage;
  });

  return (
    <div>
      <PlanoUrbanizacion lotes={enrichedStages} />
    </div>
  )
}

export default StagesMap
