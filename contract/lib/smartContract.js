/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Election = require('./Election.js');
let User = require('./User.js');
const AGMContest = require('./AGMContest');
const BallotBox = require('./BallotBox.js');

class SmartContract extends Contract {

  async init(ctx) {

    //await this.deleteAllAssets(ctx)
    let adminUser = await new User('ao00577@surrey.ac.uk', 'thetobi1234', 'Tobi', 'Dada', 'Admin', 3)
    await ctx.stub.putState(adminUser.email, Buffer.from(JSON.stringify(adminUser)));
    return adminUser;
  }

  async changeElectionStatus(ctx, args) {
    const contestDetails = JSON.parse(args);
    try {
      const { electionId, contestId, change } = contestDetails
      const election = await this.getElection(ctx, electionId)
      if (election.error) {
        return ({ error: `Election ${electionId} does not exist` })
      }

      let { electionContests } = election
      let contest = electionContests[contestId]
      if (contest.status === 'ENDED') {
        return ({ message: `Election Contest: ${contestId} has ended so cannot be changed` })
      }
      else if (contest.status === 'OPEN' && change == 'OPEN') {
        return ({ message: `Election is already open` })
      }
      else if (contest.status === 'OPEN' && change == 'ENDED') {
        contest.status = change
        await this.updateContest(ctx, { election, contest })
        return ({ message: `Election Contest: ${contestId} has sucessfully been ended` })
      }
      else if (contest.status === 'CLOSED' && change == 'OPEN') {
        contest.status = change
        await this.updateContest(ctx, { election, contest })
        return ({ message: `Election Contest: ${contestId} has sucessfully been started` })
      }
      else{
        return ({ message: `Election Contest: ${contestId} could not be changed` })
      }

    }
    catch (error) {
      return ({ error: error.message })
    }
  }
  async showAGMResult(ctx, args) {
    const contestDetails = JSON.parse(args);

    try {
      const { electionId, contestId } = contestDetails
      const election = await this.getElection(ctx, electionId)
      if (election.error) {
        return ({ error: `Election ${electionId} does not exist` })
      }

      let { electionContests } = election
      let contest = electionContests[contestId]
      if (contest.status === 'ENDED' && contest.showResults === false) {
        contest.showResults = true
        await this.updateContest(ctx, { election, contest })
        return ({ message: `Results for election contest: ${contestId} has been released` })
      }
      else if (contest.status !== 'ENDED') {
        return ({ message: `Election Contest: ${contestId} must be ended before results can be shown` })
      }
      else if (contest.showResults === true) {
        return ({ message: `Results for election contest: ${contestId} have already been released` })
      }
    }
    catch (error) {
      return ({ error: error.message })
    }
  }
  async castVote(ctx, args) {

    const castDetails = JSON.parse(args);

    const { electionId, contestId, casterEmail, voteId } = castDetails
    const election = await this.getElection(ctx, electionId)
    if (election.error) {
      return ({ message: `Election ${electionId} does not exist` })
    }
    let { electionContests } = election
    let contest = electionContests[contestId]
    let { candidates } = contest
    let { ballotBox } = contest
    const { status } = contest
    let { votedStudents } = ballotBox
    let { ballots } = ballotBox
    if (status !== 'OPEN') {
      return ({ error: `Contest ${contestId} is not open` })
    }
    else if (status === 'OPEN') {
      if (await this.isValidVote(votedStudents, candidates, casterEmail, voteId)) {
        votedStudents.push(casterEmail)
        ballots.push({ casterEmail: casterEmail, voteId: voteId })
        const newBallot = await new BallotBox(electionId, contestId, votedStudents, ballots)
        contest['ballotBox'] = newBallot
        await this.updateContest(ctx, { election, contest })
        return ({ message: `User ${casterEmail} has voted` })
      }
      else {
        return ({ error: `User ${casterEmail} has already Voted` })
      }
    }
  }

  async isValidVote(votedStudents, candidates, casterEmail, voteId) {

    if (!votedStudents.includes(casterEmail)) {
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].id == voteId) {
          return true
        }
      }
    }
    return false

  }

  async getUser(ctx, args) {
    const resultAsString = await this.queryById(ctx, args)
    const result = JSON.parse(resultAsString)["allResults"][0]
    if (result) {
      const user = result['Record']
      return user
    }
    else {
      return ({ error: `User does not exist` })
    }
  }

  async createElection(ctx, args) {
    const electionDetails = JSON.parse(args);
    const electionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    try {
      const { electionName, electionDescription, electionType, startDate, endDate } = electionDetails
      const election = await new Election(electionId, electionName, electionDescription, electionType, startDate, endDate)
      await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));

      const response = ({
        electionId: election.electionId,
        message: 'Election ' + election.electionId + ' has been created'
      })

      return response
    }
    catch (error) {
      return ({ error: error.message })
    }

  }

  async userExist(ctx, email) {

    const buffer = await ctx.stub.getState(email.toUpperCase());
    return (!!buffer && buffer.length > 0);

  }

  async createUser(ctx, args) {
    const userDetails = JSON.parse(args);
    const { email, password, firstName, lastName, userType, privilege } = userDetails
    const exist = await this.userExist(ctx, email)
    if (exist) {
      return ({
        email: email,
        message: 'User ' + email + ' cannot be create because the email already exists'
      })
    }
    const user = await new User(email, password, firstName, lastName, userType, privilege)
    await ctx.stub.putState(user.email, Buffer.from(JSON.stringify(user)));

    return ({
      email: user.email,
      message: 'User ' + user.email + ' has been created'
    })

  }

  async createAGMContest(ctx, args) {

    const contestDetails = JSON.parse(args);
    const contestId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    try {
      const { contestName, contestDescription, candidates, electionId } = contestDetails
      const ballotBox = await new BallotBox(electionId, contestId)
      let contest = await new AGMContest(contestId, contestName, contestDescription, candidates, electionId, ballotBox)

      const election = await this.getElection(ctx, electionId)
      if (election.error) {
        return ({ message: `Election ${electionId} does not exist` })
      }
      await this.updateContest(ctx, { election, contest })
      const response = ({ message: 'AGM Contest ' + contest.contestId + ' has been created' })
      return response
    }
    catch (error) {
      return ({ error: error.message })
    }
  }

  async getElection(ctx, electionId) {

    const queryParms = { objectType: "Election", id: electionId, isInternal: true }
    const resultsAsString = await this.queryById(ctx, queryParms)
    const result = JSON.parse(resultsAsString)["allResults"][0]
    if (result) {
      const election = result['Record']
      return election
    }
    else {
      return ({ error: `Election ${electionId} does not exist` })
    }
  }

  async deleteElection(ctx, args) {

    const parseArgs = JSON.parse(args)
    const { electionId } = parseArgs

    await ctx.stub.deleteState(electionId)
    return ({ isDelete: true })
  }

  async deleteUser(ctx, args) {

    const parseArgs = JSON.parse(args)
    const { email } = parseArgs

    await ctx.stub.deleteState(email)
    return ({ isDelete: true })
  }

  async deleteElectionContest(ctx, args) {

    const parseArgs = JSON.parse(args)
    const { electionId, contestId } = parseArgs
    const election = await this.getElection(ctx, electionId)
    const { electionName, electionDescription, electionType, startDate, endDate, electionContests } = election
    const newElectionContests = await this._objectWithoutProperties(electionContests, [contestId])

    const newElection = await new Election(electionId, electionName, electionDescription, electionType, startDate, endDate, newElectionContests)
    await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(newElection)));

    return ({ isDelete: true })
  }

  async _objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }
    return target;
  }



  async getElectionContest(ctx, args) {

    const parseArgs = JSON.parse(args)

    const { electionId, contestId } = parseArgs
    const election = await this.getElection(ctx, electionId)
    if (election.error) {
      return ({ error: election.error })
    }
    const { electionContests } = election
    const contests = electionContests[contestId]

    return ({ electionContest: contests })

  }

  async getAllElections(ctx) {

    let elections = []
    const queryParms = { objectType: "Election", isInternal: true }
    const resultsAsString = await this.queryByObject(ctx, queryParms)
    const results = JSON.parse(resultsAsString)["allResults"]
    for (let i = 0; i < results.length; i++) {
      const election = results[i]['Record']
      elections.push(election)
    }
    if (elections) {
      return ({ elections: elections })
    }
  }

  async getAllUsers(ctx) {

    let users = []
    const queryParms = { objectType: "User", isInternal: true }
    const resultsAsString = await this.queryByObject(ctx, queryParms)
    const results = JSON.parse(resultsAsString)["allResults"]
    for (let i = 0; i < results.length; i++) {
      const user = results[i]['Record']
      delete user.password;
      users.push(user)
    }
    if (users) {
      return ({ users: users })
    }
  }

  async updateBallot(ctx, args) {
    const { election, contest } = args
    let { electionContests } = election
    electionContests['contestId'] = contest
  }

  async updateContest(ctx, args) {
    const { election, contest } = args
    const { contestId } = contest
    const { electionId, electionName, electionDescription, electionType, startDate, endDate } = election
    let { electionContests } = election
    electionContests[contestId] = contest

    let newElection = await new Election(electionId, electionName, electionDescription, electionType, startDate, endDate, electionContests)
    await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(newElection)));

  }

  async updateCreatedContest(ctx, args) {
    const contestDetails = JSON.parse(args)

    try {
      const { contestId, contestName, contestDescription, candidates, electionId } = contestDetails
      const ballotBox = await new BallotBox(electionId, contestId)
      let contest = await new AGMContest(contestId, contestName, contestDescription, candidates, electionId, ballotBox)

      const election = await this.getElection(ctx, electionId)
      if (election.error) {
        return ({ message: `Election ${electionId} does not exist` })
      }
      await this.updateContest(ctx, { election, contest })
      const response = ({
        contestId: contest.contestId,
        message: 'AGM Contest ' + contest.contestId + ' has been updated'
      })
      return response
    }
    catch (error) {
      return ({ error: error.message })
    }
  }

  async updateCreatedElection(ctx, args) {
    const electionDetails = JSON.parse(args);

    try {
      const { electionId, electionName, electionDescription, electionType, startDate, endDate } = electionDetails
      let election = await new Election(electionId, electionName, electionDescription, electionType, startDate, endDate)
      const orginalElection = await this.getElection(ctx, electionId)
      const { electionContests } = orginalElection
      await this.addContest(ctx, { election, electionContests })
      const response = ({
        electionId: election.electionId,
        message: 'Election ' + election.electionId + ' has been updated'
      })

      return response
    }
    catch (error) {
      return ({ error: error.message })
    }
  }

  async updateCreatedUser(ctx, args) {
    const userDetails = JSON.parse(args);

    try {
      const { email, password, firstName, lastName, userType, privilege } = userDetails
      const exist = await this.userExist(ctx, email)
      if(!exist){
        return ({
          email: email,
          message: 'User ' + email + ' does not exist (you cannot change the email of a user)'
        })
      }
      const newUser = await new User(email, password, firstName, lastName, userType, privilege)

      await ctx.stub.putState(email, Buffer.from(JSON.stringify(newUser)));

      return ({
        email: email,
        message: 'User ' + email + ' has been updated'
      })
    }
    catch (error) {
      return ({ error: error.message })
    }
  }

  async addContest(ctx, args) {

    const { election, electionContests } = args
    const { electionId, electionName, electionDescription, electionType, startDate, endDate } = election

    let newElection = await new Election(electionId, electionName, electionDescription, electionType, startDate, endDate, electionContests)
    await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(newElection)));

  }

  async queryById(ctx, args) {
    const { isInternal } = args

    const queryData = (isInternal) ? args : JSON.parse(args)
    const { objectType, id } = queryData
    let queryString = {}
    if (!id) {
      return ({ allResults: [] })
    }

    if (objectType == 'User') {
      queryString = {
        selector: {
          objectType: objectType,
          email: id
        }
      };
    }

    else if (objectType == 'Election') {
      queryString = {
        selector: {
          objectType: objectType,
          electionId: id
        }
      }
    }
    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));

    return queryResults;
  }
  async queryByObject(ctx, args) {

    const { isInternal } = args
    const queryData = (isInternal) ? args : JSON.parse(args)
    const { objectType } = queryData
    let queryString = {}

    if (objectType == 'User') {
      queryString = {
        selector: {
          objectType: objectType
        }
      };
    }

    else if (objectType == 'Election') {
      queryString = {
        selector: {
          objectType: objectType
        }
      }
    }
    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));

    return queryResults;
  }

  async queryWithQueryString(ctx, queryString) {

    console.log('query String');
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);

    let allResults = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await resultsIterator.close();
        console.info(allResults);
        console.log(JSON.stringify(allResults));
        return JSON.stringify({ allResults: allResults });
      }
    }
  }

  async queryAll(ctx) {

    let queryString = {
      selector: {}
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }

  async deleteAllAssets(ctx) {

    const queryResults = await this.queryAll(ctx)
    const allData = await JSON.parse(queryResults)["allResults"]
    for (var i = 0; i < allData.length; i++) {
      let data = allData[i]['Key']
      await ctx.stub.deleteState(data);
    }
  }
}

module.exports = SmartContract;