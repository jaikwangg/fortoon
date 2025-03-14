import { ZodTypeAny } from "zod";
import { z } from 'zod'

export const formDataToJsonObject = (formData: FormData) => {
    const data: { [key: string]: any } = {};

    formData.forEach((value, key) => (data[key] = value));

    return data
}

export const numericString = (schema: ZodTypeAny) => z.preprocess((a) => {
    if (typeof a === 'string') {
        return parseInt(a, 10)
    } else if (typeof a === 'number') {
        return a;
    } else {
        return undefined;
    }
}, schema);

// export const hasBodyRequest