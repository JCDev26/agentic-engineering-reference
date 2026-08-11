import type {
    Contributor,
    ContributorProfile,
    ContributorType,
  } from "../domain/contributor.js";
  import type { Contribution } from "../domain/contribution.js";
  import type { ContributorExecutor } from "./contributor-executor.js";
  
  export interface ContributorCandidate {
    contributor: Contributor;
    executor: ContributorExecutor;
  }
  
  export interface ContributionSelectionRequest {
    contribution: Contribution;
    contributorProfile: ContributorProfile;
    candidates: ContributorCandidate[];
  }
  
  export type ContributionSelectionResult =
    | {
        selected: true;
        candidate: ContributorCandidate;
      }
    | {
        selected: false;
        reason: string;
      };
  
  export interface ContributionStrategy {
    select(
      request: ContributionSelectionRequest
    ): ContributionSelectionResult;
  }
  
  export class DeterministicContributionStrategy
    implements ContributionStrategy
  {
    select(
      request: ContributionSelectionRequest
    ): ContributionSelectionResult {
      if (
        request.contribution.contributorProfileId !==
        request.contributorProfile.id
      ) {
        return {
          selected: false,
          reason:
            "Contribution profile does not match the supplied contributor profile.",
        };
      }
  
      const profileAllowsContributionCapabilities =
        request.contribution.capabilityIds.every(
          (capabilityId) =>
            request.contributorProfile.allowedCapabilityIds.includes(
              capabilityId
            )
        );
  
      if (!profileAllowsContributionCapabilities) {
        return {
          selected: false,
          reason:
            "Contributor profile does not allow all capabilities granted to the contribution.",
        };
      }
  
      const eligibleCandidates =
        request.candidates.filter((candidate) => {
          if (!candidate.contributor.available) {
            return false;
          }
  
          return request.contribution.capabilityIds.every(
            (capabilityId) =>
              candidate.contributor.capabilityIds.includes(
                capabilityId
              )
          );
        });
  
      if (eligibleCandidates.length === 0) {
        return {
          selected: false,
          reason:
            "No available contributor satisfies the contribution capability requirements.",
        };
      }
  
      const preferredTypes =
        request.contributorProfile.preferredContributorTypes ??
        [];
  
      const selectedCandidate =
        preferredTypes.length === 0
          ? this.requireCandidate(eligibleCandidates)
          : this.selectPreferredCandidate(
              eligibleCandidates,
              preferredTypes
            );
  
      return {
        selected: true,
        candidate: selectedCandidate,
      };
    }
  
    private selectPreferredCandidate(
      candidates: ContributorCandidate[],
      preferredTypes: ContributorType[]
    ): ContributorCandidate {
      for (const preferredType of preferredTypes) {
        const candidate = candidates.find(
          ({ contributor }) =>
            contributor.type === preferredType
        );
  
        if (candidate !== undefined) {
          return candidate;
        }
      }
  
      return this.requireCandidate(candidates);
    }
  
    private requireCandidate(
      candidates: ContributorCandidate[]
    ): ContributorCandidate {
      const candidate = candidates[0];
  
      if (candidate === undefined) {
        throw new Error(
          "Contributor selection requires at least one eligible candidate."
        );
      }
  
      return candidate;
    }
  }