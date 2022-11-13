const axios = require("axios");


async function returnPersonID(){

    var ID = document.getElementById("identifier").value;
    var token = document.getElementById("token").value;
    obj = findPersonID(ID,token);

    // var htmlWrapper = document.querySelector('#wrapper');
    var htmlTemplate = '<h2>Hello' + `${obj.name}` + '</h2>' + '<p>This person is </p>';
    // htmlWrapper.innerHTML = htmlTemplate;
    document.getElementById("wrapper").innerHTML = htmlTemplate;
}

    
async function findPersonID(studentIDNumber, token){

    let url = 'https://api.byu.edu/byuapi/persons/v3/' + studentIDNumber;
    const personOptions = {
        url: url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    let ageUrl = 'https://api.byu.edu/byuapi/persons/v3/' + studentIDNumber + '/vital_record';
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
        ageResponse = await axios(personAgeOptions);
        
        //console.log(response.data.basic.person_id.value);
    }catch (e){
        errorHandler(e, 'Persons - V3');
        console.log(e);
    }
    // let graduationURL = 'https://api.byu.edu:443/domains/legacy/academic/advisement/studentgraduationapp/v1/' + response.data.basic.person_id;
    // const personGraduationOptions = {
    //     url: graduationURL,
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${token}`
    //     }
    // }
    // try{
    //     gradResponse = await axios(personGraduationOptions);
    //     //console.log(response.data.basic.person_id.value);
    // }catch (e){
    //     errorHandler(e, 'Student Graduation');
    // }
    let obj = {
        name: `${response.data.basic.first_name.value} ${response.data.basic.surname.value}`,
        sex: `${response.data.basic.sex.value}`,
        age: `${ageResponse.data.age.value}`,
        
    }
    return obj;
}

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
