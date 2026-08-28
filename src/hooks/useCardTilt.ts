import { useCardInteraction, CardInteractionOptions } from "./useCardInteraction";

/**
 * Re-export useCardTilt pointing to the unified useCardInteraction hook.
 */
export const useCardTilt = useCardInteraction;
export type { CardInteractionOptions as CardTiltOptions };
