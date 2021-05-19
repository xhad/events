
require('dotenv').config()
const axios = require('axios')
const { PoolSchema } = require('./schemas')
const { EventEmitter } = require('events')
const { transform, isArray, isEqual, isObject } = require('lodash')

const event = new EventEmitter()

const allPools = `
  { 
    allPools {
      skip
      limit
      total
      list ${PoolSchema}
    }
  }
`

async function postMessageToDiscord(content) {

  const payload = JSON.stringify({content});
  const params = {
    headers: {
      'Content-Type': 'application/json'
    },
    url: process.env.WEBHOOK_URL,
    method: "POST",
    data: payload,
    muteHttpExceptions: true
  };
  console.log(content)

  axios(params)
}

function difference(origObj, newObj) {
  const changes= (newObj, origObj) => {
    let arrayIndexCounter = 0
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
        result[resultKey] = (isObject(value) && isObject(origObj[key])) ? changes(value, origObj[key]) : value
      }
    })
  }
  return changes(newObj, origObj)
}

async function getPools (poolPositions) {
    const PRIVATE_API = 'https://api.maple.finance/public'
    const launchPool = await axios.post(PRIVATE_API, { query: allPools })
  
    const pool = launchPool.data.data.allPools.list[0]
    if (!poolPositions.length) return event.emit('update', pool.poolPositions)
    const lpAddress = pool.poolPositions[0].id.split('-')[0]

    pool.poolPositions.forEach((position, i) => {
      const a = JSON.stringify(poolPositions[i])
      const b = JSON.stringify(position)
      if (a !== b) {
        const diff = difference(poolPositions[i], position)
        event.emit('update', pool.poolPositions)
        const message = "**Launch Pool Position Update** for `" + lpAddress + "`" + "\n" + "```" + JSON.stringify(poolPositions[i]) + "\n\n Updated Value(s): \n" + JSON.stringify(diff) + "```"
        postMessageToDiscord(message)
      }
    })
  

}

async function main () {
  try {
    let poolPositions = []
    console.log(`[${Date.now()}] Watching Launch pool`)

    setInterval(async () => getPools(poolPositions), 5000)

    event.on('update', newPositions => {
      poolPositions = newPositions 
    })

  } catch(err) {
    console.log(err)
  }
}

main()