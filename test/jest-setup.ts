/*
    Esse setup é executado antes do jest rodar os arquivos de testes em si, sendo 
    bem útil para configurar coisas como servidor, banco de dados, entre outras coisas, 
    permitindo que os testes funcionem corretamente. 
*/

import { SetupServer } from "@src/server";
import supertest from "supertest";

let server: SetupServer;

beforeAll(async () => {
    server = new SetupServer();
    await server.init();

    /*
        Para utilizarmos o nosso app em qualquer arquivo de teste, iremos
        definir o mesmo como uma propriedade global, porém como o global do nodejs,
        por padrão, não contém essa propriedade, iremos adiciona-lá através do arquivo
        globals.d.ts, presente na pasta de test (que é essa :>)
    */
    global.testRequest = supertest(server.getApp());
});

/*
    Após finalizarmos os testes, utilizamos o método close para encerrar processos
    como o do banco de dados.
*/
afterAll(async () => {
    await server.close();
});
