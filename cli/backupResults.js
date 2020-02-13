const dayjs = require('dayjs')
const fetch = require('node-fetch')
const { NODEPING_API_TOKEN, NODEPING_API_ROOT } = require('../config')
const { asyncForEach, mapResults } = require('../helper')
const { saveToBucket } = require('../fetchAndStoreCheckResult')

const fetchAndStoreCheckResult = async ({ start, check }) => {
  const reportUrl = [NODEPING_API_ROOT,
    `1/results/${check._id}/`,
    '?clean=true&limit=40000&',
    `end=${start + (5 * 60 * 60 * 1000)}&`,
    `start=${start}&`,
    `token=${NODEPING_API_TOKEN}`].join('')

  console.info(`--> Getting check results ${check.parameters.target} for ${start}/5h`)
  console.debug(reportUrl)
  await fetch(`${reportUrl}`)
    .then(res => res.json())
    .then((checkResults) => {
      console.info(`--> Check results are downloaded for ${check.parameters.target} ${start}/5h, count : ${checkResults.length}`)
      return {
        fileName: `${dayjs(start, 'YYYY-MM-DD HH:mm:ss').valueOf()}-5h-${check._id}`,
        result: mapResults(checkResults)
      }
    })
    .then(data => saveToBucket(data))
    .catch(e => console.log(e))
}

/**
 * Start fetching and storing all check results starting from given date
 * @param start  RFC2822 or ISO 8601 date like YYYY-MM-DD HH:MM:SS
 */
const nodepingSync = async ({ start, checks }) =>
  asyncForEach(checks, async (check) =>
    fetchAndStoreCheckResult({ start, check })
  )

const dateArray = []
for (let d = dayjs('2019-09-04 01:00:00', 'YYYY-MM-DD HH:mm:ss'); d.isBefore(dayjs()); d = d.add(5, 'hours')) {
  dateArray.push(d.valueOf())
}

fetch(`${NODEPING_API_ROOT}1/checks?token=${NODEPING_API_TOKEN}`)
  .then(res => res.json())
  .then(body => Object.values(body).filter(b =>
    b.type === 'HTTP'
  ))
  .then((checks) => {
    asyncForEach(dateArray, async (start) => {
      console.info(`--> Start syncing for ${start}`)
      console.info(`--> Start: ${start}`)
      console.info(`--> Check count ${checks.length}`)
      await nodepingSync({ start, checks })
      return
    })
  })
