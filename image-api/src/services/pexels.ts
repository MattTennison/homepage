import axios from 'axios';
import * as t from 'io-ts';
import { isLeft } from 'fp-ts/Either'
import { config } from '../config';

const searchResponse = t.exact(
    t.type({
        photos: t.array(
            t.exact(
                t.type({
                    id: t.number,
                    src: t.type({
                        original: t.string
                    })
                })
            )
        )}
    )
);

const getClient = () => {
    return axios.create({
        baseURL: "https://api.pexels.com/v1",
        headers: {
            'Authorization': config.pexels.apiToken
        }
    });
}

export const search = async ({ query }: { query: string }) => {
    const pexels = getClient();
    const response = await pexels.get('search', { params: { query }});

    const decodedResponse = searchResponse.decode(response.data)

    if (isLeft(decodedResponse)) {
        throw new Error('pexels.api.malformed')
    }

    return {
        photos: decodedResponse.right.photos.map(photo => ({
            id: photo.id,
            src: photo.src.original
        }))
    }
};

export const fetchImageInBase64 = async ({ path }: { path: string }) => {
    const imageClient = axios.create({ 
        baseURL: 'https://images.pexels.com', 
        maxContentLength: config.pexels.maxImageSizeInBytes,
        validateStatus: status => status === 200
    })
    const result = await imageClient.get(path, { responseType: 'arraybuffer' });
    
    return Buffer.from(result.data, 'binary').toString('base64')
}