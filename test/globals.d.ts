declare global {
    /*
            Para que o typescript não considere esse arquivo como módulo local,
            impedindo sobreescrevermos o tipo global, temos que utilizar um import 
            inline ao invés de import padrão (import supertest from "supertest")
        */
    var testRequest: import("supertest").SuperTest<import("supertest").Test>;
}

export {};
