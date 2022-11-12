/**
 * @file Manages interaction with the database
 * @author Austin Harris
 * Last edited: June 23, 2022 - Changed database format
 */


const oracle = require("oracledb");
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const ssm = new AWS.SSM();

// const params = {
//     user: process.env.user,
//     password: process.env.password,
//     connectString: 'cman1-dev.byu.edu:31200/cescpy1.byu.edu'
// }

/**
 * Collects necessary parameters to connect to the database using the AWS store. Must input environment variables to use
 * @params none
 * @returns an object containing the password and username obtained from aws to access the database
 */
async function getParameters(){
    //Parameters to retrieve the username for the database from the AWS store
    try{
        const usernameParams = {
            Name: '/austinharris-technical-challenge/dev/DB_USERNAME',
            WithDecryption: true
        }
        //Parameters to retrieve the password for the database from the AWS store
        const passwordParams = {
            Name: '/austinharris-technical-challenge/dev/DB_PASSWORD',
            WithDecryption: true
        }

        const data = await ssm.getParameter(usernameParams).promise();
        const username = data.Parameter.Value;
        const data2 = await ssm.getParameter(passwordParams).promise();
        const password = data2.Parameter.Value;
        return {Password: password, Username: username}
    } catch (e){
        console.log('Error occurred while retrieving parameters from the AWS store. Please ensure you have correctly' +
            ' set the proper environment variables')
    }

}



/**
 * Tests connection to Oracle so that user doesn't waste time in the program with partial functionality
 * @param (params) The username and password used to access the database
 * @returns none
 */
async function testOracleConnection(params) {
    try{
        console.log('Testing connection to on-prem OracleDB')
        const conn = await oracle.getConnection(params)
        const result = await conn.execute('SELECT * FROM DUAL')
        await conn.close()
        console.log('Successfully connected to on-prem OracleDB')
    } catch (e) {
        console.error('Unable to create a connection to on-prem OracleDB. Check VPN connection and try again')
        throw e
    }
}


/**
 * Collects all previous records of medical api use with the associated user by BYU ID number in the database
 * @param (studentID) ID used to uniquely identify entries from the database that belong to the user
 * @param (params) The username and password used to access the database
 * @returns A table containing information from all three tables used to store user info
 */

async function getTable(studentID, params){
    try{
        const conn = await oracle.getConnection(params)
        const result = await conn.execute('SELECT Vaccination_Table.STUDENTID, Vaccination_Table.CURRENTDATE, Vaccination_Table.VACCINATION, Vaccination_Table.COVIDWARNING, Symptom_Table.SYMPTOMS, Diagnoses_Table.DIAGNOSIS ' +
            'FROM OIT#harriaus.Vaccination_Table ' +
            'INNER JOIN OIT#harriaus.Symptom_Table ON Vaccination_Table.CURRENTDATE = Symptom_Table.CURRENTDATE ' +
            'Inner JOIN OIT#harriaus.Diagnoses_Table ON Vaccination_Table.CURRENTDATE = Diagnoses_Table.CURRENTDATE ' +
            'WHERE Vaccination_Table.STUDENTID = ' + ':studentID' + ' AND OIT#harriaus.Diagnoses_Table.DiagnosesNum = 1', [studentID]);
        let rows = changeToArray(result.rows);
        await conn.close();
        if(rows.length === 0){
            rows = ['This table is empty, please add records to view them']
        }
        return rows;
    } catch (e) {
        console.error('Encountered an error while retrieving table from Oracle database. Check vpn connection');
        throw e
    }
}

/**
 * Collects all previous diagnoses connected to a record
 * @param (studentID) ID used to uniquely identify entries from the database that belong to the user
 * @param (date) The unique date which identifies entries to be collected
 * @param (params) The username and password used to access the database
 * @returns A table containing all diagnoses for a specific date and time
 *
 */

async function getDiagnosesTable(studentID, date, params){
    try{
        const conn = await oracle.getConnection(params)
        const result = await conn.execute('SELECT DIAGNOSIS ' +
            'FROM OIT#harriaus.Diagnoses_Table ' +
            'WHERE STUDENTID = ' + ':studentID' + ' AND CURRENTDATE = ' + ':currentDate', [studentID, date]);
        await conn.close();
        return result.rows
    } catch (e) {
        console.error('Encountered an error while retrieving table from Oracle database. Check vpn connection');
        throw e
    }
}

/**
 * This helper function enables the desired behavior of the console.table() call made in index.js by formatting data as
 * an array.
 * @param (rows) The response of rows from the database
 * @returns An array ready for use with console.table
 */

function changeToArray(rows){
    let returnArray = [];
    for(let i = 0; i < rows.length; i++){
        let currRow = rows[i];
        argObject = {
            'Date of Diagnosis': `${currRow.CURRENTDATE}`,
            'Vaccination Status': `${currRow.VACCINATION}`,
            'Covid Warning': `${currRow.COVIDWARNING}`,
            'Symptoms': `${currRow.SYMPTOMS}`,
            'Top Diagnosis ': `${currRow.DIAGNOSIS}`,
        }
        returnArray.push(argObject);
    }
    return returnArray;
}


/**
 * Inserts a row into the table. A composite key constraint is placed on the id and date (with the date specific down to
 * the second). All arguments must be Not Null except for the 2nd and 3rd diagnoses.
 * @param (id) ID to be input into the database
 * @param (date) Date to be input into the database
 * @param (vaccination) Vaccination information to be input into the database
 * @param (covidWarning) Covid warning associated with the current symptoms
 * @param (symptoms) Symptoms to be input into the database
 * @param (diagnosesArray) An array of the diagnoses returned by the Endless medical API
 * @param params Credentials to enter into the database
 * @returns none
 */

async function insertIntoTable(id, date, vaccination, covidWarning, symptoms, diagnosesArray, params){
    try{
        const conn = await oracle.getConnection(params)
        for(let i = 0; i < diagnosesArray.length; i++){
            const result = await conn.execute('INSERT INTO OIT#harriaus.Diagnoses_Table (' +
                'StudentID,' +
                ' CurrentDate,' +
                ' DiagnosesNum,' +
                ' Diagnosis)' +
                ' VALUES (' +
                ' :StudentID,' +
                ' :CurrentDate,' +
                ' :DiagnosesNum,' +
                ' :Diagnosis)',
                [id, date, i + 1, diagnosesArray[i]]);
        }
        const result2 = await conn.execute('INSERT INTO OIT#harriaus.Vaccination_Table (' +
            'StudentID,' +
            ' CurrentDate,' +
            ' Vaccination,' +
            ' CovidWarning)' +
            ' VALUES (' +
            ' :StudentID,' +
            ' :CurrentDate,' +
            ' :Vaccination,' +
            ' :CovidWarning)',
            [id, date, vaccination, covidWarning]);
        //console.log(result.rows)
        const result3 = await conn.execute('INSERT INTO OIT#harriaus.Symptom_Table (' +
            'StudentID,' +
            ' CurrentDate,' +
            ' Symptoms)' +
            ' VALUES (' +
            ' :StudentID,' +
            ' :CurrentDate,' +
            ' :symptoms)',
            [id, date, symptoms]);
        await conn.close()
        //return result.rows;
    } catch (e) {
        console.log('An error occurred while inserting into the database. Please check your vpn')
        throw e
    }
}

/**
 * Deletes from the database. The composite key made up of the date and student ID makes up the primary key and so both
 * are used. The date
 * @param (date) Date to uniquely identify entry to be deleted
 * @param (id) BYU ID to uniquely identify entry to be deleted
 * @param (params) Username and password to access database
 * @returns An array ready for use with console.table
 */

async function deleteOne(date, id, params){
    try{
        const conn = await oracle.getConnection(params);
        const result = await conn.execute('Delete FROM OIT#harriaus.Vaccination_Table ' +
            'WHERE STUDENTID = ' + ':studentID' + ' AND CURRENTDATE = ' + ':currentDate', [id, date]);
        const result2 = await conn.execute('Delete FROM OIT#harriaus.Symptom_Table ' +
            'WHERE STUDENTID = ' + ':studentID' + ' AND CURRENTDATE = ' + ':currentDate', [id, date]);
        const result3 = await conn.execute('Delete FROM OIT#harriaus.Diagnoses_Table ' +
            'WHERE STUDENTID = ' + ':studentID' + ' AND CURRENTDATE = ' + ':currentDate', [id, date]);
        await conn.close()
        return result.rows;
    } catch (e) {
        console.error('Encountered an error while deleting from the table. Please check your vpn')
        throw e
    }
}

/**
 * Deletes all data from the database associated with the student. Date is not needed.
 * @param (studentID) BYU ID to uniquely identify entry to be deleted
 * @param (params) Username and password to access database
 * @returns An array ready for use with console.table
 */

async function deleteAll(studentID, params){
    try{
        const conn = await oracle.getConnection(params)
        const result = await conn.execute('Delete FROM OIT#harriaus.Vaccination_Table ' +
            'WHERE STUDENTID = ' + ':studentID', [studentID]);
        const result2 = await conn.execute('Delete FROM OIT#harriaus.Symptom_Table ' +
            'WHERE STUDENTID = ' + ':studentID', [studentID]);
        const result3 = await conn.execute('Delete FROM OIT#harriaus.Diagnoses_Table ' +
            'WHERE STUDENTID = ' + ':studentID', [studentID]);
        await conn.close()
        return result.rows;
    } catch (e) {
        console.error('Encountered an error while deleting from the table. Please check your vpn')
        throw e
    }
}



module.exports = {testOracleConnection, getTable, insertIntoTable, deleteAll, deleteOne, getParameters, getDiagnosesTable}