const fetch = require('node-fetch')
const dayjs = require('dayjs')
const { Storage } = require('@google-cloud/storage')
const { mapResults } = require('./helper')

const storage = new Storage()
const { NODEPING_API_TOKEN, NODEPING_API_ROOT, BUCKET } = require('./config')

const saveToBucket = async ({ fileName, result }) => {
  if(result.length === 0) {
    console.info('--> Result is empty')
    return
  }
  const bucket = storage.bucket(BUCKET)
  const gcsFileName = `${fileName}.json`

  const file = bucket.file(gcsFileName)
  const resultDelimited = result.map(r => JSON.stringify(r)).join('\n')
  return new Promise((resolve, reject) => file.save(resultDelimited, (err) => {
    if (err) {
      console.error(err)
      return reject('Error while uploading to storage')
    }
    console.info('--> Saved check results into the bucket.')
    resolve()
  }))
}

exports.saveToBucket = saveToBucket
exports.fetchAndStoreCheckResult = async ({ seconds, check }) => {
  const reportUrl = [NODEPING_API_ROOT,
    `1/results/${check._id}/`,
    '?clean=true&',
    `limit=${((seconds / 60) + 5)}&`,
    `start=${dayjs().subtract(seconds, 'seconds').toISOString()}`,
    `&token=${NODEPING_API_TOKEN}`].join('')

  console.info(`--> Getting check results ${check.parameters.target}`)

  await fetch(`${reportUrl}`)
    .then(res => res.json())
    .then((checkResults) => {
      console.info(`--> Check results are downloaded for ${check.parameters.target}, count : ${checkResults.length}`)
      return {
        fileName: `${dayjs().subtract(seconds, 'seconds').valueOf()}-${seconds}-${check._id}`,
        result: mapResults(checkResults)
      }
    })
    .then(result => saveToBucket(result))
    .catch(e => console.log(e))
}
