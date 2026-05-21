// Helper to create API features: pagination, filtering, searching, sorting
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Search by keyword
  search(fields = ['name']) {
    const keyword = this.queryStr.keyword
      ? {
          $or: fields.map((field) => ({
            [field]: { $regex: this.queryStr.keyword, $options: 'i' },
          })),
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // Filter by query parameters
  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Advanced filtering (gt, gte, lt, lte, in)
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort results
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Paginate results
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit, skip };
    return this;
  }

  // Select specific fields
  selectFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }
}

export default ApiFeatures;
