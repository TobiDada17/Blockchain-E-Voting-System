const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
const winston = require('winston');
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
      describe('test BallotBox function', () => {
        it('it should return BallotBox', async () => {
            const electionId = 'qakgylv3hpgzunw3av9nj'
            const contestId = 'lxr4q6b033im9bwr63bfp'
            const expectedResult = {
                electionId: 'qakgylv3hpgzunw3av9nj',
                contestId: 'lxr4q6b033im9bwr63bfp',
                votedStudents: [],
                ballots: [] }
            const ballotBox = await new BallotBox(electionId, contestId)
                ballotBox.should.be.deep.equal(expectedResult)
            });
      });
})

