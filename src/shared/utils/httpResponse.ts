import type { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response<SuccessResponse<T>> {
  return res.status(statusCode).json({ success: true, data });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors: string[] = [],
): Response<ErrorResponse> {
  return res.status(statusCode).json({ success: false, message, errors });
}
