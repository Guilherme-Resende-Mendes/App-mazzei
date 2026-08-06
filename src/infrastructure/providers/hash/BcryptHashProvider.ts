import bcrypt from 'bcryptjs';
import { HashProvider } from '../../../application/interfaces/HashProvider';
import { env } from '../../../config/env';

export class BcryptHashProvider implements HashProvider {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
