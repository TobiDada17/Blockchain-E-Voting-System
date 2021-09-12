const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
const winston = require('winston');
const AGMContest = require('../lib/AGMContest')
const BallotBox = require('../lib/BallotBox')

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
      describe('test AGMContest function', () => {
        it('it should return AGMContest', async () => {
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const contestId = 'lxr4q6b033im9bwr63bfp'
            const ballotBox = await new BallotBox(electionId, contestId)
            const contestExpected = new AGMContest(
                contestId,
                'Presidential',
                'WOKEWeekly Presidential Contest',
                [
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
                electionId,
                ballotBox,
                false )
                contestExpected.should.be.deep.equal(mockDatabase.electionContest)
            });
      });
})

