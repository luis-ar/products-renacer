import { Poligono } from '@/types';
import React from 'react';
import PlanoUrbanizacion from './polygon';
import { StageData } from '@/lib/types';

const StagesMap = ({ stageData }: { stageData: StageData[] }) => {
  const stages: Poligono[] = [
    {
      nombre: "Stage central",
      coords: [
        [308291.4827, 8623340.869],
        [308750.1099, 8623077.248],
        [308640.4756, 8623051.1366],
        [308735.7424, 8622776.1674],
        [308752.6381, 8622703.634],
        [308660.749, 8622678.4603],
        [308648.4495, 8622753.4586],
        [308355.4442, 8622689.0557],
        [308308.517, 8622753.8469],
        [308477.6171, 8622887.5031],
        [308471.4927, 8622971.2857],
        [308271.0707, 8622921.1211],
        [308251.4539, 8622988.398],
        [308150.0365, 8623042.7388],
        [308198.1441, 8623150.4862],
        [308333.7336, 8623076.5369],
        [308397.7777, 8623106.2979],
        [308328.1165, 8623178.0433],
        [308331.8287, 8623284.9785],
      ],
      fill: "lightgreen",
      stroke: "green",
    },
    {
      nombre: "Stage 1",
      coords: [
        [308758.5435, 8623079.82],
        [308763.5952, 8623080.0217],
        [308775.4647, 8623081.8499],
        [309039.5162, 8623154.452],
        [309075.2187, 8623027.7484],
        [309136.3503, 8622811.2917],
        [308871.432, 8622738.7153],
        [308850.0381, 8622819.799],
        [308822.3445, 8622929.7864],
      ],
      fill: "lightblue",
      stroke: "blue",
    },
    {
      nombre: "Stage 2",
      coords: [
        [308198.1585, 8623150.4783],
        [308017.3558, 8623248.9168],
        [307990.8568, 8623285.3908],
        [307991.3548, 8623377.0198],
        [308019.022, 8623384.37],
        [308076.5927, 8623445.2029],
        [308076.5769, 8623466.2157],
        [308178.828, 8623409.9244],
        [308291.4827, 8623340.869],
        [308331.8287, 8623284.9785],
        [308328.1165, 8623178.0433],
        [308397.7777, 8623106.2979],
        [308333.7336, 8623076.5369],
      ],
      fill: "lightcoral",
      stroke: "red",
    },
  ];

  // No normalization needed, PlanoUrbanizacion handles auto-fit
  const enrichedStages = stages.map(stage => {
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
          availableLots: matchedData.availableLots,
          soldLots: matchedData.soldLots,
          separatedLots: matchedData.separatedLots,
          blocks: matchedData.blocks.map(b => ({
            name: b.blockName,
            lotCount: b.lots.length,
            availableLots: b.availableLots,
            soldLots: b.soldLots,
            separatedLots: b.separatedLots,
          })),
        },
      };
    }
    return stage;
  });

  console.log(enrichedStages);

  return (
    <div>
      <PlanoUrbanizacion lotes={enrichedStages} />
    </div>
  );
};

export default StagesMap;