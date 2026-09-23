import { server } from "./server.js";
import { DatabaseModel } from "./model/DatabaseModel.js";

const port: number = 3333;
const database = new DatabaseModel();

async function startServer() {
    const connected = await database.testeConexao();
    if (!connected) {
        console.error('Não foi possível conectar ao banco de dados');
        return;
    }

    try {
        await database.ensureUsuarioTable();
    } catch (error) {
        console.error('Falha ao garantir esquema de banco de dados:', error);
        return;
    }

    server.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}

startServer();