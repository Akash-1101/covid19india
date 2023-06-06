const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "covid19India.db");
let db = null;
const initialzeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("The server is running at http://localhost:3001");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initialzeServer();
app.get("/states/", async (request, response) => {
  const getStatesQuery = `  SELECT 
                                state_id AS stateId ,state_name AS stateName,population
                            FROM
                                state
                             `;
  const dbresponse = await db.all(getStatesQuery);
  response.send(dbresponse);
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `  SELECT 
                                state_id AS stateId ,state_name AS stateName,population
                            FROM
                                state
                            WHERE 
                                state_id=${stateId} `;
  const dbresponse = await db.all(getStatesQuery);
  response.send(dbresponse);
});
app.post("/districts/", async (request, response) => {
  const districtsDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtsDetails;
  const addDistrictQuery = `INSERT INTO
                                district (district_name,state_id,cases,cured,active,deaths)
                            VALUES
                                ('${districtName}',
                                  ${stateId},
                                  ${cases},${cured},${active},${deaths}
                                )`;
  await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistQuery = `  SELECT 
                                 district_id AS districtId,district_name AS districtName,state_id AS stateId,cases,cured,active,deaths
                            FROM
                                district
                            WHERE 
                                district_id=${districtId} `;
  const dbresponse = await db.all(getDistQuery);
  response.send(dbresponse);
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistQuery = `  DELETE 
                            FROM
                                district
                            WHERE 
                                district_id=${districtId} `;
  const dbresponse = await db.run(getDistQuery);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtsDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtsDetails;
  const UpdateDistrictQuery = `UPDATE
                                district 
                               SET
                                  district_name='${districtName}',
                                  state_id=${stateId},
                                  cases=${cases},
                                  cured=${cured},
                                  active=${active},
                                  deaths=${deaths}
                                
                            WHERE district_id=${districtId}`;
  await db.run(UpdateDistrictQuery);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const GetQuery = `SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths)
                    FROM district
                    WHERE state_id=${stateId}`;
  const stats = await db.get(GetQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateId = `SELECT state_id FROM district WHERE district_id=${districtId}`;
  const stateIdresponse = await db.get(getStateId);
  const getStateName = `SELECT state_name AS stateName FROM state WHERE state_id=${stateIdresponse.state_id}`;
  const dbresponse = await db.get(getStateName);
  response.send(dbresponse);
});

module.exports = app;
