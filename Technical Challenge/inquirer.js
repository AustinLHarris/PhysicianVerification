/**
 * @file Manages menu's offered as part of the user interface
 * @author Austin Harris
 * Last edited: June 22, 2022 - Added parameter descriptions in function headers
 */


const inquirer = require("inquirer");
const inquirerPrompt = require('inquirer-autocomplete-prompt');
const fuzzy = require('fuzzy');

/**
 * Initial menu to decide access type
 * @params none
 * @returns A string to notify the main file which menu to open
 */
async function accessType(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                type: 'list',
                name: "access",
                message: "Are you a student or a guest?",
                choices: ['Student', 'Guest (Covid info inaccessible, data will not be saved)']
            }])
    let choice = String(answers.access);
    if(choice === 'Student'){
        return choice
    }else{
        return 'Guest';
    }
}

/**
 * Asks the users age for guests
 * @params none
 * @returns the age input by the guest user
 */
async function getAge(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                name: "Age",
                message: "What is your age? (Enter a number between 1-105)",
                type: "input",

            },

        ])
    let choice = String(answers.Age);
    if(choice > 105 || choice < 1){
        console.log('Invalid Input')
        await getAge();
    }
    return choice;
}

/**
 * Asks the users gender for guests
 * @params none
 * @returns the gender code as selected by the guest user
 */
async function getGender(){
    displayTitle();
    //Note that gender is 2 for male and 3 for female
    //Delete line below eventually. This is an example from code that I got this from
    //int iGender = new Random().NextDouble() < 0.5d ? 2 : 3; // 2 - Male, 3 - Female
    let answers = await inquirer
        .prompt([
            {
                name: "Gender",
                message: "Select your gender",
                type: "list",
                choices: ['Female', 'Male']
            },

        ])
    let choice = String(answers.Gender);
    if(choice === 'Female'){
        choice = 3;
    }else {
        choice = 2;
    }
    return choice;
}

/**
 * Main menu for members
 * @param (userInfo) Used to populate the welcome message with the users name
 * @returns A string to notify the main file which menu to open according to the users selection
 */
async function mainMemberMenu(userInfo){
    displayTitle();
    console.log(`Welcome ${userInfo.name}!`);
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "What would you like to do?",
                choices: ['View saved diagnoses records', 'View covid vaccination status', 'Feeling Sick? Get Diagnosed', 'Back', 'Quit'],
                type: 'list',
            }])
    let choice = String(answers.choice);
    return choice;
}

/**
 * Menu options for viewing records
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */
async function viewRecords(){
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "What would you like to do?",
                choices: ['View Diagnoses Archive', 'Delete a record', 'Delete ALL records', 'Back'],
                type: 'list',
            }])
    let choice = String(answers.choice);
    return choice;
}

/**
 * Prompt to choose an index of record to delete from the database
 * @param (array) an array of diagnoses which represents the database from which the user can delete entries
 * @returns The date of selected record to delete so that the database can uniquely identify the entry
 */
async function chooseDelete(array){
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "Pick an index to delete (or type 'back' to go back)",
                type: 'input',
            }])
    if(answers.choice === 'back' || answers.choice === 'b'){
        return 'back';
    }
    if(answers.choice >= array.length || answers.choice < 0 || answers.choice === '' || isNaN(answers.choice)){
        console.log('Invalid input. Please choose a valid index');
        return await chooseDelete(array);
    }else{
        let choice = String(answers.choice);
        //The date is part of the composite key in oracle, returning the date enables specific deletion
        let date = array[choice]['Date of Diagnosis']
        return date;
    }
}

/**
 * Presents option to choose which record the user would like to view archived diagnosis for
 * @param (array) an array of diagnoses which represents the database from which the user can choose to view additional
 * diagnoses for each date
 * @returns The date of selected record to view so that the database can uniquely identify and collect the data
 */
async function chooseArchive(array){
    if(array[0] === 'This table is empty, please add records to view them'){
        console.log('Nothing to View');
        return 'Bad Value';
    }
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "Pick an index to view all diagnoses records (or type 'back' to go back)",
                type: 'input',
            }])
    if(answers.choice === 'back' || answers.choice === 'b'){
        return 'back';
    }
    if(answers.choice >= array.length || answers.choice < 0 || answers.choice === '' || isNaN(answers.choice)){
        console.log('Invalid input. Please choose a valid index');
        return await chooseArchive(array);
    }else{
        let choice = String(answers.choice);
        //The date is part of the composite key in oracle, returning the date enables specific deletion
        let date = array[choice]['Date of Diagnosis']
        return date;
    }
}

/**
 * Provides a button to go back after any length of time viewing their records
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */
async function archiveMenu(){
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "Select back when done viewing recods",
                choices: ['Back'],
                type: 'list',
            }])
    let choice = String(answers.choice);
    return choice;
}

/**
 * Menu displayed when viewing Covid Vaccination information
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */
async function viewCovid(){
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                // message: "What would you like to do?",
                choices: ['Add Vaccination Record', 'Back'],
                type: 'list',
            }])
    let choice = answers.choice;
    if(choice === 'Back'){
        return false;
    }else{
        return choice;
    }

}


/**
 * Use of inquirer to get the BYU ID of the user
 * @params none
 * @returns the BYU id input by the user
 */
async function getbyuID(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                type: 'input',
                name: "studentID",
                message: "Enter your BYU ID (ex: 123456789)",

            }])
    let studentID = String(answers.studentID);
    if(studentID.length !== 9){
        console.log('Invalid BYU ID');
        studentID = await getbyuID();
    }
    return studentID;
}

/**
 * Use of inquirer to get WS02 token from the user
 * @params none
 * @returns the WS02 token input by the user
 */
async function getWS02(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                name: "WS02",
                message: "Enter your WS02 token",
                type: "input",
            }])
    let WS02 = String(answers.WS02);
    if(WS02.length < 25 || WS02.length > 35){
        console.log('Invalid Token');
        WS02 = await getWS02();
    }
    return WS02;
}

/**
 * Menu to select how the user will select symptoms: either from a list or with a type-able search.
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */
async function chooseSymptomFunction(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                name: "Symptom_Selection",
                message: "How would you like to input your symptoms?",
                type: "list",
                choices: ['Search'],
            },

        ])
    let choice = String(answers.Symptom_Selection);
    return choice;
}

/**
 * List select menu for symptoms
 * @params none
 * @returns An object which contains the string of the selected symptom by the user and the selected severity
 */

async function selectSymptom(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                name: "Symptom",
                message: "Select a symptom",
                pageSize: 40,
                type: "list",
                choices: symptoms
            },
            {
                name: "Severity",
                message: "Please rate the severity of this symptom on a scale from 1-10:",
                type: "list",
                pageSize: 10,
                choices: [1,2,3,4,5,6,7,8,9,10],
            },
        ])
    let symptom = String(answers.Symptom);
    let severity = String(answers.Severity);
    let obj = {
        'Symptom': symptom,
        'Severity': severity,
    }
    return obj;
}

/**
 * Search select menu for symptoms
 * @params none
 * @returns A string selection of the symptom experienced
 */

async function searchSymptom(){
    displayTitle();
    inquirer.registerPrompt('autocomplete', inquirerPrompt);
    let answers = await inquirer
        .prompt([
            {
                name: "Symptom",
                message: "Type to narrow your search",
                pageSize: 40,
                type: "autocomplete",
                source: searchHelper,
            },
        ])
    return String(answers.Symptom);
}

/**
 * Select menu for severity
 * @param (symptom) The symptom experienced so that the prompt can display the selected symptom
 * @returns The selection of severity
 */

async function selectSeverity(symptom){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                name: "Severity",
                message: `Please rate the severity of your ${symptom} on a scale from 1-10:`,
                pageSize: 10,
                type: "list",
                choices: [1,2,3,4,5,6,7,8,9,10],
            },
        ])
    return String(answers.Severity);
}

/**
 * Helper function which provides searchable functionality while selecting symptoms
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */
function searchHelper(answers, input = '') {
    return new Promise((resolve) => {
        setTimeout(() => {
            const results = fuzzy.filter(input, symptoms).map((el) => el.original);

            results.splice(5, 0, new inquirer.Separator());
            results.push(new inquirer.Separator());
            resolve(results);
        }, Math.random() * 470 + 30);
    });
}

/**
 * Menu to allow user the ability to continuously add symptoms until they are done and would like to analyze or until
 * they decide to cancel.
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */

async function addSymptomsMenu(){
    displayTitle();
    let answers = await inquirer
        .prompt([
            {
                name: "Next_Choice",
                message: "What would you like to do next?",
                type: "list",
                choices: ['Add another symptom', 'Analyze and Diagnose', 'Cancel']
            },

        ])
    let choice = String(answers.Next_Choice);
    if(choice === 'Add another symptom'){
        choice = true;
    }else if (choice === 'Analyze and Diagnose') {
        choice = false;
    }else{
        choice = 'break';
    }
    return choice;
}

/**
 * If the user gets analysis from the medical api then the user is presented with the option to keep record of the
 * diagnosis by inserting it into the database
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */

async function addToDatabase(){
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "Would you like to add this diagnosis to your records?",
                choices: ['Yes', 'No'],
                type: 'list',
            }])
    let choice = String(answers.choice);
    return choice === 'Yes';
}

/**
 * Helper function called inside of various menu options to clear the console and display again the title of the app
 * @params none
 * @returns none
 */

async function displayTitle(){
    console.clear();
    console.log('                               ---My Medical Advisor---');
    console.log('-------------------------------------------------------------------------------------------');
    console.log(' Medical advisor is meant to advise your decisions not give authoritative diagnosis. Enjoy! ');
    console.log('-------------------------------------------------------------------------------------------\n');
}

/**
 * If a combination of symptoms has been submitted to the API it occasionally fails to return any results. This menu
 * allows the user to acknowledge that no conclusion can be made in that rare occurrence
 * @params none
 * @returns A string to notify the main file which menu to open according to the users selection
 */

async function acknowledgeFailedDiagnosis(){
    let answers = await inquirer
        .prompt([
            {
                name: "choice",
                message: "The online doctor API was unable to produce any likely illnesses based off your selection",
                choices: ['Okay', 'Not okay, but I will deal with it'],
                type: 'list',
            }])
    let choice = String(answers.choice);
    return choice === 'Yes';
}

module.exports = {getbyuID, getWS02, chooseSymptomFunction, searchSymptom, selectSymptom, getAge, getGender,
    addSymptomsMenu, accessType, mainMemberMenu, addToDatabase, viewRecords, chooseDelete, displayTitle, viewCovid,
    acknowledgeFailedDiagnosis, selectSeverity, chooseArchive, archiveMenu}



const symptoms = [
    "BACK",
    "AbdAscites",
    "AbdCramps",
    "AbdDiscomfortExacerbatedByStress",
    "AbdGuarding",
    "AbdPainImprovesLeaning",
    "AbdPainRadBack",
    "AbdPainRadPerineum",
    "AbruptOnsetOfHypertension",
    "AccessoryMuscles",
    "ACEARB",
    "ACEARBUseCausedAzotemia",
    "Acuity",
    "AcuteCholecystitisConfirmationByHIDA",
    "AcuteCholecystitisConfirmationByUS",
    "AcutePancreatitisOnAbdCT",
    "AgeAtFirstBirth",
    "AgeAtMenarche",
    "AgeAtMenopause",
    "Albuminlevel",
    "Albuminuria",
    "AldoRenin",
    "Aldosterone",
    "AlkalinePhosphatase",
    "AllergicToDye",
    "AllergyMeds",
    "ALT",
    "Ambulation",
    "AMIODigitalSubstractionAngiography",
    "AMIOnAbdominalPlainRadiograph",
    "AMIonCT",
    "AMIonCTAngio",
    "AMS",
    "Amylase",
    "AnalFissureOnCScope",
    "AnalFissureOnCSigmoidoscopy",
    "Angioedema",
    "AnionGap",
    "Anisocoria",
    "AnteriorCervicalNodesExam",
    "AntiCholinergicMed",
    "Anticoag",
    "antiGBM",
    "antiPLA2Rab",
    "antiTHSD7Aab",
    "AnyLocalNeuroFindings",
    "AorticDissectionTEE",
    "AphasiaExam",
    "AphasiaHx",
    "AphtousUlcers",
    "AppendicitsOnCT",
    "AppendicitsOnUS",
    "Arrest",
    "Arrhythmia",
    "ArrhythmiaSymptomsChestPains",
    "ArrhythmiaSymptomsHeadaches",
    "ArrhythmiaSymptomsLightheadedness",
    "ArrhythmiaSymptomsSweats",
    "ArrhythmiaSymptomsWeakness",
    "AST",
    "AsymmetricEdemaLE",
    "AxillaryLymphadenopathy",
    "BabinskiSign",
    "BackPainRadPerineum",
    "BellowTheUmbAbdPain",
    "BetaHydroxyButyrate",
    "Bicarb",
    "BiliaryColicOnCt",
    "BiliaryCollicOnEUS",
    "BiliaryCollicOnUS",
    "BladderEmpty",
    "BladderFull",
    "BladderMalignancyOnUS",
    "BleedingEsophagealVarices",
    "BleedingPUDOnEGD",
    "Blindness",
    "BlindnessRos",
    "BloodCultureForFusobacteriumNecrophorum",
    "BloodCulturesx2",
    "BloodPressureDifference",
    "BloodPressureDifferenceLR",
    "BMI",
    "BNP",
    "BoneGenPain",
    "BoneLocPain",
    "BowelSounds",
    "BrainCTContrastNormal",
    "BrainCTNonContrastForICH",
    "BrainCTNonContrastForIschemicCVA",
    "BrainCTNonContrastForSAH",
    "BrainCTNormal",
    "BrainMRIForIschemicCVA",
    "BrainMRINormal",
    "BrainMRIWithGadNormal",
    "BRCA12GeneticTesting",
    "BreastGynecomastia",
    "BreastMalignancy",
    "BronchoDilators",
    "BuddingYeastMyceliaAfterKOH",
    "BurningWithUrination",
    "BZDMed",
    "Calcium",
    "CaputMedusae",
    "CarotidBruits",
    "CdiffStoolToxin",
    "ChestCTPTX",
    "ChestPainAginaAntacid",
    "ChestPainAginaLocalized",
    "ChestPainAginaNitro",
    "ChestPainAginaRest",
    "ChestPainAginaStabilityFrequency",
    "ChestPainAginaStabilityLast",
    "ChestPainAginaStabilitySeverity",
    "ChestPainAnginaYesNo",
    "ChestPainLasts",
    "ChestPainPleuriticPulm",
    "ChestPainProgressionPulm",
    "ChestPainQuality",
    "ChestPainRadiation",
    "ChestPainSeverity",
    "Chills",
    "ChokingSwallow",
    "ChronicDiarrheaSx",
    "ChronicPancreatitisOnAbdXray",
    "ChronicPancreatitisOnCt",
    "CirrhosisOnCT",
    "CirrhosisOnFibroScan",
    "CirrhosisOnMRI",
    "CirrhosisOnUS",
    "ClaudicationLowerExtremities",
    "ColdIntolerance",
    "ColdLowerLimbTips",
    "ColdUpperLimbTips",
    "ColonMalignancyOnColonoscopy",
    "ColonMalignancyOnCTColonography",
    "CondylomataExam",
    "Conjunctivas",
    "ConstantIncoHx",
    "Constipation",
    "Contacts",
    "ContrastIodine",
    "CoronaryAngiogram",
    "CoronaryAngiogramAorticDissectionFound",
    "CranialCTNonContrastForAcuteSinusitis",
    "CranialCTNonContrastForChronicSinusitis",
    "CrohnsOnColonoscopy",
    "CrohnsOnCT",
    "CrohnsOnEGD",
    "CrohnsOnMRI",
    "CrossedStraightLegRaise",
    "CRPlevel",
    "CspineTenderEx",
    "CTCoronaryAngiogram",
    "CurrentUseOfHormonalReplacementTherapy",
    "CxrayBilInfiltrates",
    "CxrayBlInfilEdema",
    "CxrayFocalInfiltrate",
    "CxrayPleuralEffusion",
    "CxrayPneumothorax",
    "CxrayPTX",
    "CxrayWidenedMediastinum",
    "Cyanosis",
    "CystoscopyWithBiopsies",
    "DayTimeSleepiness",
    "DBP",
    "DDimer",
    "DecreasedBreathSounds",
    "DecreasedEFonECHO",
    "DecreasedMood",
    "DenseBreastTissueOnMammography",
    "DentalHygiene",
    "DeviceBloodCultures",
    "DiarrheaSx",
    "DischargeFromEar",
    "DistalPulsesLE",
    "Diuretics",
    "DiureticsOvert",
    "DiverticulitisOnCt",
    "DizzinessWithExertion",
    "DizzinessWithPosition",
    "DoubleVisionRos",
    "DryMucusMembranes",
    "DryRetching",
    "DustExposure",
    "DVTSg",
    "DVTSx",
    "DyspaureniaSx",
    "DyspneaAnxiety",
    "DyspneaBag",
    "DyspneaLightheadedness",
    "DyspneaProgressionSubjective",
    "DyspneaSeveritySubjective",
    "DyspneaTingling",
    "EarDCRos",
    "EarlyDiastolicMurmurAR",
    "EarlyDiastolicMurmurRadiationAR",
    "EarlyOnsetOfHypertension",
    "EarlySatiety",
    "EarlySystolicHolosystolicMurmurAtApexMR",
    "EarlySystolicHolosystolicMurmurAtApexRadiationMR",
    "EarlySystolicHolosystolicMurmurAtTheLeftLowerSternalBorderVSD",
    "EarlySystolicHolosystolicMurmurAtTheLeftLowerSternalRadiationVSD",
    "EarlySystolicHolosystolicMurmurLeftSternalBorderRadiationTR",
    "EarlySystolicHolosystolicMurmurLeftSternalBorderTR",
    "EarPainRos",
    "EasyBleedingFromGums",
    "EasyBruising",
    "EatingPain",
    "Edema",
    "ElectiveCoronaryAngiogram",
    "ElectrocardiogramHeartBlock",
    "ElectrocardiogramHypercalcemia",
    "ElectrocardiogramHyperkalemia",
    "ElectrocardiogramHypocalcemia",
    "ElectrocardiogramHypokalemia",
    "ElectrocardiogramIschemicChangesNSTEMI",
    "ElectrocardiogramIschemicChangesSTEMI",
    "ElectrocardiogramNonspecificSTChanges",
    "ElectrocardiogramPreExcitation",
    "ElevatedDiastolicBp",
    "ElevatedPVR",
    "ElevatedSystolicBp",
    "EpigastricTender",
    "Erythema",
    "EsophagealVaricesOnCT",
    "EsophagealVaricesOnEGD",
    "ESRlevel",
    "ETOH",
    "EtohAbdPain",
    "ExerciseTollerance",
    "Exophtalmos",
    "ExposureBladderCancer",
    "ExposurePneumonitis",
    "ExposureToCovid",
    "ExtremitiesDopplersToRuleOutDVT",
    "ExtremitiesDopplersToRuleOutSVT",
    "EyesItchy",
    "Fasting",
    "FastingGlucose",
    "FastingPain",
    "FattyStool",
    "FeaturesOfHematuriaOnUA",
    "FeaturesOfInflamationOnUA",
    "FecalUrgency",
    "FeetClonus",
    "FemaleDCSx",
    "FemaleSpottingSx",
    "FemaleVaginalDryness",
    "FemoralPulses",
    "FHAsthma",
    "FHAtopicDermatitis",
    "FHBreastCancer",
    "FHCAD",
    "FHCOPD",
    "FHDM",
    "FHDVTPEParent",
    "FHEarlyCC",
    "FHHTN",
    "FHIBDCD",
    "FHIBDCU",
    "FHMEN2",
    "FHNF1",
    "FHProstateCa",
    "FHVHL",
    "FingersClubbing",
    "Fio2",
    "FlatulenceAbdSx",
    "FluidIntake",
    "FluidNoLytesIntake",
    "FluidsSwallow",
    "FoamyUrine",
    "FoodIntake",
    "GAD65",
    "GallStonesERCP",
    "GallStonesEUS",
    "GallStonesInCommonBileDuctMRIMRCP",
    "GallStonesInCysticDuctMRIMRCP",
    "GallStonesInGallBladerMRIMRCP",
    "GallStonesInPancreaticDuctCT",
    "GallStonesInPancreaticDuctMRIMRCP",
    "GastritisOnEGD",
    "GeneralHyperreflexia",
    "GeneralizedFatigue",
    "GeneralizedWeakness",
    "GeneralizedWeaknessExam",
    "gFOBT",
    "GoldflamsSign",
    "GoodpastureSyndromeonKidneyBiopsy",
    "GramStainUrineGonococcus",
    "GrossHematuria",
    "GroundGlassOnChestCt",
    "Hba1c",
    "HeadacheAssociatedWithDecreasedCaffeineIntake",
    "HeadacheAssociatedWithHTN",
    "HeadacheAssociatedWithNausea",
    "HeadacheAssociatedWithPhysicalActivity",
    "HeadacheFrontal",
    "HeadacheIntensity",
    "HeadacheOther",
    "HeadachePulsatile",
    "HeadacheSqueezing",
    "HeadacheTemporal",
    "HeadacheThunderclap",
    "HeadacheTiming",
    "HearingLossRos",
    "HeartBurn",
    "HeartRate",
    "HeatIntolerance",
    "HeavyPeriodsSx",
    "HeightDecreased",
    "HematuriaAroundPeriod",
    "HemoptysisTiming",
    "HepatitisCAntibodiesTotalIgGAndIgM",
    "HepatomegalyEx",
    "HGBlevel",
    "HirsutismHx",
    "HistoryFever",
    "HistoryOfChestRadiation",
    "HIV1HIV2ElisaResults",
    "HIVWesternBlot",
    "Hoarseness",
    "HxChildbirth",
    "HydroOnCT",
    "HydroOnUS",
    "HypercapniaOnAbg",
    "HypoTension",
    "IndwellingCatheters",
    "InguinalLymphadenopathy",
    "INR",
    "InsulinAA",
    "IntersitialAbnormalitiesOnChestCt",
    "IrregularLiverEx",
    "IrregularPeriodsSx",
    "IschemicColitis",
    "IschemicColitisOnUltrasound",
    "IsletCellAA",
    "IVAbxMed",
    "Jaundice",
    "JaundiceHx",
    "JointsPain",
    "JugularVeinFacialVeinsThrombosis",
    "JugularVeinFacialVeinsThrombosisonCT",
    "JVD",
    "LacticAcid",
    "LactoseHydrogenTest",
    "LarynxPain",
    "LastPeriod",
    "LateOnsetOfHypertension",
    "LayingdownPain",
    "LBOOnAbdominalPlainRadiograph",
    "LBOonCT",
    "LBOonCTwDye",
    "LDH",
    "LegionellaUrinaryAntigenFeature",
    "LessUrine",
    "LimitedSpine",
    "Lipase",
    "LithiumMed",
    "LLQPain",
    "LocalizedMotorDeficitEx",
    "LocalizedNeuroMotoLEEx",
    "LocalizedNeuroMotoLEHx",
    "LocalizedNeuroMotoUEEx",
    "LocalizedNeuroMotoUEHx",
    "LocalizedNeuroSensLEEx",
    "LocalizedNeuroSensLEHx",
    "LocalizedNeuroSensUEEx",
    "LocalizedNeuroSensUEHx",
    "LocalizedSensoryDeficitEx",
    "LocalizedSensoryDeficitHx",
    "LocalPatchyInfiltratesOnChestCt",
    "LossOfConsciousness",
    "LossOfConsciousnessHeadache",
    "LossOfConsciousnessPostictall",
    "LossOfConsciousnessProdrome",
    "LossOfConsciousnessProdromeChestPain",
    "LossOfConsciousnessProdromePalpitations",
    "LossOfConsciousnessSeizures",
    "LossOfConsciousnessSphincter",
    "LossOfSmell",
    "LossOfTaste",
    "LowbackPain",
    "LowbackPainExercise",
    "LowbackPainFlexion",
    "LowbackPainSleep",
    "LowbackPainTrig",
    "LowbackSeverity",
    "LowerGIBleedSx",
    "LowerMidAbdTender",
    "LS3Tone",
    "LS4Tone",
    "LspineTenderEx",
    "LumbarLordosis",
    "LUQPain",
    "LUQTender",
    "LymphocyteLevel",
    "MalariaTravel",
    "MaleDCSx",
    "MaleProstatePainSx",
    "MaleSpottingSx",
    "MeatusTender",
    "MedsRecentChemotherapy",
    "MembranousNephropathyOnBiopsy",
    "MeningealSigns",
    "MicroscopicHematuriaOccult",
    "MicroscopicHematuriaRBCs",
    "MidSystolicEjectionMurmurAtTheRightSternalBorderAS",
    "MidSystolicEjectionMurmurAtTheRightSternalBorderRadiationAS",
    "MSAgitated",
    "MSDrowsiness",
    "MSFullyAwakens",
    "MSOrientation",
    "MSStimulusAwakens",
    "MSVerbalContact",
    "MucousCharacter",
    "MucousProduction",
    "MucousProductionInc",
    "MucusFeatures",
    "MurphysSign",
    "MuscleGenPain",
    "Nausea",
    "NeckStiffn",
    "NeckStiffness",
    "NeckSwollen",
    "NephrolithiasisOnCT",
    "NephrolithiasisOnUS",
    "NeutropeniaMeds",
    "NewDetergents",
    "NewFoods",
    "NHLongTermResidency",
    "NitratesMeds",
    "Nocturia",
    "NonEmptyBladder",
    "NoseCongestion",
    "NSAIDSMed",
    "NystagmusEyeMovements",
    "O2Sats",
    "OpiatesMed",
    "OrthopneaExam",
    "OrthopneaHx",
    "OrthostaticLightheadedness",
    "OtoscopicBulding",
    "OtoscopicErythema",
    "OtoscopicPus",
    "OtoscopicSerous",
    "PainBehindJawAngle",
    "PancreatitisMeds",
    "ParanasalSinusesTargetedXrayForSinusitis",
    "ParaspinalMuscles",
    "ParoxysmalNDHx",
    "pCO2onABG",
    "PCRChlamydia",
    "PCRCovid",
    "PCRFlu",
    "PCRGonococcus",
    "PCRHIVDNA",
    "PCRRNAHepC",
    "PCT",
    "PDAM",
    "PelvicUSForEctopicPregnancy",
    "PelvicUSForNlPregnancy",
    "PEonCTAngio",
    "PEonVQScan",
    "PerianalItchinessHx",
    "PeriAnalPainSx",
    "PeriAnalSoilingSx",
    "PericardialFriction",
    "PeriNephricStrandingOnCT",
    "PerineumItchinessHx",
    "PeriumbilicaAbdTender",
    "pHofVaginalDc",
    "pHonABG",
    "Phonophobia",
    "Photophobia",
    "PlateletsLevel",
    "PMHXAbdominalHernia",
    "PMHXAbdominalRadiation",
    "PMHXAbdominalSurgery",
    "PMHXAFib",
    "PMHXAspiration",
    "PMHXAsthma",
    "PMHXAtopicDermatitis",
    "PMHXAtypicalDuctalorLobularHyperplasiaOrLobularCarcinomaOnPriorBreastBiopsy",
    "PMHXAutoimmune",
    "PMHXBladderCancer",
    "PMHXBowelObstruction",
    "PMHXBPH",
    "PMHXBPInf",
    "PMHXBRCA12positivity",
    "PMHXCAD",
    "PMHXChestTrauma",
    "PMHXCHF",
    "PMHXChrons",
    "PMHXCKD",
    "PMHXColonCancer",
    "PMHXColonPolyp",
    "PMHXContact",
    "PMHXCOPD",
    "PMHXCU",
    "PMHXCVA",
    "PMHXDentalWork",
    "PMHXDepression",
    "PMHXDialysisCurrent",
    "PMHXDiverticulosisDiverticulitis",
    "PMHXDiverticulosisDiverticulosis",
    "PMHXDM1",
    "PMHXDM2",
    "PMHXERCP",
    "PMHXGE",
    "PMHXHeadTrauma",
    "PMHXHepatitisB",
    "PMHXHepatitisC",
    "PMHXHIV",
    "PMHXHTN",
    "PMHXHyperlipidemia",
    "PMHXHypo",
    "PMHXICH",
    "PMHXID",
    "PMHXKidneyStone",
    "PMHXLiverCirrhosis",
    "PMHXMalNeo",
    "PMHXMarfanSyndrom",
    "PMHXofDVTorPE",
    "PMHXofSVT",
    "PMHXOfThoracicAorticAneurysmOrDissection",
    "PMHXOvarianC",
    "PMHXPancreatitis",
    "PMHXPCDM",
    "PMHXPeritionitis",
    "PMHXPneumonia",
    "PMHXProstateCancer",
    "PMHXPsychOtherThanDepresion",
    "PMHXPUD",
    "PMHXPVD",
    "PMHXRecentAngiography",
    "PMHXRiskFxDVT",
    "PMHXSpontanousAbortion",
    "PMHXSubstanceAbuse",
    "PMHXTonsillectomy",
    "PMHXURTI",
    "PMHXVarices",
    "PMHXVeneral",
    "PMHXVGallStones",
    "PMHXWoundCurrent",
    "PneumoperitoneumAbdCT",
    "PneumoperitoneumAbdXray",
    "PneumoperitoneumChestCT",
    "PneumoperitoneumChestXray",
    "PoAbxMed",
    "Polydipsia",
    "Polyuria",
    "PostNasalDrainage",
    "Potassium",
    "PresenceOfPunctateHaemorrhagesOnVaginalExam",
    "PresenceOfThinAndDryMucosa",
    "PresenceOfVulvarInflamation",
    "ProlongedExpPhase",
    "ProstateMalignancy",
    "Proteinuria",
    "PSA",
    "PUDOnEGD",
    "Pupils",
    "PusMaleSpottingSx",
    "Rales",
    "RandomBloodGlucose",
    "RapidFluAntigenTesting",
    "RapidUreaseTestEGD",
    "RapiStrepTest",
    "ReboundTenderness",
    "RecentCocaineUse",
    "RecentHospitalStay",
    "RecentIVDrugs",
    "RectalExamBlood",
    "RectalExamFissure",
    "RectalExamHemorrhoids",
    "RectalExamProstateEnlarged",
    "RectalExamProstateHardened",
    "RectalExamProstateIrregular",
    "RectalExamProstateTEnder",
    "RectalExamRectalCancer",
    "RegurgFood",
    "RenalArterieDuplexUltrasonography",
    "RenalArteriesCTAngiographyWithIVDye",
    "RenalArteriesDigitalSubstractionAngiography",
    "RenalArteriesMagneticResonanceAngiographyWithGadolinum",
    "RenalArteriesMagneticResonanceAngiographyWithoutGadolinum",
    "RenalAsymmetryOnUS",
    "RenalBruits",
    "ResistantHypertension",
    "RestingPainInLowerExtremities",
    "Rhonchi",
    "RhythmRegular",
    "RightVentricleStrainOnEcho",
    "RLFlankPain",
    "RLInguinalAreaCoughBulge",
    "RLInguinalAreaTender",
    "RLInguinalPain",
    "RLLQTender",
    "RLQPain",
    "RombergsSign",
    "RR",
    "RS3Tone",
    "RS4Tone",
    "RunnyNoseCongestion",
    "RUQPain",
    "RUQTender",
    "RVStrainOnCTAngio",
    "SaltCraving",
    "SBOOnAbdominalPlainRadiograph",
    "SBOOnBedsideUltrasound",
    "SBOonCT",
    "SBOonCTwDye",
    "SBP",
    "ScrotalPainSx",
    "Seasonal",
    "SegmentalDyskinesiaHypokinesiaAkinesiaECHO",
    "Seizure",
    "SerotoninergicMed",
    "SerumbHCG",
    "SerumCK",
    "SerumCreatinine",
    "SeverityCough",
    "SexActive",
    "SexExposure",
    "SignsOfInfectionAtExitSitesOfCatheters",
    "SinusesPainRos",
    "SinusesTender",
    "SkinErythemamaculesRasExam",
    "SkinErythemamaculesRashHx",
    "SkinErythemaNodosum",
    "SkinErythemaNodosumExam",
    "SkinErythemapapulesRashExam",
    "SkinErythemapapulesRashHx",
    "SkinErythemapustulesRashExam",
    "SkinErythemapustulesRashHx",
    "SkinExfoliativeRashExam",
    "SkinFlushes",
    "SkinFlushingExam",
    "SkinHerpesRashExam",
    "SkinHerpesRashHx",
    "SkinIschemicChanges",
    "SkinItchinessHx",
    "SkinMoistureExam",
    "SkinMoistureHx",
    "SkinPetechiaeRashExam",
    "SkinPetechiaeRashHx",
    "SkinSweatingHx",
    "SkinUrticariaRashExam",
    "SkinUrticariaRashHx",
    "Smoker",
    "Sneezing",
    "Snoring",
    "SolidsSwallow",
    "SoreThroatROS",
    "SpiderAngioma",
    "SpinePain",
    "SplenomegalyEx",
    "SspineTenderEx",
    "StomachPainDistributionSx",
    "StomachPainDuration",
    "StomachPainEpigastricArea",
    "StomachPainPeriod",
    "StomachPainPeriumbilicalArea",
    "StomachPainProgressionSubjective",
    "StomachPainResolvesPRDXSx",
    "StomachPainSeveritySx",
    "Stool",
    "StoolAntigenForHPylori",
    "StoolCulture",
    "StoolEvac",
    "StoolForOvasAndParasites",
    "StraightLegRaise",
    "StrainingPain",
    "StrainStream",
    "StreptococcusUrinaryAntigenFeature",
    "StressECGCAD",
    "StressEchoCAD",
    "StressIncoHx",
    "StressNuke",
    "SwallowPain",
    "TBExposure",
    "TCAMed",
    "TearingOfEye",
    "Temp",
    "TenderLE",
    "TestisEnlarged",
    "TestisIrregular",
    "TestisTenderPE",
    "ThickenedBladderWall",
    "ThisSeasonsFluVaccineGiven",
    "ThoracicAortaCTAngiographyWithIVDye",
    "ThroatCulture",
    "ThroatCultureForFusobacteriumNecrophorum",
    "ThroatExam",
    "ThyroidBruit",
    "ThyroidEnlarged",
    "ThyroidNodules",
    "TotalBilirubin",
    "TransrectalProstateBiopsy",
    "TriglyceridesLevel",
    "Trismus",
    "TroponinI",
    "TSAT",
    "TSHFeature",
    "TspineTenderEx",
    "TwoHrPlasmaGlucoseDuringOGTT",
    "TyrosinePhosphatases",
    "UAProteinuria",
    "UConColonoscopyPathology",
    "UpperGIBleedSx",
    "UreaBreathTest",
    "UrgencyIncoHx",
    "UrinaryFrequency",
    "UrinaryUrgency",
    "UrinationRelieves",
    "UrineCytology",
    "UrinePregnancyTest",
    "UrineSoilingSx",
    "UrogramCT",
    "VaginalItching",
    "VaginalSorenessSx",
    "VagueAbdSx",
    "VeryElevatedDiastolicBp",
    "VeryElevatedSystolicBp",
    "VisualAcuityRos",
    "Vomiting",
    "WBClevel",
    "WeakAnkle",
    "WeakKnee",
    "WeakStream",
    "WeightGain",
    "WeightLoss",
    "WetMountResults",
    "Wheezing",
    "WheezingEpisodic",
    "WheezingH",
    "WhiffTestResults",
    "WoundCareRecent",
    "XrayBariumEnemaForLBO",
    "XrayDoubleBariumEnemaForColonCa",
    "YellowScleraeRos",
    "ZincTransporterZNT8",
]