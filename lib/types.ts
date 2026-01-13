export interface Product {
  id: number
  name: string
  default_code: string
  list_price: number
  type: string
  image_128: boolean | string
  active: boolean
  x_statu: string
}

export interface BlockData {
  blockCode: string
  blockName: string
  lots: Product[]
  availableLots: number
  soldLots: number
  separatedLots: number
}

export interface StageData {
  stageCode: string
  stageName: string
  totalBlocks: number
  totalLots: number
  availableLots: number
  soldLots: number
  separatedLots: number
  blocks: BlockData[]
}

export interface ParsedProductCode {
  stageCode: string
  blockCode: string
  lotNumber: string
}
