let { contas, saques, depositos, transferencias } = require('../bancodedados')

let idProximaConta = 1

const listarContas = (req, res) => {
    res.status(200).json(contas)
}

const criarContas = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ "message": "o servidor não entendeu a requisição pois está com uma sintaxe/formato inválido" })

    }

    const validacaoConta = contas.find(conta => cpf === conta.cpf || email === conta.email)

    if (validacaoConta) {
        return res.status(400).json({ "message": "Já existe uma conta com o cpf ou e-mail informado!" })
    }


    const novaConta = {
        numeroConta: idProximaConta++,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha,
        saldo: 0
    }

    contas.push(novaConta)

    res.status(201).send()

}

const atualizarContas = (req, res) => {

    const { numeroConta } = req.params

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    let encontrarConta = contas.find(conta => conta.numeroConta === Number(numeroConta))

    if (!encontrarConta) {
        return res.status(400).json({ "message": "Conta não encontrada" })
    }

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ "message": "o servidor não entendeu a requisição pois está com uma sintaxe/formato inválido" })

    }

    const validacaoCPF = contas.find((conta) => {
        conta.cpf === cpf && conta.numeroConta !== Number(numeroConta)
    })

    const validacaoEmail = contas.find((conta) => {
        conta.email === email && conta.numeroConta !== Number(numeroConta)
    })

    if (validacaoCPF && validacaoEmail) {
        return res.status(400).json({ "message": "Já existe uma conta com o cpf ou e-mail informado!" })
    }

    encontrarConta.nome = nome
    encontrarConta.cpf = cpf
    encontrarConta.data_nascimento = data_nascimento
    encontrarConta.telefone = telefone
    encontrarConta.email = email
    encontrarConta.senha = senha

    res.status(204).send()
}

const deletarContas = (req, res) => {
    const { numeroConta } = req.params

    const contaIndex = contas.findIndex(conta => conta.numeroConta === Number(numeroConta))

    if (contaIndex == -1) {
        return res.status(400).json({ "message": "Conta não existe" })
    }

    if (contas[contaIndex].saldo !== 0) {
        return res.status(400).json({ "mensagem": "A conta só pode ser removida se o saldo for zero!" })
    }

    contas.splice(contaIndex, 1)

    res.status(204).send()
}

const depositar = (req, res) => {
    const { numeroConta, valor } = req.body;

    if (!numeroConta || !valor) {
        return res.status(400).json({ "message": "O número da conta e o valor são obrigatórios!" })
    }

    const verificarConta = contas.find(conta => conta.numeroConta === Number(numeroConta))

    if (!verificarConta) {
        return res.status(400).json({ "message": "Conta não existe" })
    }

    if (Number(valor) <= 0) {
        return res.status(400).json({ "message": "Valor informado é inválido!" })
    }

    verificarConta.saldo = verificarConta.saldo + valor

    const novoDeposito = {
        data: new Date().toISOString(),
        numeroConta,
        valor
    }

    depositos.push(novoDeposito)

    res.status(201).send()

}

const sacar = (req, res) => {
    const { numeroConta, valor, senha } = req.body;

    if (!numeroConta || !valor || !senha) {
        return res.status(400).json({ "message": "O número da conta e o valor são obrigatórios!" })
    }

    const verificarConta = contas.find(conta => conta.numeroConta === Number(numeroConta))

    if (!verificarConta) {
        return res.status(400).json({ "message": "Conta não existe" })
    }

    if (senha !== verificarConta.senha) {
        return res.status(400).json({ "message": "A senha não confere." })
    }

    if (verificarConta.saldo < valor) {
        return res.status(400).json({ "message": "Saldo insuficiente!" })
    }

    if (Number(valor) <= 0) {
        return res.status(400).json({ "message": "Valor informado é inválido!" })
    }

    verificarConta.saldo = verificarConta.saldo - valor

    const novoSaque = {
        data: new Date().toISOString(),
        numeroConta,
        valor
    }

    saques.push(novoSaque)

    res.status(201).send()
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_destino || !numero_conta_origem || !valor || !senha) {
        return res.status(400).json({ "message": "Todos os campos devem ser informados." })
    }

    let verificarContaDestino = contas.find(conta => conta.numeroConta === Number(numero_conta_destino))

    let verificarContaOrigem = contas.find(conta => conta.numeroConta === Number(numero_conta_origem))

    if (!verificarContaDestino || !verificarContaOrigem) {
        return res.status(400).json({ "message": "Conta informada não existe." })
    }

    if (verificarContaOrigem.senha !== senha) {
        return res.status(400).json({ "message": "A senha não confere." })
    }

    if (verificarContaOrigem.saldo < Number(valor)) {
        return res.status(400).json({ "message": "Saldo insuficiente!" })
    }

    verificarContaOrigem.saldo = verificarContaOrigem.saldo - Number(valor);
    verificarContaDestino.saldo = verificarContaDestino.saldo + Number(valor);


    const novaTransferencia = {
        data: new Date().toISOString(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    transferencias.push(novaTransferencia)

    res.status(204).send()
}

const saldo = (req, res) => {

    const numeroConta = Number(req.query.numero_conta)
    const { senha } = req.query

    if (!numeroConta || !senha) {
        return res.status(400).json({ "message": "Numero da conta e senha devem ser informadas." })
    }

    const verificarConta = contas.find(conta => conta.numeroConta === Number(numeroConta))

    if (!verificarConta) {
        return res.status(400).json({ "message": "Conta bancária não encontada!" })
    }

    if (senha !== verificarConta.senha) {
        return res.status(401).json({ "message": "Senha incorreta." })
    }

    res.status(200).json({ "saldo": verificarConta.saldo })

}

const extrato = (req, res) => {

    const numeroConta = Number(req.query.numero_conta)
    const { senha } = req.query

    if (!numeroConta || !senha) {
        return res.status(400).json({ "message": "Numero da conta e senha devem ser informadas." })
    }

    const verificarConta = contas.find(conta => conta.numeroConta === Number(numeroConta))

    if (!verificarConta) {
        return res.status(400).json({ "message": "Conta bancária não encontada!" })
    }

    if (senha !== verificarConta.senha) {
        return res.status(401).json({ "message": "Senha incorreta." })
    }

    const filtroDeposito = depositos.filter(conta => numeroConta === conta.numeroConta)

    const filtroSaques = saques.filter(conta => numeroConta === conta.numeroConta)

    const filtroTransferenciaRecebidas = transferencias.filter(conta => numeroConta === conta.numero_conta_destino)

    const filtroTransferenciaEnviadas = transferencias.filter(conta => numeroConta === conta.numero_conta_origem)

    res.status(200).json({
        "depositos": filtroDeposito,
        "saques": filtroSaques,
        "transferenciasEnviadas": filtroTransferenciaEnviadas,
        "filtroTransferenciaRecebidas": filtroTransferenciaRecebidas
    })

}

module.exports = {
    listarContas, criarContas, atualizarContas, deletarContas, depositar, sacar, transferir, saldo, extrato
}