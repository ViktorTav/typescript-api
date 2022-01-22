import * as path from "path";
import moduleAlias from "module-alias";

//Importa todos os arquivos da pasta raiz do projeto.
const files = path.resolve(__dirname, "../..");

/*
    Usamos o moduleAlias no projeto para que depois que o código do mesmo
    seja compilado, não termos erros por estarmos usando os paths (@src,@test)
    que foram configurados em tsconfig.json.
*/
moduleAlias.addAliases({
    "@src": path.join(files, "src"),
    "@test": path.join(files, "test"),
});
