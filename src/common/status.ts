import { NextApiResponse } from "next";

export type ErrorMessage = {
  message: string | null;
  code: string | number;
  // explicit http status to be used by sendError when available
  status?: number;
};

export const NotAllowedMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 405;
  const isNumberCode = typeof code === "number";
  return {
    message:
      msg !== undefined
        ? msg
        : code === undefined
        ? "Method Not Allowed"
        : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const InternalErrorMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 500;
  const isNumberCode = typeof code === "number";
  return {
    message:
      msg !== undefined
        ? msg
        : code === undefined
        ? "Internal Server Error"
        : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const BadRequestMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 400;
  const isNumberCode = typeof code === "number";
  return {
    message:
      msg !== undefined ? msg : code === undefined ? "Bad Request" : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const NotFoundMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 404;
  const isNumberCode = typeof code === "number";
  return {
    message: msg !== undefined ? msg : code === undefined ? "Not Found" : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const ConflictMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 409;
  const isNumberCode = typeof code === "number";
  return {
    message: msg !== undefined ? msg : code === undefined ? "Conflict" : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const UnauthorizedMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 401;
  const isNumberCode = typeof code === "number";
  return {
    message:
      msg !== undefined ? msg : code === undefined ? "Unauthorized" : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const ForbiddenMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 403;
  const isNumberCode = typeof code === "number";
  return {
    message: msg !== undefined ? msg : code === undefined ? "Forbidden" : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const ServiceUnavailableMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 503;
  const isNumberCode = typeof code === "number";
  return {
    message:
      msg !== undefined
        ? msg
        : code === undefined
        ? "Service Unavailable"
        : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const GatewayTimeoutMessage = (
  code?: string | number,
  msg?: string
): ErrorMessage => {
  const status = 504;
  const isNumberCode = typeof code === "number";
  return {
    message:
      msg !== undefined ? msg : code === undefined ? "Gateway Timeout" : null,
    code: code ?? status,
    status: isNumberCode ? (code as number) : status,
  };
};

export const CustomErrorMessage = (
  code: string | number,
  msg: string
): ErrorMessage => ({
  message: msg,
  code,
  status: typeof code === "number" ? (code as number) : 500,
});

export const sendError = (res: NextApiResponse, error: ErrorMessage) => {
  // Prefer explicit `status` if provided, otherwise fall back to numeric `code`.
  const statusCode =
    error.status ??
    (typeof error.code === "number" ? (error.code as number) : 500);
  return res.status(statusCode).json(error);
};

export const Status = (res: NextApiResponse) => ({
  Ok: (data: unknown) => res.status(200).json(data),
  Created: (data: unknown) => res.status(201).json(data),
  NoContent: () => res.status(204).end(),
  NotAllowed: (code?: string | number, msg?: string) =>
    sendError(res, NotAllowedMessage(code, msg)),
  InternalError: (code?: string | number, msg?: string) =>
    sendError(res, InternalErrorMessage(code, msg)),
  BadRequest: (code?: string | number, msg?: string) =>
    sendError(res, BadRequestMessage(code, msg)),
  NotFound: (code?: string | number, msg?: string) =>
    sendError(res, NotFoundMessage(code, msg)),
  Conflict: (code?: string | number, msg?: string) =>
    sendError(res, ConflictMessage(code, msg)),
  Unauthorized: (code?: string | number, msg?: string) =>
    sendError(res, UnauthorizedMessage(code, msg)),
  Forbidden: (code?: string | number, msg?: string) =>
    sendError(res, ForbiddenMessage(code, msg)),
  ServiceUnavailable: (code?: string | number, msg?: string) =>
    sendError(res, ServiceUnavailableMessage(code, msg)),
  GatewayTimeout: (code?: string | number, msg?: string) =>
    sendError(res, GatewayTimeoutMessage(code, msg)),
  CustomError: (code: string | number, msg: string) =>
    sendError(res, CustomErrorMessage(code, msg)),
});

export default Status;
