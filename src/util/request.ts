import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

/*eslint-disable @typescript-eslint/no-empty-interface*/
interface RequestConfig extends AxiosRequestConfig {}

/*eslint-disable @typescript-eslint/no-explicit-any*/
interface Response<T = any> extends AxiosResponse<T> {}

class Request {
    constructor(private request = axios) {}

    public get<T>(
        url: string,
        config: RequestConfig = {}
    ): Promise<Response<T>> {
        return this.request.get<T, Response<T>>(url, config);
    }

    /*
        O operador ?. serve para testar propriedades opcionais, ou seja, o mesmo nos permite
        verificar se uma propriedade existe ou não dentro de um objeto.

        Exemplo:

        if (axiosError?.response?.status){}
        ==
        if(axiosError && axiosError.response && axiosError.response.status);
    */
    public static isRequestError(error: Error): boolean {
        return !!(error as AxiosError)?.response?.status;
    }

    /*
        O tipo Pick permite que construimos um novo tipo escolhendo propriedades de um
        tipo pré-existente, nesse caso, o AxiosResponse.
    */
    public static extractErrorData(
        error: unknown
    ): Pick<AxiosResponse, "data" | "status"> {
        const axiosError = error as AxiosError;
        if (axiosError?.response?.status) {
            return {
                data: axiosError.response.data,
                status: axiosError.response.status,
            };
        }

        throw new Error(`The Error ${error} is not a Request Error`);
    }
}

export { Request, RequestConfig, Response };
