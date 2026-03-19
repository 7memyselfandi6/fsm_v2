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

/**
 * Parses query parameters for advanced pagination, filtering, and search.
 * Example: ?page=1&limit=20&sortBy=name:asc,createdAt:desc&status[in]=APPROVED,PENDING&amount[greaterThan]=100&search=kebele
 */
export const parseQueryParams = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = Math.min(parseInt(query.limit as string) || 20, 100);
  const sortByParam = (query.sortBy as string) || 'createdAt:desc';
  const search = (query.search as string) || '';

  // Parse multi-field sorting: "field1:asc,field2:desc"
  const orderBy: any[] = sortByParam.split(',').map(item => {
    const [field, order] = item.split(':');
    return { [field]: order === 'desc' ? 'desc' : 'asc' };
  });

  const filters: FilterParams = {};
  const reservedKeys = ['page', 'limit', 'sortBy', 'sortOrder', 'search', 'logic'];
  const logic = (query.logic as string)?.toUpperCase() === 'OR' ? 'OR' : 'AND';

  Object.keys(query).forEach(key => {
    if (!reservedKeys.includes(key)) {
      const val = query[key];
      // Support nested filter objects like status[in]=...
      if (typeof val === 'object' && val !== null) {
        filters[key] = val;
      } else {
        filters[key] = val;
      }
    }
  });

  return { page, limit, orderBy, filters, search, logic };
};

/**
 * Builds a Prisma query object from parsed parameters.
 */
export const buildPrismaQuery = (params: any, searchFields: string[] = []) => {
  const { page, limit, orderBy, filters, search, logic } = params;

  const where: any = { [logic]: [] };

  // 1. Process Filters
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    const fieldQuery: any = {};

    if (typeof value === 'object' && value !== null) {
      // Advanced Operators
      if (value.equals !== undefined) fieldQuery.equals = value.equals;
      if (value.notEquals !== undefined) fieldQuery.not = value.notEquals;
      if (value.greaterThan !== undefined) fieldQuery.gt = isNaN(Number(value.greaterThan)) ? value.greaterThan : Number(value.greaterThan);
      if (value.lessThan !== undefined) fieldQuery.lt = isNaN(Number(value.lessThan)) ? value.lessThan : Number(value.lessThan);
      
      // Date Range Support (if value is ISO string or similar)
      if (value.after !== undefined) fieldQuery.gte = new Date(value.after);
      if (value.before !== undefined) fieldQuery.lte = new Date(value.before);

      if (value.contains !== undefined) {
        fieldQuery.contains = value.contains;
        fieldQuery.mode = 'insensitive';
      }
      if (value.startsWith !== undefined) {
        fieldQuery.startsWith = value.startsWith;
        fieldQuery.mode = 'insensitive';
      }
      if (value.endsWith !== undefined) {
        fieldQuery.endsWith = value.endsWith;
        fieldQuery.mode = 'insensitive';
      }
      
      if (value.in !== undefined) {
        const list = Array.isArray(value.in) ? value.in : value.in.split(',');
        fieldQuery.in = list.map((i: string) => isNaN(Number(i)) ? i : Number(i));
      }
      if (value.notIn !== undefined) {
        const list = Array.isArray(value.notIn) ? value.notIn : value.notIn.split(',');
        fieldQuery.notIn = list.map((i: string) => isNaN(Number(i)) ? i : Number(i));
      }

      if (Object.keys(fieldQuery).length > 0) {
        where[logic].push({ [key]: fieldQuery });
      }
    } else {
      // Default to simple equals
      where[logic].push({ [key]: isNaN(Number(value)) ? value : Number(value) });
    }
  });

  // 2. Advanced Search (Simulation of Relevance/Ranking via weights)
  if (search && searchFields.length > 0) {
    const searchConditions = searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }));
    where[logic].push({ OR: searchConditions });
  }

  // Clean up if empty
  if (where[logic].length === 0) delete where[logic];

  return {
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit
  };
};
