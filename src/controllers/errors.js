const notFoundHandler = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
};

const errorHandler = (err, req, res, next) => {
    const status = err && err.status ? err.status : 500;
    const environment = process.env.NODE_ENV?.toLowerCase() || 'production';
    const isDevelopment = environment === 'development';
    const title = status === 404 ? 'Page Not Found' : 'Server Error';

    console.error(`Error ${status} on ${req.method} ${req.url}:`, err && err.stack ? err.stack : err?.message);

    if (status === 404) {
        return res.status(status).render('errors/404', {
            title,
            error: 'Page Not Found',
            stack: isDevelopment ? err.stack : null,
            NODE_ENV: environment
        });
    }

    return res.status(status).render('errors/500', {
        title,
        error: err && err.message ? err.message : 'Something went wrong.',
        stack: isDevelopment ? err.stack : null,
        NODE_ENV: environment
    });
};

export { notFoundHandler, errorHandler };
