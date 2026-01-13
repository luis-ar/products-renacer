export type Poligono = {
  nombre: string;
  coords: [number, number][];
  fill: string;
  stroke: string;
  metadata?: {
    totalBlocks: number;
    totalLots: number;
    availableLots: number;
    soldLots: number;
    separatedLots: number;
    blocks: {
      name: string;
      lotCount: number;
      availableLots: number;
      soldLots: number;
      separatedLots: number;
    }[];
  };
};

export type PlanoUrbanizacionProps = {
  lotes: Poligono[];
};