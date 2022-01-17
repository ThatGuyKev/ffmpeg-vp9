import util from 'util'
import format from 'string-template'
import shell from 'shelljs'
const exec = util.promisify(require('child_process').exec)


const AWS_BIN = shell.which('aws');

const SYNC_BASE = AWS_BIN + `\
 s3 sync /tmp/winggo-vod s3://winggo-test-bucket`


export const syncS3 = async () => {
    if (!AWS_BIN) {
        throw new Error(`AWS not found`);
    }

    let result = await exec(format(SYNC_BASE));

    console.log(result)

}