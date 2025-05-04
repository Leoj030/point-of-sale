interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: T;
}

export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => {
    return {
        success: true,
        message,
        data
    }
}

export const errorResponse = <T>(message: string, error?: T): ApiResponse<T> => {
    return {
        success: false,
        message,
        error
    }
}