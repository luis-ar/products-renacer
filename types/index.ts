export type Poligono = {
  nombre: string;
  coords: [number, number][];
  fill: string;
  stroke: string;
  metadata?: {
    totalBlocks: number;
    totalLots: number;
    blocks: {
      name: string;
      lotCount: number;
    }[];
  };
};

export type PlanoUrbanizacionProps = {
  lotes: Poligono[];
};