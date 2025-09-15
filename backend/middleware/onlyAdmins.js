// middleware/onlyAdmins.js
const onlyAdmins = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: only admins can add products' });
  }
  next();
};

export default onlyAdmins;
