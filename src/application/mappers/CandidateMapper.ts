import { Candidate } from '../../domain/entities/Candidate';
import { Position } from '../../domain/entities/Position';
import { CandidateResponseDTO, PositionResponseDTO } from '../dto/profile.dto';

export class CandidateMapper {
  static toResponse(candidate: Candidate): CandidateResponseDTO {
    return {
      id: candidate.id,
      userId: candidate.userId,
      name: candidate.name,
      document: candidate.document,
      address: candidate.address,
      phone: candidate.phone,
      positionId: candidate.positionId,
      expectedSalary: candidate.expectedSalary,
      overallRating: candidate.overallRating,
      bio: candidate.bio,
      badges: candidate.badges.map((badge) => ({
        badge: badge.badge,
        grantedAt: badge.grantedAt.toISOString(),
      })),
      active: candidate.active,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
    };
  }
}

export class PositionMapper {
  static toResponse(position: Position): PositionResponseDTO {
    return {
      id: position.id,
      area: position.area,
      name: position.name,
      level: position.level,
      active: position.active,
    };
  }
}
