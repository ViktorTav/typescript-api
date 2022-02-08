import httpStatusCode from "http-status-codes";

interface APIError {
    message: string;
    code: number;
    codeAsString?: string;
    description?: string;
    documentation?: string;
}

interface APIErrorResponse extends Omit<APIError, "codeAsString"> {
    error: string;
}

class ApiError {
    public static format(error: APIError): APIErrorResponse {
        return {
            message: error.message,
            code: error.code,
            error:
                error.codeAsString || httpStatusCode.getStatusText(error.code),
            ...(error.documentation && { documentation: error.documentation }),
            ...(error.description && { description: error.description }),
        };
    }
}

export default ApiError;
export { APIError, APIErrorResponse };
