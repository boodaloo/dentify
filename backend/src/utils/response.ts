import { Response } from 'express';

export const ok = (res: Response, data: unknown, status = 200) => {
  return res.status(status).json({ success: true, data });
};

export const created = (res: Response, data: unknown) => ok(res, data, 201);

export const paginated = (
  res: Response,
  items: unknown[],
  total: number,
  page: number,
  limit: number,
) => {
  return res.json({
    success: true,
    data: { items, total, page, limit, pages: Math.ceil(total / limit) },
  });
};

export const error = (res: Response, message: string, status = 400) => {
  return res.status(status).json({ success: false, error: message });
};

export const serverError = (res: Response, err: unknown) => {
  console.error(err);
  return res.status(500).json({ success: false, error: 'Internal server error' });
};
