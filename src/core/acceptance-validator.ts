import type { Evidence } from "../domain/evidence.js";
import type { ExecutionResult } from "./executor.js";

export type AcceptanceValidationResult =
  | {
      status: "completed";
      evidence: Evidence;
    }
  | {
      status: "unavailable";
      reason: string;
    };

export interface AcceptanceValidator {
  validate(
    contributionId: string,
    execution: ExecutionResult,
  ): AcceptanceValidationResult;
}
