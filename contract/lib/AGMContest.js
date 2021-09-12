'use strict'
class AGMContest {

constructor( contestId, contestName, contestDescription, candidates=[], electionId, ballotBox={}, showResults = false,  status='CLOSED' ) {
    
    if (contestId&& contestName && contestDescription) {
        this.contestId = contestId;
        this.contestName = contestName;
        this.contestDescription = contestDescription;
        this.status = status;
        this.candidates = candidates;
        this.electionId = electionId;
        this.ballotBox = ballotBox;
        this.showResults = showResults;
        this.contestLink = `${electionId}/${contestId}`;

        if (this.__isContract) {
            delete this.__isContract;
          }
          if (this.name) {
            delete this.name;
          }
        return this;
    }
    else {
       throw new Error('Election Contest could not be created');       
    }
  }
}

module.exports = AGMContest;