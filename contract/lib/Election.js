'use strict'
class Election {

constructor( electionId, electionName, electionDescription, electionType, startDate, endDate, electionContests={} ) {
    
    if (electionName && electionDescription && electionType && startDate && endDate) {
        this.electionId = electionId;
        this.electionName = electionName;
        this.electionDescription = electionDescription;
        this.electionType = electionType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.objectType='Election',
        this.electionContests= electionContests;
        if (this.__isContract) {
            delete this.__isContract;
          }
          if (this.name) {
            delete this.name;
          }
        return this;

    }
    else{
        throw new Error('Election could not be created');       
    }

}


}

module.exports = Election;