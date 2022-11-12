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