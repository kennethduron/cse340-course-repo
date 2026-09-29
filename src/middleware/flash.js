const emptyMessages = () => ({ success: [], error: [], warning: [], info: [] });

const flash = (req, res, next) => {
    req.flash = function flashMessages(type, message) {
        if (!req.session.flash) req.session.flash = emptyMessages();
        if (arguments.length === 2) {
            if (!req.session.flash[type]) req.session.flash[type] = [];
            req.session.flash[type].push(message);
            return undefined;
        }
        if (arguments.length === 1) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }
        const messages = req.session.flash;
        req.session.flash = emptyMessages();
        return messages;
    };
    res.locals.flash = req.flash;
    next();
};

export default flash;
