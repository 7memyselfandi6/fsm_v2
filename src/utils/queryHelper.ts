export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export const getPaginationMetadata = (totalCount: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    totalCount,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export const parseQueryParams = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = Math.min(parseInt(query.limit as string) || 20, 100);
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

  // Extract filters - exclude pagination/sort params
  const filters: FilterParams = {};
  const search = (query.search as string) || '';

  const reservedKeys = ['page', 'limit', 'sortBy', 'sortOrder', 'search'];
  
  Object.keys(query).forEach(key => {
    if (!reservedKeys.includes(key)) {
      const val = query[key];
      // Basic support for operators like key[gte]=10
      if (typeof val === 'object' && val !== null) {
        filters[key] = val;
      } else {
        filters[key] = val;
      }
    }
  });

  return { page, limit, sortBy, sortOrder, filters, search };
};

export const buildPrismaQuery = (params: any, searchFields: string[] = []) => {
  const { page, limit, sortBy, sortOrder, filters, search } = params;

  const where: any = { AND: [] };

  // 1. Process Filters
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (typeof value === 'object' && value !== null) {
      // Map common API operators to Prisma operators
      const operators: any = {};
      if (value.equals !== undefined) operators.equals = value.equals;
      if (value.notEquals !== undefined) operators.not = value.notEquals;
      if (value.greaterThan !== undefined) operators.gt = parseFloat(value.greaterThan) || value.greaterThan;
      if (value.lessThan !== undefined) operators.lt = parseFloat(value.lessThan) || value.lessThan;
      if (value.contains !== undefined) {
        operators.contains = value.contains;
        operators.mode = 'insensitive';
      }
      if (value.startsWith !== undefined) {
        operators.startsWith = value.startsWith;
        operators.mode = 'insensitive';
      }
      if (value.endsWith !== undefined) {
        operators.endsWith = value.endsWith;
        operators.mode = 'insensitive';
      }
      if (value.in !== undefined) operators.in = Array.isArray(value.in) ? value.in : [value.in];
      if (value.notIn !== undefined) operators.notIn = Array.isArray(value.notIn) ? value.notIn : [value.notIn];
      
      where.AND.push({ [key]: operators });
    } else {
      // Default to equals
      where.AND.push({ [key]: value });
    }
  });

  // 2. Process Search (Full-text / Fuzzy simulation)
  if (search && searchFields.length > 0) {
    const searchConditions = searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }));
    where.AND.push({ OR: searchConditions });
  }

  // Clean up empty AND
  if (where.AND.length === 0) delete where.AND;

  return {
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit
  };
};
