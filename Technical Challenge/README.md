# My Medical Advisor

Medical Advisor uses an API to give the probability of having various illnesses based off of selected symptoms, warns about the possibility of covid, and gives
customized advise based off of the vaccination status of the user. Now you don't have to stress about what your symptoms mean!

## Setup:

### Subscribe to BYU APIS

1. Persons - v3

[Link to Persons API page](https://api.byu.edu/store/apis/info?name=Persons&version=v3&provider=BYU%2Fjohnrb2)

2. Covid Vaccine - v3

[Link to Covid Vaccine API page](https://api.byu.edu/store/apis/info?name=COVID_Vaccine&version=v1&provider=BYU/thirschi&)


### Connect to AWS

In order to use this program you must connect to BYU's AWS. To do so:

1. Go to this link and download the AWS CLI version that corresponds to your computer: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
2. Install the BYU AWS login by running ``pip3 install byu-awslogin``
3. Visit [BYU's AWS Login page](https://byulogin.awsapps.com/start#/)
4. After login, you should find the byu-org-trn app. Click on it and then click on command line or programmtic access
5. Navigate to the "Powershell" tab and copy environmental variables
6. Paste Powershell Environmental Variables into Powershell terminal

### Connect to VPN

1. Download the [GlobalProtect App](https://vpn.byu.edu/global-protect/getsoftwarepage.esp) 
2. Open the GlobalProtect app
3. When prompted for VPN Portal Address, enter ``gp-dc.byu.edu``
4. Click "Connect" 

### Download Program Files from Github

1. Clone this Github reposisitory
2. Open Powershell Terminal on your computer
3. Change directories until you are in the downloaded repository

### Install NPM Packages

1.  Run ``npm install``

### Run the program

1. Enter ``node index.js`` into the command line

## Using My Medical Advisor:
Congratulations. You are now ready to use the program.

###Guest access or full student use functionality
When you first start up the program you will encounter this screen

![Welcome page](https://user-images.githubusercontent.com/77407761/170571799-a3d20291-eb7e-4fb0-bea7-a9f9213b1509.png)

If you choose guest access you will encounter the same diagnosis options as displayed below after inputing your age and gender. Please jump to the 'Feeling Sick? Get Diagnosed' heading. Student access offers greater functionality and thus I recommend this option. To enable full use you will need to input your Student ID and WS02 tokens.

![student ID](https://user-images.githubusercontent.com/77407761/170572767-1b69c532-c335-4c8b-812e-d0fd24dac284.png)

![WS02](https://user-images.githubusercontent.com/77407761/170573068-9cae3c95-21d7-4e70-9443-79fd04f577b3.png)

### Main Student Menu
At this point you have reached the main menu for members. The program will continually return the user back to this menu. Selecting back will take the user back to the student or guest access menu. Selecting Quit will end the program.

![MainMenu](https://user-images.githubusercontent.com/77407761/170574008-0130d6bf-dffe-4225-83b2-7b0f86ca2052.png)

#### View saved diagnoses records
Selecting 'view saved diagnoses records' will show the below displayed menu. Deleting a single record will ask for the index (shown on the left side of the table) to delete. Deleting ALL will irreversably get rid of all records. Back will take the user back to the main menu.

![ViewDiagnoses](https://user-images.githubusercontent.com/77407761/170574483-26c3e423-7bc6-45a4-b0d5-4c6a64de3882.png)


#### View covid vaccination status
Selecting 'view covid vaccination status' will display a table with university information on the users vaccination status. A menu will also display with an option to add a vaccination record which will take the user to a byu web page. The user can also choose to go back to the main menu.

![Covid menu](https://user-images.githubusercontent.com/77407761/170575139-8225319d-5805-4461-a01a-fd7f156f70fc.png)


#### Feeling Sick? Get Diagnosed
The user is presented with a list of possible symptom inputs to the api which can either be browsed by pressing the up and down arrow keys or can be searched through by typing

![SymptomSearch1](https://user-images.githubusercontent.com/77407761/170576120-d1b3454b-c849-4754-9f52-d9f02f5e17ea.png)

![SymptomSearch2](https://user-images.githubusercontent.com/77407761/170576279-83fe1b7b-deca-4359-b058-d3f428652ce8.png)

The user is then prompted to rate the severity of the selected symptom on a scale from 1-10.

![Severity](https://user-images.githubusercontent.com/77407761/170576400-c37afc19-78b2-4d03-83d5-42822aa17811.png)

The user can then choose to add an additional symptom which will run the previous steps again, or to analyze and diagnose, or to cancel which will return them to the main menu.

![symptomSubMenu](https://user-images.githubusercontent.com/77407761/170576615-7a1ddcb5-6f41-4a86-bc80-58d4335f25c2.png)

After selecting to diagnose given the inputed symptoms, the user is presented with a table of the most likely Ilnesses with the probability of each selection (probability is truncated to 2 decimal places)

![AddDiagnosis](https://user-images.githubusercontent.com/77407761/170577199-fd79369b-e8d6-41c6-9b8d-f7aed7a296e9.png)

Selecting yes will add the top 3 most likely diagnoses to the database for the user and as shown above will be able to be viewed at any time. Regardless of the selection made the user will be returned to the main menu.

Thanks for using my medical advisor!

