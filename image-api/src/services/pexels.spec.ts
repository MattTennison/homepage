import nock from 'nock';
import { search } from './pexels';
import successfulSearchResponse from '../fixtures/pexels/search.json'

jest.mock('../config', () => ({
    config: {
        ...jest.requireActual('../config').config,
        pexels: {
            apiToken: 'pexels-api-token'
        }
    }
}))

describe('Pexels', () => {
    beforeAll(() => {
        nock.disableNetConnect();
    });

    afterAll(() => {
        nock.enableNetConnect();
    })

    describe('#search', () => {
        let apiScope: nock.Scope;

        beforeEach(() => {
            apiScope = nock('https://api.pexels.com/v1')
        })

        it('returns results from the API', async () => {
            apiScope
                .get('/search?query=ocean')
                .matchHeader('Authorization', 'pexels-api-token')
                .reply(200, successfulSearchResponse);
            
            const result = await search({ query: 'ocean' });

            expect(result.photos).toHaveLength(15);
            expect(result.photos[0]).toEqual({
                id: 189349,
                src: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg'
            })
        });

        describe('error handling', () => {
            it('throws an error if the API returns malformed data', () => {
                apiScope
                    .get('/search?query=ocean')
                    .reply(200, { mangledData: 'foo' });
    
                return expect(search({ query: 'ocean' })).rejects.toBeTruthy();
            });
    
            it.each([201, 400, 500])('throws an error if the API returns %s status code', (statusCode) => {
                apiScope
                    .get('/search?query=ocean')
                    .reply(statusCode);
    
                return expect(search({ query: 'ocean' })).rejects.toBeTruthy();
            })
        })

    })
})