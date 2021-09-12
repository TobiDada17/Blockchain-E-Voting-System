const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
const winston = require('winston');
const Ballot = require('../lib/Ballot')

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

  describe('Test Ballot Class', ()=>{

    let contract;
    let ctx;
    let electionId;
    beforeEach(async () => {
        contract = new MyAssetContract();
        ctx = new TestContext();
      });
      describe('test Ballot function', () => {
        it('it should return Ballot', async () => {
            const contestId = 'lxr4q6b033im9bwr63bfp'
            const ballot = await new Ballot(contestId,1)
            const expectedResult = { caster: 'lxr4q6b033im9bwr63bfp', candidateId: 1 }
            ballot.should.be.deep.equal(expectedResult)
            });
      });
})

