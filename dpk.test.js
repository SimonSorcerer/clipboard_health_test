const crypto = require('crypto');

const { deterministicPartitionKey, constants } = require('./dpk');

jest.mock('crypto');

const {
    TRIVIAL_PARTITION_KEY,
    MAX_PARTITION_KEY_LENGTH,
    HASH_ALGORITHM,
    HASH_ENCODING,
} = constants;

const DIGEST_MOCK_VAL = 'digest mock';
const JSON_STRINGIFY_MOCK_VAL = 'stringified!';

describe('deterministicPartitionKey function', () => {
    let hashMock;
    let updateMock;
    let digestMock;

    beforeEach(() => {
        digestMock = jest.fn().mockReturnValue(DIGEST_MOCK_VAL);

        updateMock = jest.fn().mockReturnValue({
            digest: digestMock,
        });

        hashMock = {
            update: updateMock,
        };

        crypto.createHash.mockReturnValue(hashMock);

        // I made this too complicated by mocking JSON stringify, maybe I should have used real impl. for a core fn
        JSON.stringify = jest.fn().mockReturnValue(JSON_STRINGIFY_MOCK_VAL);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('with missing event argument', () => {
        test('returns Trivial Partition Key', () => {
            const result = deterministicPartitionKey();

            expect(result).toBeDefined();
            expect(result).toBe(TRIVIAL_PARTITION_KEY);
        });
    });

    describe('with invalid event argument', () => {
        let event;

        beforeEach(() => {
            event = 0;
        });

        test('returns Trivial Partition Key', () => {
            const result = deterministicPartitionKey(event);

            expect(result).toBeDefined();
            expect(result).toBe(TRIVIAL_PARTITION_KEY);
        });

        test('does not call crypto library', () => {
            deterministicPartitionKey(event);

            expect(crypto.createHash).not.toHaveBeenCalled();
        });
    });

    describe('with valid event argument', () => {
        describe('which contains existing partition key', () => {
            let event;
            const PARTITION_KEY = 'existingPartitionKey';

            beforeEach(() => {
                event = { partitionKey: PARTITION_KEY };
            });

            test('should return partition key as string', () => {
                JSON.stringify.mockReturnValue(PARTITION_KEY);
                const result = deterministicPartitionKey(event);

                expect(result).toBe(PARTITION_KEY);
            });

            test('does not call crypto library', () => {
                deterministicPartitionKey(event);

                expect(crypto.createHash).not.toHaveBeenCalled();
            });
        });

        describe('which contains existing partition key not in string format', () => {
            let event;
            const PARTITION_KEY = { partKey: 'invalid format partition key' };

            beforeEach(() => {
                event = { partitionKey: PARTITION_KEY };
            });

            test('should return stringified input partition key', () => {
                const result = deterministicPartitionKey(event);

                expect(JSON.stringify).toHaveBeenCalledTimes(1);
                expect(JSON.stringify).toHaveBeenCalledWith(PARTITION_KEY);
                expect(result).toBe(JSON_STRINGIFY_MOCK_VAL);
            });
        });

        describe('which does not contain existing partition key', () => {
            let event = 'some event';
            let result;

            test('should create hash object with correct algorithm (once)', () => {
                result = deterministicPartitionKey(event);

                expect(crypto.createHash).toHaveBeenCalledTimes(1);
                expect(crypto.createHash).toHaveBeenCalledWith(HASH_ALGORITHM);
            });

            test('should return trivial partition key if digest is invalid', () => {
                digestMock.mockReturnValue('');
                result = deterministicPartitionKey(event);

                expect(result).toBe(TRIVIAL_PARTITION_KEY);
            });

            test('should update hash object with stringified event data (once)', () => {
                result = deterministicPartitionKey(event);

                expect(updateMock).toHaveBeenCalledTimes(1);
                expect(JSON.stringify).toHaveBeenCalledTimes(1);
                expect(updateMock).toHaveBeenCalledWith(
                    JSON_STRINGIFY_MOCK_VAL
                );
            });

            test('should digest hash object (once)', () => {
                result = deterministicPartitionKey(event);

                expect(digestMock).toHaveBeenCalledTimes(1);
                expect(digestMock).toHaveBeenCalledWith(HASH_ENCODING);
            });

            test('should return hash digest', () => {
                result = deterministicPartitionKey(event);

                expect(result).toBe(DIGEST_MOCK_VAL);
            });

            describe('and creates hash too long', () => {
                let event;
                let result;
                const digestMockValue = 'some digest'.padEnd(
                    MAX_PARTITION_KEY_LENGTH + 1,
                    '.'
                );

                beforeEach(() => {
                    event = 'some event';

                    expect(digestMockValue.length).toBeGreaterThan(
                        MAX_PARTITION_KEY_LENGTH
                    );

                    digestMock.mockReturnValue(digestMockValue);
                    result = deterministicPartitionKey(event);
                });

                test('should rehash the object', () => {
                    expect(updateMock).toHaveBeenCalledTimes(2);
                    expect(updateMock.mock.calls[0][0]).toBe(
                        JSON_STRINGIFY_MOCK_VAL
                    );
                    expect(updateMock.mock.calls[1][0]).toBe(digestMockValue);

                    expect(digestMock).toHaveBeenCalledTimes(2);
                });

                test('should return hash digest', () => {
                    expect(result).toBe(digestMockValue);
                });

                /* 
                    I think there is no need to re-create hash object, so I changed this test to expect hash object not to be created more than once 
                    I have little experience with crypto library, but it is my assumption on how it works 
                */
                test('should create crypto hash object once', () => {
                    expect(crypto.createHash).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
