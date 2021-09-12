const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
const winston = require('winston');
const ELection = require('../lib/Election')

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
      describe('test Election function', () => {
        it('it should return Election', async () => {
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const election = await new ELection(electionId, 
                'WOKEWeekly Election', 
                'The WOKEWeekly Election', 'AGM', '2021-04-22', '2021-04-22')
            election.should.be.deep.equal({
                electionId: 'qakgylv3hpgzunw3av9nj',
                electionName: 'WOKEWeekly Election',
                electionDescription: 'The WOKEWeekly Election',
                electionType: 'AGM',
                startDate: '2021-04-22',
                endDate: '2021-04-22',
                objectType: 'Election',
                electionContests: {} })
            });
      });
})

