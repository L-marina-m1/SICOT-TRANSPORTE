const HttpError = require('../core/errors/HttpError');
const { leerToken } = require('../modules/auth/token');
const { buscarUsuarioActivo } = require('../modules/auth/auth.service');

const ROLES = Object.freeze({ GERENCIA: 'gerencia', ADMIN_TI: 'admin_ti', CONDUCTOR: 'conductor' });

/** Exige un token válido ("Authorization: Bearer <token>") y deja el usuario en req.usuario. */
async function requiereAuth(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    const id = tipo === 'Bearer' && token ? leerToken(token) : null;
    if (!id) throw HttpError.unauthorized('Sesión inválida o expirada');

    const usuario = await buscarUsuarioActivo(id);
    if (!usuario) throw HttpError.unauthorized('Sesión inválida o expirada');

    req.usuario = usuario;
    next();
}

/** Permite el paso solo a los roles indicados. Debe ir después de requiereAuth. */
function permitirRoles(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario?.rol)) throw HttpError.forbidden();
        next();
    };
}

module.exports = { requiereAuth, permitirRoles, ROLES };
