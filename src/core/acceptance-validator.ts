import type { Evidence } from "../domain/evidence.js";
import type { ExecutionResult } from "./executor.js";

export interface AcceptanceValidator {
  validate(
    contributionId: string,
    execution: ExecutionResult
  ): Evidence;
}