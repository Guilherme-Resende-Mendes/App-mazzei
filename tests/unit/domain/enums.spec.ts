import { Area, isArea } from '../../../src/domain/enums/Area';
import {
  HiringStatus,
  isHiringStatus,
} from '../../../src/domain/enums/HiringStatus';
import { JobStatus, isJobStatus } from '../../../src/domain/enums/JobStatus';

describe('Enums guards', () => {
  it('valida JobStatus', () => {
    expect(isJobStatus(JobStatus.ABERTA)).toBe(true);
    expect(isJobStatus('X')).toBe(false);
  });

  it('valida HiringStatus', () => {
    expect(isHiringStatus(HiringStatus.ACEITA)).toBe(true);
    expect(isHiringStatus('X')).toBe(false);
  });

  it('valida Area', () => {
    expect(isArea(Area.BAR)).toBe(true);
    expect(isArea('X')).toBe(false);
  });
});
