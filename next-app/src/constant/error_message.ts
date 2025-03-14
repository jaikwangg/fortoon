// export const EXPECTED_CONTENT_IS_FORM_DATA = "expected_content_is_form_data"
export enum ErrorMessage {
    EXPECTED_CONTENT_TYPE_IS_FORM_DATA = 1
}

export const GetErrorMesage = (errorMessage: ErrorMessage) : string => {
    // return [ErrorMessage[errorMessage], errorMessage]
    return ErrorMessage[errorMessage]
}