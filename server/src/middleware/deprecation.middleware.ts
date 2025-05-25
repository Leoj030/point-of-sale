import { Request, Response, NextFunction } from 'express';

export const createDeprecationMiddleware = (
    newEndpointUrl: string,
    deprecationDate: Date,
) => {

    const deprecationDateTimeGMT = deprecationDate.toUTCString();

    return (req: Request, res: Response, next: NextFunction) => {
        let warningMessage = `299 - "This endpoint is deprecated. Use ${newEndpointUrl} instead."`;
        let linkHeader = `<${newEndpointUrl}>; rel="successor-version"`;

        warningMessage = `299 - "This endpoint is deprecated. Use ${newEndpointUrl} instead."`;

        res.set('Deprecation', deprecationDateTimeGMT);
        res.set('Link', linkHeader);
        res.set('Warning', warningMessage);

        next();
    };
};