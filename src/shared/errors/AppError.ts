export interface AppErrorParams {
  message: string;
  statusCode?: number;
  errors?: string[];
}

/**
 * Erro operacional conhecido, mapeavel diretamente para uma resposta HTTP.
 * A camada HTTP le `statusCode`, `message` e `errors` para montar o envelope.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];
  public readonly isOperational = true;

  constructor({ message, statusCode = 400, errors = [] }: AppErrorParams) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Requisicao invalida', errors: string[] = []) {
    super({ message, statusCode: 400, errors });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Nao autenticado', errors: string[] = []) {
    super({ message, statusCode: 401, errors });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado', errors: string[] = []) {
    super({ message, statusCode: 403, errors });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso nao encontrado', errors: string[] = []) {
    super({ message, statusCode: 404, errors });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflito de estado', errors: string[] = []) {
    super({ message, statusCode: 409, errors });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Entidade nao processavel', errors: string[] = []) {
    super({ message, statusCode: 422, errors });
  }
}
