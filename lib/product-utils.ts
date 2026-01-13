import { Product, StageData, BlockData, ParsedProductCode } from "./types"

/**
 * Parse a product code to extract stage, block, and lot information
 * Example: "E01MZD150P" -> { stageCode: "E01", blockCode: "MZD", lotNumber: "150" }
 */
export function parseProductCode(code: string): ParsedProductCode | null {
  if (!code || code.length < 6) {
    return null
  }

  return {
    stageCode: code.substring(0, 3), // E01
    blockCode: code.substring(3, 6), // MZD
    lotNumber: code.substring(6), // 150P
  }
}

/**
 * Convert block code to readable name
 * Example: "MZD" -> "Block D"
 */
export function getBlockName(blockCode: string): string {
  if (!blockCode || blockCode.length < 3) {
    return "Unknown Block"
  }

  // Extract the last character which represents the block letter
  const blockLetter = blockCode.charAt(2)
  return `Manzana ${blockLetter}`
}

/**
 * Convert stage code to readable name
 * Example: "E01" -> "Stage 01"
 */
export function getStageName(stageCode: string): string {
  if (!stageCode || stageCode.length < 3) {
    return "Unknown Stage"
  }

  // Extract the numeric part (last 2 characters)
  const stageNumber = stageCode.substring(1)
  return `Etapa ${stageNumber}`
}

/**
 * Group Etapas and block
 */
export function groupProductsByStage(products: Product[]): StageData[] {
  const stageMap = new Map<string, Map<string, Product[]>>()

  // First pass: organize Etapas and block
  products.forEach((product) => {
    const parsed = parseProductCode(product.default_code)
    if (!parsed) return

    const { stageCode, blockCode } = parsed

    if (!stageMap.has(stageCode)) {
      stageMap.set(stageCode, new Map<string, Product[]>())
    }

    const blockMap = stageMap.get(stageCode)!
    if (!blockMap.has(blockCode)) {
      blockMap.set(blockCode, [])
    }

    blockMap.get(blockCode)!.push(product)
  })

  // Second pass: convert to StageData array
  const stages: StageData[] = []

  stageMap.forEach((blockMap, stageCode) => {
    const blocks: BlockData[] = []
    let totalLots = 0
    let stageAvailable = 0
    let stageSold = 0
    let stageSeparated = 0

    blockMap.forEach((lots, blockCode) => {
      let blockAvailable = 0
      let blockSold = 0
      let blockSeparated = 0

      lots.forEach((p) => {
        if (!p.x_statu || typeof p.x_statu !== "string") return;

        const status = p.x_statu.toLowerCase();

        if (status === "libre") blockAvailable++;
        else if (status === "vendido") blockSold++;
        else if (status === "separado") blockSeparated++;
      });


      blocks.push({
        blockCode,
        blockName: getBlockName(blockCode),
        lots,
        availableLots: blockAvailable,
        soldLots: blockSold,
        separatedLots: blockSeparated,
      })
      totalLots += lots.length
      stageAvailable += blockAvailable
      stageSold += blockSold
      stageSeparated += blockSeparated
    })

    // Sort blocks by block code
    blocks.sort((a, b) => a.blockCode.localeCompare(b.blockCode))

    stages.push({
      stageCode,
      stageName: getStageName(stageCode),
      totalBlocks: blocks.length,
      totalLots,
      availableLots: stageAvailable,
      soldLots: stageSold,
      separatedLots: stageSeparated,
      blocks,
    })
  })

  // Sort stages by stage code
  stages.sort((a, b) => a.stageCode.localeCompare(b.stageCode))

  return stages
}
