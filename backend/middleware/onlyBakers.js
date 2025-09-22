const onlyBakers = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'baker')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Only bakers or admins can perform this action.' });
    }
};

export default onlyBakers;