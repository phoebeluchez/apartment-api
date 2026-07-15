class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;         // Mongoose query object
    this.queryString = queryString; // req.query
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // convert gte/gt/lte/lt to Mongo operators, e.g. priority[gte]=2
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(searchableFields = []) {
    if (this.queryString.search && searchableFields.length > 0) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchConditions = searchableFields.map((field) => ({
        [field]: searchRegex,
      }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;