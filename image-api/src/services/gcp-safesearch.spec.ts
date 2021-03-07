import nock from "nock"
import successfulSafeSearchResponse from '../fixtures/gcp/safesearch.json';
import { clone } from "../utils/clone";
import { analyse } from "./gcp-safesearch";

jest.mock('../config', () => ({
    config: {
        ...jest.requireActual('../config').config,
        gcp: {
            apiToken: 'GCP-token'
        }
    }
}))

describe('GCP SafeSearch Image Detection', () => {
    beforeAll(() => {
        nock.disableNetConnect();
    });

    afterAll(() => {
        nock.enableNetConnect();
    });

    describe('#analyse', () => {
        let apiScope: nock.Scope;

        const expectedRequestBody = {
            "requests": [
                {
                    "image": {
                        "content": "base64-encoded-image"
                    },
                    "features": [
                        { "type": "SAFE_SEARCH_DETECTION" }
                    ]
                }
            ]
        }

        beforeEach(() => {
            apiScope = nock('https://vision.googleapis.com/v1');
        })

        it('returns results from the API', async () => {
            apiScope
                .post('/images:annotate', expectedRequestBody)
                .matchHeader('Authorization', 'Bearer GCP-token')
                .reply(200, successfulSafeSearchResponse);
            
            const result = await analyse({ imageInBase64: "base64-encoded-image" });

            expect(result).toEqual({
                safeSearch: {
                    adult: "UNLIKELY",
                    spoof: "VERY_UNLIKELY",
                    medical: "VERY_UNLIKELY",
                    violence: "LIKELY",
                    racy: "POSSIBLE"
                }
            });
        });

        describe('error handling', () => {
            it('throws an error if the API returns malformed data', () => {
                apiScope
                    .post('/images:annotate', expectedRequestBody)
                    .reply(200, { mangledData: 'foo' });
                
                return expect(analyse({ imageInBase64: "base64-encoded-image" })).rejects.toBeTruthy();
            });

            it('throws an error if the API returns an empty responses array', () => {
                const emptyResponses = {
                    ...clone(successfulSafeSearchResponse),
                    responses: []
                };

                apiScope
                    .post('/images:annotate', expectedRequestBody)
                    .reply(200, emptyResponses);
            
                return expect(analyse({ imageInBase64: "base64-encoded-image" })).rejects.toBeTruthy();
            })

            it.each([201, 400, 500])('throws an error if the API returns %s status code', (statusCode) => {
                apiScope
                    .post('/images:annotate', expectedRequestBody)
                    .reply(statusCode);
    
                return expect(analyse({ imageInBase64: "base64-encoded-image" })).rejects.toBeTruthy();
            })
        })
    })
})