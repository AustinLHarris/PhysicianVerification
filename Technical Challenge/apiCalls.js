/**
 * @file Manages the API calls
 * @author Austin Harris
 * Last edited: June 22, 2022 - Added parameter descriptions in function headers
 */

const axios = require("axios");

/**
 * Accesses the BYU API store to collect information used in the medical api such as age and gender and also displays
 * the user's name.
 * @param (studentIDNumber) BYU ID for input into the API
 * @param (token) WS02 token for access to the API
 * @returns An object with the name, age, and sex of the user
 */
async function findPersonID(studentIDNumber, token){
    let url = 'https://api.byu.edu:443/byuapi/persons/v3/' + studentIDNumber;
    const personOptions = {
        url: url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    let ageUrl = 'https://api.byu.edu:443/byuapi/persons/v3/' + studentIDNumber + '/vital_record';
    const personAgeOptions = {
        url: ageUrl,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    let response;
    let ageResponse;
    try{
        response = await axios(personOptions);
        ageResponse = await axios(personAgeOptions)
        //console.log(response.data.basic.person_id.value);
    }catch (e){
        errorHandler(e, 'Persons - V3');
    }
    let obj = {
        name: `${response.data.basic.first_name.value} ${response.data.basic.surname.value}`,
        sex: `${response.data.basic.sex.value}`,
        age: `${ageResponse.data.age.value}`
    }
    return obj;
}

/**
 * Accesses the BYU API store to collect covid information on the user
 * @param (token) WS02 token for access to the API
 * @returns the data returned from the api containing covid information
 */
async function findCovidInfo(token){
    let url = 'https://api.byu.edu:443/domains/servicenow/covidVaccine/v1/case_covid_19/getVaccinationRecord'
    const personOptions = {
        url: url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    let response;
    try{
        response = await axios(personOptions);
    }catch (e){
        errorHandler(e, 'Covid_Vaccine - v1');
    }
    return response.data;
}

/**
 * Endless Medical Api sets up a session id so that multiple symptoms can be input before analysis. This function
 * initializes the session so that the API can keep track of this programs input.
 * @params none
 * @returns the session id for further interfacing with the endless medical api
 */
async function getSessionID(){
    let url = "http://api.endlessmedical.com/v1/dx/InitSession";
    let response;
    try{
        response = await axios.get(url);
        //console.log(response);
    }catch (e){
        errorHandler(e);
    }
    return response.data.SessionID;
}

/**
 * Endless Medical Api requires accepting the terms of use in order to analyze data.
 * @param (sessionID) A string which helps the API to keep track of the users information on its end
 * @returns a status string i.e. 200 for ok
 */
async function acceptTermsOfUse(sessionID){
    let url = `http://api.endlessmedical.com/v1/dx/AcceptTermsOfUse?SessionID=${sessionID}&passphrase=I%20have%20read,%20understood%20and%20I%20accept%20and%20agree%20to%20comply%20with%20the%20Terms%20of%20Use%20of%20EndlessMedicalAPI%20and%20Endless%20Medical%20services.%20The%20Terms%20of%20Use%20are%20available%20on%20endlessmedical.com`;
    let response;
    try{
        response = await axios.post(url);
        //console.log(response);
    }catch (e){
        errorHandler(e);
    }
    return response.status;
}

/**
 * Informs the API on the gender and age of the user for analytical purposes
 * @param (sessionID) A string which helps the API to keep track of the users information on its end
 * @param (age) The age of the user
 * @param (inputGender) The gender of the user (input as a 2 or a 3)
 * @returns a status string i.e. 200 for ok
 */
async function updateAgeGender(age, inputGender, sessionID){
    //Note that gender is 2 for male and 3 for female
    let gender;
    (inputGender === 'M') ? gender = 2 : gender = 3;
    let ageUrl = `http://api.endlessmedical.com/v1/dx/UpdateFeature?SessionID=${sessionID}&name=Age&value=${age}`;
    let genderUrl = `http://api.endlessmedical.com/v1/dx/UpdateFeature?SessionID=${sessionID}&name=Gender&value=${gender}`;
    let response;
    let response2;
    try{
        response = await axios.post(ageUrl);
        response2 = await axios.post(genderUrl);
        // console.log(response);
        // console.log(response2);
    }catch (e){
        errorHandler(e);
    }
    return response2.status;
}

/**
 * Notifies the Endless Medical API of additional selected symptoms
 * @param (sessionID) A string which helps the API to keep track of the users information on its end
 * @param (symptom) The symptom to be added to the users session
 * @param (severity) The severity associated with the symptom
 * @returns a status string i.e. 200 for ok
 */
async function addSymptom(sessionID, symptom, severity){
    let url = `http://api.endlessmedical.com/v1/dx/UpdateFeature?SessionID=${sessionID}&name=${symptom}&value=${severity}`;
    let response;
    try{
        response = await axios.post(url);
    }catch (e){
        errorHandler(e);
    }
    return response.status;
}

/**
 * Notifies the Endless Medical API that the user requests that a diagnosis be made using the symptoms input.This
 * returns an array reading to be output to a table with the most likely illnesses causing the given symptoms and the
 * calculated likelihood that the patient has each illness
 * @param (sessionID) A string which helps the API to keep track of the users information on its end
 * @param (symptomList) A string containing the list of symptoms input
 * @returns the diagnoses provided from endless medical analysis
 */
async function analyze(sessionID, symptomList){
    let url = `http://api.endlessmedical.com/v1/dx/Analyze?SessionID=${sessionID}`;
    let response;
    try{
        response = await axios.get(url);
        if(response.data.Diseases.length === 0){
            console.log('Unable to recommend possible diagnosis with the current input. Please enter more symptoms or reach out to your health provider.');
            return null;
        }
        //let keys = Object.keys(response.data.Diseases);
        let diagnosisArray = [];
        for(let i = 0; i < response.data.Diseases.length; i++){
            let keys = Object.keys(response.data.Diseases[i]);
            //console.log(response.data.Diseases[i]);
            let disease = keys[0];
            let probability = response.data.Diseases[i][`${disease}`];
            probability *= 100;
            let obj = {
                'Illness': disease,
                'Probability (%)': probability.toFixed(2),
            }
            diagnosisArray.push(obj);
        }
        console.log(`You reported these symptoms: ${symptomList}`);
        console.table(diagnosisArray);
        // console.log(response.data.Diseases[1]);
        // console.log(response.data.Diseases[2]);
        // console.log(response.data.Diseases[3]);
    }catch (e){
        errorHandler(e);
    }
    return response;
}

/**
 * A helper function for handling errors caused from API calls
 * @param (error) The error experienced by one of the api functions listed above
 * @param (api) A string containing the api which encountered the error
 * @returns none
 */
async function errorHandler(error, api = ''){
    if(api != null){
        console.log(`Error occurred in the call to the ${api} api. Please check your subscription.`)
        // if(api === 'Persons - V3'){
        //     await alsoCheckCovid(token);
        // }
    }
    if(error.message.includes('401')){
        console.log('Incorrect authentication: Please check your WS02 token');
    }
    if(error.message.includes('403')){
        console.log('Access Restricted: Your token does not grant access to the API listed above');
        process.exit();
    }
    if(error.message.includes('404')){
        console.log('Not found: The student ID you entered is incorrect');
        process.exit();
    }
    if(error.message.includes('503')){
        console.log('Throttling Error: Check your subscription level in WS02');
    }
    if(error.message.includes('500')){
        console.log('Throttling Error: Check your subscription level in WS02');
    }


}


module.exports = {findPersonID, getSessionID, acceptTermsOfUse, updateAgeGender, addSymptom, analyze, findCovidInfo}