
//
// ─── API FEATURE ─────────────────────────────────────────────────────────────────
//
const apiFeature = (model, populateOpt) => async (req, res, next) => {
    let query;

    const queryObj = {...req.query}

    // Explode fields
    const explodeFields = ['select', 'sort', 'page', 'limit'];
    explodeFields.forEach( field => delete queryObj[field]);


    // Filter
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = model.find(JSON.parse(queryString));

    
    // Selecte fields
    if(req.query.select){
        const fieldBy = req.query.select.split(',').join(' ');
        query = query.select(fieldBy);
    }

    // Sorting
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalIndex = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);


    // Populate
    if(populateOpt){
        query = query.populate(populateOpt);
    }

    // Execution query //
    docs = await query;


    // Pagination result
    const pagination = {};
    // Next page
    if(endIndex < totalIndex){
        pagination.next = { 
            page: page + 1,
            limit
        }
    }
    // Previous page
    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }


    res.apiFeature = {
        status: 'success',
        count: docs.length,
        pagination,
        data: docs
    }

    next();
}

module.exports = apiFeature;