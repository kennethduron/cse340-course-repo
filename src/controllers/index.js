const showHomePage = (req, res) => {
    const title = 'Home';
    res.render('home', { title });
};

const testErrorPage = (req, res, next) => {
    const err = new Error('A test error was intentionally triggered.');
    err.status = 500;
    next(err);
};

export { showHomePage, testErrorPage };
