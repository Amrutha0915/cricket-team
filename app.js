const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dppath = path.join(__dirname, 'cricketTeam.db')
let db = null
const serverstart = async () => {
  try {
    db = await open({
      filename: dppath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running at local host and the port number 3000')
    })
  } catch (e) {
    console.log(DBError, `${e.message}`)
    process.exit(1)
  }
}
serverstart()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getplayers = `select * from cricket_team order by player_id`
  const players = await db.all(getplayers)
  response.send(
    players.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addplayer = `insert into cricket_team(playerName,jerseyNumber,role)
    values ('${playerName}',${jerseyNumber},'${role}');`
  const dbResponse = await db.run(addplayer)

  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerid} = request.params
  const getplayer = `select * from cricket_team where player_id=${playerid}`
  const result = await db.get(getplayer)
  response.send(convertDbObjectToResponseObject(result))
})

app.put(' /players/:playerId/', async (request, response) => {
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playersdetails
  const {playerid} = request.params
  const updateplayer = `update cricket_team set player_name='${playerName}',
    jersey_number=${jerseyNumber},role='${role}';
    where player_id='${playerid}';`
  await db.run(updateplayer)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerid} = request.params
  const deleteplayer = `delete from cricket_team where player_id='${playerid}'`
  await db.run(deleteplayer)
  response.send('Player Removed')
})

module.exports = app
