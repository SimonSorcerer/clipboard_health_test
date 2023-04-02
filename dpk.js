const crypto = require('crypto');

/* 
    I have extracted constants from the code for easy reuse in unit tests 
    I can also move this to separate file for more clarity,
    These can be read on build time from some env config file or fetched runtime from some config service, etc...
*/
const TRIVIAL_PARTITION_KEY = '0';
const MAX_PARTITION_KEY_LENGTH = 256;

const HASH_ALGORITHM = 'sha3-512';
const HASH_ENCODING = 'hex';

exports.constants = {
    TRIVIAL_PARTITION_KEY,
    MAX_PARTITION_KEY_LENGTH,
    HASH_ALGORITHM,
    HASH_ENCODING,
};

const digestDataWithMaxLength = (data, max_length) => {
    const hash = crypto.createHash(HASH_ALGORITHM);

    const digest = hash.update(data).digest(HASH_ENCODING);
    if (digest.length > max_length) {
        return hash.update(digest).digest(HASH_ENCODING);
    }

    return digest;
};

exports.deterministicPartitionKey = (event) => {
    if (!event) {
        return TRIVIAL_PARTITION_KEY;
    }

    if (event.partitionKey) {
        return JSON.stringify(event.partitionKey);
    }

    const partitionKey = digestDataWithMaxLength(
        JSON.stringify(event),
        MAX_PARTITION_KEY_LENGTH
    );

    return partitionKey || TRIVIAL_PARTITION_KEY;
};
