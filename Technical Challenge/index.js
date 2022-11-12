/**
 * @file The main file which runs the program
 * @author Austin Harris
 * Last edited: June 22, 2022 - Added parameter descriptions in function headers
 */

const oracle = require('oracledb');
const inquirer = require('./inquirer');
const apiCalls = require('./apiCalls');
const oracleDb = require('./oracleDb');
const open = require('open');
const {getAge, viewRecords, chooseArchive} = require("./inquirer");
oracle.outFormat = oracle.OBJECT;
oracle.autoCommit = true


/**
 * Controls the overall flow of the program
 * @params none
 * @returns none
 */
async function main() {
    let start = true;
    while (start) {
        let access = await inquirer.accessType();
        if(access !== 'Student'){
            await runDiagnosis(null);
            break;
        }
        let parameters;
        let params;
        try{
            parameters = await oracleDb.getParameters();
            params = {
                user: parameters.Username,
                password: parameters.Password,
                connectString: 'cman1-dev.byu.edu:31200/cescpy1.byu.edu'
            }
        } catch (e){
            break;
        }

        await inquirer.displayTitle();
        await oracleDb.testOracleConnection(params);

        //Gathers information on the user to enable Oracle database and API usage and localize user personal and covid info
        let id = await inquirer.getbyuID();
        let token = await inquirer.getWS02();
        let userInfo;
        let covidInfo;
        try{
            userInfo = await apiCalls.findPersonID(id, token);
            covidInfo = await apiCalls.findCovidInfo(token);
        } catch(e){
            try{
                covidInfo = await apiCalls.findCovidInfo(token);
            }catch{
                break;
                //console.log('Covid_Vaccine - v1 is also not subscribed to, please subscribe to both')
            }
            break;
        }
        //The loop for the main menu enables continuous use of the application and supports the mainMemberMenu function
        let running = true;
        while (running === true) {
            let choice = await inquirer.mainMemberMenu(userInfo);
            if (choice === 'View saved diagnoses records') {
                await savedDataViewer(id, params);
            } else if (choice === 'View covid vaccination status') {
                await covidDisplay(covidInfo);
            } else if (choice === 'Feeling Sick? Get Diagnosed') {
                let results = await runDiagnosis(userInfo);
                let addToDatabase;

                //This if/else branch prevents useless information being pushed to the database.
                if (results.diagnosis !== null) {
                    addToDatabase = await inquirer.addToDatabase();
                }
                //In the rare case of a failed Diagnosis this requests acknowledgement from the user
                else {
                    await inquirer.acknowledgeFailedDiagnosis();
                }
                if (addToDatabase) {
                    //add results to the database
                    let date = new Date();
                    let insertTime = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    let diagnoses = getDiagnosesArray(results);
                    let covid = await containsCovid(results, covidInfo.vaccinated === 'Full');
                    //To fit the table to the screen the length of response is limited as some responses can be lengthy
                    await oracleDb.insertIntoTable(id, insertTime, covidInfo.vaccinated, covid, results.symptoms, diagnoses, params);
                }
            }
            //Sends the user back to the initial menu which allows guest or member usage of the program
            else if (choice === 'Back') {
                break;
            } else {
                start = false;
                break;
            }
        }
    }
}

main();

/**
 * Helper function to populate all 10 diagnoses
 * @param (results) Takes in the response from the api call to get diagnoses
 * @returns An array ready for use with console.table
 */
function getDiagnosesArray(results){
    let diagnoses = [];
    for(let i = 0; i < results.diagnosis.data.Diseases.length; i++){
        if(i >= results.diagnosis.data.Diseases.length){
            diagnoses.push('');
            continue;
        }
        let nextDiag = diseaseToString(results.diagnosis.data.Diseases[i]);
        diagnoses.push(nextDiag);
    }
    return diagnoses;
}

/**
 * Helper function for displaying the Covid data and menu when the user selects to 'View Covid Vaccination Status'
 * @param (covidInfo) Used to populate the information in the menu
 * @returns none
 */
async function covidDisplay(covidInfo){
    let choice = true;
    while(choice){
        console.table(covidInfo);
        choice = await inquirer.viewCovid();
        if(choice === 'Add Vaccination Record'){
            await open('https://welcome-back.byu.edu/#');
        }
    }
}

/**
 * Helper function for displaying the menu and data contained in the database
 * @param (id) Used to track user information and ensure security and separation of users
 * @param (params) Credentials used to access information in the database
 * @returns none
 */
async function savedDataViewer(id, params){
    let viewing = true;
    while(viewing){
        let rows = await oracleDb.getTable(id, params)
        console.table(rows);
        let recordChoice = await viewRecords();
        if(recordChoice === 'Delete ALL records'){
            await oracleDb.deleteAll(id, params);
            await inquirer.displayTitle();
        } else if(recordChoice === 'Delete a record'){
            if(rows[0] !== 'This table is empty, please add records to view them'){
                let date = await inquirer.chooseDelete(rows);
                await oracleDb.deleteOne(date, id, params);
                await inquirer.displayTitle();
            } else {
                console.log('Nothing to delete');
            }
        } else if(recordChoice === 'View Diagnoses Archive') {
            let date = await inquirer.chooseArchive(rows);
            if(date === 'Bad Value' || date === 'back'){
                continue;
            }
            console.table(await oracleDb.getDiagnosesTable(id, date, params));
            let choice = await inquirer.archiveMenu();
            (choice === 'Back') ? await inquirer.displayTitle(): console.log('Waiting');
        } else{
            viewing = false;
        }
    }
}

/**
 * Helper function to automate the entire process of interfacing with the Endless medical API. Each call to runDiagnosis
 * uses a new session ID
 * @param (userInfo) Object passed in that contains the age and sex of the user from the persons API call
 * @returns An object with a string of symptoms added and the diagnoses returned
 */
async function runDiagnosis(userInfo){
    let sessionID = await apiCalls.getSessionID();
    let success = await apiCalls.acceptTermsOfUse(sessionID);

    if(userInfo === null){
        let age = await inquirer.getAge();
        let gender = await inquirer.getGender();
        let success2 = await apiCalls.updateAgeGender(age, gender, sessionID);
    }
    else{
        let success2 = await apiCalls.updateAgeGender(userInfo.age, userInfo.sex, sessionID);
    }
    let adding = true;
    let symptomsList = '';
    while(adding){
        let symptom = await inquirer.searchSymptom();
        if(symptom === 'BACK'){
            break;
        }
        let severity = await inquirer.selectSeverity(symptom);
        symptomsList = symptomsList + (symptom) + ', ';
        await apiCalls.addSymptom(sessionID, symptom, severity);
        adding = await inquirer.addSymptomsMenu();
        if(adding === 'break'){
            return {
                'symptoms': null,
                'diagnosis': null,
            };
        }
    }

    let diagnosis = await apiCalls.analyze(sessionID, symptomsList);
    let obj = {
        'symptoms': symptomsList,
        'diagnosis': diagnosis,
    }
    return obj;
}

/**
 * Helper function to warn about vaccination status, possibility of covid, etc
 * @param (diseaseArray) The array of diagnoses returned from analysis
 * @param (vaccinated) The vaccination level of the individual as collected from the Covid Vaccine API
 * @returns Warning level for covid considering analysis results
 */
async function containsCovid(diseaseArray, vaccinated){
    let array = diseaseArray.diagnosis.data.Diseases;
    for(let i = 0; i < array.length; i++){
        let disease = Object.keys(array[i]);
        if(disease[0].toLowerCase().indexOf('covid') > 0 || disease[0].toLowerCase().indexOf('corona') > 0){
            if(vaccinated){
                return 'Consider testing/boosting';
            }else{
                return 'Seek testing, please consider Vaccination';
            }

        }
    }
    return 'No current Risk';
}

/**
 * Helper function to translate the objects returned from the Endless Medical API to strings for input into the database
 * @param (object) An object where the label is the disease and the value the likelihood of the patient having the disease
 * @returns A readable string describing the disease and the probability of having it
 */
function diseaseToString(object){
    let keys = Object.keys(object)
    let disease = keys[0];
    let probability = object[`${disease}`];
    probability *= 100;
    probability = probability.toFixed(1);
    return `${probability}% ${disease}`;
}
