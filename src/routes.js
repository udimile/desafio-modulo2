const express = require('express')
const { validarSenha } = require('./middleware')
const { listarContas, criarContas, atualizarContas, deletarContas, depositar, sacar, transferir, saldo, extrato } = require('./controller/contasbancarias')

const routes = express()

routes.get('/contas', validarSenha, listarContas)
routes.post('/contas', criarContas)
routes.put('/contas/:numeroConta/usuario', atualizarContas)
routes.delete('/contas/:numeroConta', deletarContas)
routes.post('/transacoes/depositar', depositar)
routes.post('/transacoes/sacar', sacar)
routes.post('/transacoes/transferir', transferir)
routes.get('/contas/saldo', saldo)
routes.get('contas/extrato', extrato)



module.exports = routes;