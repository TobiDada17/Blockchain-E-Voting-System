'use strict'

class BallotBox {

constructor( electionId, contestId, votedStudents=[], ballots=[]  ) {
    
    if (electionId && contestId ) {
        this.electionId = electionId;
        this.contestId = contestId;
        this.votedStudents = votedStudents;
        this.ballots = ballots;
       if (this.__isContract) {
           delete this.__isContract;
         }
          if (this.name) {
            delete this.name;
          }
        return this;

    }
    else{
        throw new Error('Ballot Box could not be created');       
    }

}


}

module.exports = BallotBox;