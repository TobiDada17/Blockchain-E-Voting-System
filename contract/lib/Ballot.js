'use strict'

class Ballot {

constructor( caster, candidateId  ) {
    
    if ( caster, candidateId ) {
        this.caster = caster
        this.candidateId = candidateId

        if (this.__isContract) {
            delete this.__isContract;
          }
          if (this.name) {
            delete this.name;
          }
        return this;

    }
    else{
        throw new Error('Ballot could not be created');       
    }

}


}

module.exports = Ballot;