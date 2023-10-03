const validarSenha = (req, res, next) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(401).json({ "message": "o usuário não está autenticado (logado)" })
    }
    if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ "message": "Senha incorreta, tente novamente." })
    }

    next()
}


module.exports = {
    validarSenha
}