export interface Product {
  id: number
  name: string
  default_code: string
  list_price: number
  type: string
  image_128: boolean | string
  active: boolean
}

export interface BlockData {
  blockCode: string
  blockName: string
  lots: Product[]
}

export interface StageData {
  stageCode: string
  stageName: string
  totalBlocks: number
  totalLots: number
  blocks: BlockData[]
}

export interface ParsedProductCode {
  stageCode: string
  blockCode: string
  lotNumber: string
}
