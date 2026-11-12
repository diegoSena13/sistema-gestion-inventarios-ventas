
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Se requiere un token de autenticación'
        });
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = { verificarToken };
