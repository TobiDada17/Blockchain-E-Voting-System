const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyAssetContract } = require('..');
const winston = require('winston');
const User = require('../lib/User')

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

  describe('Test User Class', ()=>{

    let contract;
    let ctx;
    let electionId;
    beforeEach(async () => {
        contract = new MyAssetContract();
        ctx = new TestContext();
      });
      describe('test User function', () => {
        it('it should return User', async () => {
            const user = await new User('ao00577@surrey.ac.uk',
            'thetobi1234','Tobi', 'Dada', 'Admin',1)
            user.should.have.property('email')
            user.should.have.property('password')
            user.should.have.property('firstName')
            user.should.have.property('lastName')
            user.should.have.property('userType')
            });
      });
})

