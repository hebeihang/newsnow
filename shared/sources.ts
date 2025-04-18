import type { Source } from "@shared/types"
import _sources from "./sources.json"

export const sources = _sources as Record<SourceID, Source>
export default sources
