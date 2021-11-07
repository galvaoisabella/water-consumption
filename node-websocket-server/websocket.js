var WebSocketServer = require('websocket').server;
var http = require('http');
var actualMonth;
var beforeMonth;

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'isabella',
    password: '123456',
    database: 'bdarduino'
});

//Porta que o server irá escutar
const port = 80;

//Cria o server
var server = http.createServer();

//Server irá escutar na porta definida em 'port'
server.listen(port, () => {
    //Server está pronto
    console.log(`Server está executando na porta ${port}`);
});

//Cria o WebSocket server
wsServer = new WebSocketServer({
    httpServer: server
});

//Chamado quando um client deseja conectar
wsServer.on('request', (request) => {
    //Estado do led: false para desligado e true para ligado
    let state = false;

    //Aceita a conexão do client
    let client = request.accept(null, request.origin);

    //Chamado quando o client envia um valor
    client.on('message', (message) => {
        //Se é uma mensagem string utf8
        if (message.type === 'utf8') {
            //Mostra no console a mensagem
            console.log(message.utf8Data);

            if (message.utf8Data !== 'Hello Server') {
                const date = new Date();
                const createdAt = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                const beforeMonth = date.getMonth();

                const volume = message.utf8Data;

                //INSERT NA TABELA
                const sqlInsert = 'INSERT INTO tables(sensor, createdAt, updatedAt) VALUES (?,?,?);';
                const values = [volume, createdAt, '2021-09-20 00:15:28'];
                connection.query(sqlInsert, values, (err, rows) => {
                    if (!err) {
                        console.log('Sucesso na query', rows);
                    } else {
                        console.log('Erro na query');
                    }
                });
            }
        }
    });

    // Teste com led - Cria uma função que será executada a cada 1 hora (3600000ms) para enviar zerar contador de volume
    let interval = setInterval(() => {
        // Reseta volume a cada mês
        const date = new Date();
        actualMonth = date.getMonth();
        if(actualMonth > beforeMonth) {
            client.sendUTF('Reset volume');
        }
    }, 3600000);//Tempo entre chamadas => 3600000ms = 1 hora

    //Chamado quando a conexão com o client é fechada
    client.on('close', () => {
        console.log("Conexão fechada");
        //Remove o intervalo de envio de estado (teste com led)
        clearInterval(interval);
    });
});