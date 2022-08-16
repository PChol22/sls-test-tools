"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _general = require("./general");

const DEFAULT_API_POLLING_DELAY_MS = 1000;

class StepFunctions {
  apiPollingDelay = DEFAULT_API_POLLING_DELAY_MS;

  async init(options = {}) {
    this.stepFunctions = new _general.AWSClient.StepFunctions();
    this.allStateMachines = await this.stepFunctions.listStateMachines().promise();
    const {
      apiPollingDelay
    } = options;

    if (apiPollingDelay !== undefined && apiPollingDelay > 0) {
      this.apiPollingDelay = apiPollingDelay;
    }
  }

  static async build(options = {}) {
    const stepFunction = new StepFunctions();
    await stepFunction.init(options);
    return stepFunction;
  } // eslint-disable-next-line max-params


  async runExecution(stateMachineName, input, options = {}) {
    const {
      apiPollingDelay
    } = options;
    const executionApiPollingDelay = apiPollingDelay !== undefined && apiPollingDelay > 0 ? apiPollingDelay : this.apiPollingDelay;

    if (this.allStateMachines === undefined) {
      throw new Error("The list of state machines is undefined. You might have forgotten to run build().");
    }

    const smList = this.allStateMachines.stateMachines.filter(stateMachine => stateMachine.name === stateMachineName);
    const stateMachineArn = smList[0].stateMachineArn;
    const executionParams = {
      stateMachineArn: stateMachineArn,
      input: JSON.stringify(input)
    };

    if (this.stepFunctions === undefined) {
      throw new Error("The Step Functions client is undefined. You might have forgotten to run build().");
    }

    const execution = await this.stepFunctions.startExecution(executionParams).promise();
    const listExecParams = {
      stateMachineArn: stateMachineArn
    };
    let executionList = await this.stepFunctions.listExecutions(listExecParams).promise(); // Poll until the given execution is no longer running

    while (executionList.executions.filter(exec => exec.executionArn === execution.executionArn && exec.status === "RUNNING").length !== 0) {
      executionList = await this.stepFunctions.listExecutions(listExecParams).promise(); // Wait before retrying to avoid throttle limits

      await new Promise(resolve => setTimeout(resolve, executionApiPollingDelay));
    }

    return await this.stepFunctions.describeExecution({
      executionArn: execution.executionArn
    }).promise();
  }

  async obtainStateMachineArn(stateMachineName) {
    const listStateMachineParams = {}; // Get all state machines

    if (this.stepFunctions === undefined) {
      throw new Error("The Step Functions client is undefined. You might have forgotten to run build().");
    }

    const allStateMachines = await this.stepFunctions.listStateMachines(listStateMachineParams).promise(); // Find state machine with specified name and get its arn

    const smList = allStateMachines.stateMachines.find(stateMachine => stateMachine.name === stateMachineName);
    if (smList == null) throw new Error("No matching state machine. ");
    return smList.stateMachineArn;
  }

  async obtainExecutionArn(StateMachineArn) {
    const listExecParams = {
      stateMachineArn: StateMachineArn
    };

    if (this.stepFunctions == null) {
      throw new Error("The Step Functions client is undefined. You might have forgotten to run build().");
    } // Get all executions for this stateMachine


    const executionList = await this.stepFunctions.listExecutions(listExecParams).promise();
    return executionList.executions[0].executionArn;
  }

}

exports.default = StepFunctions;
//# sourceMappingURL=stepFunctions.js.map