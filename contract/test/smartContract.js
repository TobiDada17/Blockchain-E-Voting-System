const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
const winston = require('winston');
const smartContract = require('../lib/smartContract')

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);
const mockDatabase = require('./MOCKDB')


class TestContext {

    constructor() {
      this.stub = sinon.createStubInstance(ChaincodeStub);
      this.clientIdentity = sinon.createStubInstance(ClientIdentity);
      this.logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
      };
    }
  
  }

  describe('Test smart contract', ()=>{

    let contract;
    let ctx;
    let electionId;
    beforeEach(async () => {
        contract = new MyAssetContract();
        ctx = new TestContext();
      });
      describe('test init function', () => {
        it('it should return adminUser', async () => {
            const expectedResult = {
                email: 'AO00577@SURREY.AC.UK',
                firstName: 'Tobi',
                lastName: 'Dada',
                password: '$2a$10$V75sPhbwqWcEBZxF1HCDru9mUJznO/R99c1mgamDmyqeMfHzTFWty',
                userType: 'Admin',
                privilege: 3,
                objectType: 'User' }

            const actualResult = await contract.init(ctx);
            actualResult.email.should.equal(expectedResult.email)
            actualResult.firstName.should.equal(expectedResult.firstName)
            actualResult.lastName.should.equal(expectedResult.lastName)
            actualResult.userType.should.equal(expectedResult.userType)
            actualResult.objectType.should.equal(expectedResult.objectType)
            actualResult.should.have.own.property('password')
        });
      });

      describe('test createElection function', () => {
        it('createElection should function correctly', async () => {
            const args = {
                "electionDescription": "The AGM for ",
                "electionName": "HackSoc",
                "electionType": "AGM Election",
                "endDate": "2021-04-22",
                "startDate": "2021-04-22"
              }
            const actualResult = await contract.createElection(ctx, JSON.stringify(args));
            actualResult.should.have.own.property('electionId')
            actualResult.should.have.own.property('message')
            electionId = actualResult.electionId
        });        
      });

      describe('test createUser function', () => {
        it('createUser should function correctly', async () => {

            const args = {
                email: "TOBIDADA17@GMAIL.COM",
                firstName: "Tobi",
                lastName: "Dada",
                password: "password1234",
                userType: "Admin",
                privilege: 3
            }
            const actualResult = await contract.createUser(ctx, JSON.stringify(args));
            actualResult.should.have.own.property('email')
            actualResult.should.have.own.property('message')
        });        
      });
      describe('test createUser function', () => {
        it('createUser should function correctly', async () => {

            const args = {
                email: "TOBIDADA17@GMAIL.COM",
                firstName: "Tobi",
                lastName: "Dada",
                password: "password1234",
                userType: "Admin",
                privilege: 3
            }
            const actualResult = await contract.createUser(ctx, JSON.stringify(args));
            actualResult.should.have.own.property('email')
            actualResult.should.have.own.property('message')
        });        
      });

      describe('test createAGMContest function', () => {
        it('createAGMContest should function correctly', async () => {

            const args = {
                "contestName": "President", 
                "contestDescription": "This is the Presidential Election", 
                "candidates": [
                    {
                        "email": "tobidada17@gmail.com",
                        "id": 0,
                        "name": "Tobi"
                    },
                    {
                        "email": "steve@gmail.com",
                        "id": 1,
                        "name": "Steve"
                    }
                ],
                "electionId": electionId
            }
            const getElectionStub = sinon.stub(smartContract.prototype, 'getElection')
            getElectionStub.withArgs(ctx,electionId).returns({
                "electionContests": {

                },
                "electionDescription": "The AGM for ",
                "electionId": electionId,
                "electionName": "HackSoc",
                "electionType": "AGM Election",
                "endDate": "2021-04-22",
                "objectType": "Election",
                "startDate": "2021-04-22"
            })
            const actualResult = await contract.createAGMContest(ctx, JSON.stringify(args))
            actualResult.should.have.own.property('message')
            smartContract.prototype.getElection.restore()
        });        
      });


      describe('test changeElectionStatus function', () => {

        afterEach(() =>{
            smartContract.prototype.getElection.restore()
        })
        it('changeElectionStatus should function correctly CLOSED', async () => {
            const contestId = 'lxr4q6b033im9bwr63bfp'
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const args = {electionId: electionId, contestId: contestId, change: 'OPEN'}
            const expectedResult = { message: `Election Contest: ${contestId} has sucessfully been started` }
            const changeElectionStatusStub = sinon.stub(smartContract.prototype, 'getElection')
            const electionWithContest = mockDatabase.electionWithContestClosed
            changeElectionStatusStub.withArgs(ctx,electionId).returns(electionWithContest)

            const actualResult = await contract.changeElectionStatus(ctx, JSON.stringify(args))
            actualResult.should.be.deep.equal(expectedResult)
        });      
        
        it('changeElectionStatus should function correctly OPEN', async () => {
            const contestId = 'lxr4q6b033im9bwr63bfp'
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const args = {electionId: electionId, contestId: contestId, change: 'ENDED'}
            const expectedResult = { message: `Election Contest: ${contestId} has sucessfully been ended` }
            const changeElectionStatusStub = sinon.stub(smartContract.prototype, 'getElection')
            const electionWithContest = mockDatabase.electionWithContestOpen
            changeElectionStatusStub.withArgs(ctx,electionId).returns(electionWithContest)

            const actualResult = await contract.changeElectionStatus(ctx, JSON.stringify(args))
            actualResult.should.be.deep.equal(expectedResult)
        }); 

        it('changeElectionStatus should function correctly ENDED', async () => {
            const contestId = 'lxr4q6b033im9bwr63bfp'
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const args = {electionId: electionId, contestId: contestId, change: 'OPEN'}
            const expectedResult ={ message: `Election Contest: ${contestId} has ended so cannot be changed` }
            const changeElectionStatusStub = sinon.stub(smartContract.prototype, 'getElection')
            const electionWithContest = mockDatabase.electionWithContestEnded
            changeElectionStatusStub.withArgs(ctx,electionId).returns(electionWithContest)

            const actualResult = await contract.changeElectionStatus(ctx, JSON.stringify(args))
            actualResult.should.be.deep.equal(expectedResult)
        });  
      });

      
      describe('test deleteElection function', () => {
        it('deleteElection should function correctly', async () => {
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const args = {electionId: electionId}
            const expectedResult = { "isDelete": true }
            const actualResult = await contract.deleteElection(ctx, JSON.stringify(args))
            actualResult.should.be.deep.equal(expectedResult)
        });       
      });

      describe('test deleteUser function', () => {
        it('deleteUser should function correctly', async () => {
            const email = 'ao00577@surrey.ac.uk'
            const args = {email: email}
            const expectedResult = { "isDelete": true }
            const actualResult = await contract.deleteUser(ctx, JSON.stringify(args))
            actualResult.should.be.deep.equal(expectedResult)
        });       
      });
})

