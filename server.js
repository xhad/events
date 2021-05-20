require("dotenv").config()
const axios = require("axios")
const { PoolSchema } = require("./schemas")
const { EventEmitter } = require("events")
const { transform, isArray, isEqual, isObject } = require("lodash")

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
  const payload = JSON.stringify({ content })
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    url: process.env.WEBHOOK_URL,
    method: "POST",
    data: payload,
    muteHttpExceptions: true,
  }
  console.log(content)

  axios(params)
}

function difference(origObj, newObj) {
  const changes = (newObj, origObj) => {
    let arrayIndexCounter = 0
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value
      }
    })
  }
  return changes(newObj, origObj)
}

async function getPools(poolPositions) {
  const API_URL = process.env.API_URL
  const request = await axios.post(API_URL, { query: allPools })

  const pools = request.data.data.allPools.list

  const positions = await pools.map((pool, i) =>
    Object.assign({
      poolAddress: pool.contractAddress,
      positions: pool.poolPositions,
    })
  )

  positions.forEach((pool, i) => diffPositions(pool, poolPositions[i]))
  event.emit("update", positions)
}

async function diffPositions(pool, oldPool) {
  pool.positions.forEach((position, i) => {
    const a = JSON.stringify(oldPool.positions[i])
    const b = JSON.stringify(position)

    if (a !== b) {
      const diff = difference(oldPool.positions[i], position)
      const message =
        "**Position Update** on pool " +
        pool.poolAddress +
        "\n" +
        "```" +
        JSON.stringify(oldPool.positions[i]) +
        "\n\n Updated Value(s): \n" +
        JSON.stringify(diff) +
        "```"
      postMessageToDiscord(message)
    }
  })
}

async function main() {
  try {
    let poolPositions = []
    console.log(`[${Date.now()}] Watching Launch pool`)

    setInterval(async () => getPools(poolPositions), 5000)

    event.on("update", (newPositions) => {
      poolPositions = newPositions
    })
  } catch (err) {
    console.log(err)
  }
}

main()
