const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;

export default function paginationMiddleware(req, res, next) {
  try {
    const { limit: qLimit, page: qPage } = req.query || {};

    let limit = parseInt(qLimit, 10);
    let page = parseInt(qPage, 10);

    if (Number.isNaN(limit) || limit <= 0) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    if (Number.isNaN(page) || page <= 0) page = DEFAULT_PAGE;

    req.pagination = {
      limit,
      page,
      skip: (page - 1) * limit
    };

    next();
  } catch (err) {
    next(err);
  }
}
