import { StepFunctions as AWSStepFunctions } from "aws-sdk";
import { AWSClient } from "./general";

const API_POLLING_DELAY_MS = 1000;

export default class StepFunctions {
  stepFunctions: AWSStepFunctions | undefined;
  allStateMachines: AWSStepFunctions.ListStateMachinesOutput | undefined;

  async init(): Promise<void> {
    this.stepFunctions = new AWSClient.StepFunctions();
    this.allStateMachines = await this.stepFunctions
      .listStateMachines()
      .promise();
  }

  static async build(): Promise<StepFunctions> {
    const stepFunction = new StepFunctions();
    await stepFunction.init();

    return stepFunction;
  }

  async runExecution(
    stateMachineName: string,
    input: unknown
  ): Promise<AWSStepFunctions.DescribeExecutionOutput> {
    if (this.allStateMachines === undefined) {
      throw new Error(
        "The list of state machines is undefined. You might have forgotten to run build()."
      );
    }
    const smList = this.allStateMachines.stateMachines.filter(
      (stateMachine: AWSStepFunctions.StateMachineListItem) =>
        stateMachine.name === stateMachineName
    );
    const stateMachineArn = smList[0].stateMachineArn;
    const executionParams = {
      stateMachineArn: stateMachineArn,
      input: JSON.stringify(input),
    };
    if (this.stepFunctions === undefined) {
      throw new Error(
        "The Step Functions client is undefined. You might have forgotten to run build()."
      );
    }
    const execution: AWSStepFunctions.StartExecutionOutput =
      await this.stepFunctions.startExecution(executionParams).promise();
    const listExecParams = { stateMachineArn: stateMachineArn };
    let executionList = await this.stepFunctions
      .listExecutions(listExecParams)
      .promise();
    // Poll until the given execution is no longer running
    while (
      executionList.executions.filter(
        (exec: AWSStepFunctions.ExecutionListItem) =>
          exec.executionArn === execution.executionArn &&
          exec.status === "RUNNING"
      ).length !== 0
    ) {
      executionList = await this.stepFunctions
        .listExecutions(listExecParams)
        .promise();

      // Wait before retrying to avoid throttle limits
      await new Promise((resolve) => setTimeout(resolve, API_POLLING_DELAY_MS));
    }

    return await this.stepFunctions
      .describeExecution({ executionArn: execution.executionArn })
      .promise();
  }

  async obtainStateMachineArn(stateMachineName: string): Promise<string> {
    const listStateMachineParams = {};
    // Get all state machines
    if (this.stepFunctions === undefined) {
      throw new Error(
        "The Step Functions client is undefined. You might have forgotten to run build()."
      );
    }
    const allStateMachines = await this.stepFunctions
      .listStateMachines(listStateMachineParams)
      .promise();
    // Find state machine with specified name and get its arn
    const smList = allStateMachines.stateMachines.find(
      (stateMachine: AWSStepFunctions.StateMachineListItem) =>
        stateMachine.name === stateMachineName
    );
    if (smList == null) throw new Error("No matching state machine. ");

    return smList.stateMachineArn;
  }

  async obtainExecutionArn(StateMachineArn: string): Promise<string> {
    const listExecParams = { stateMachineArn: StateMachineArn };
    if (this.stepFunctions == null) {
      throw new Error(
        "The Step Functions client is undefined. You might have forgotten to run build()."
      );
    }

    // Get all executions for this stateMachine
    const executionList = await this.stepFunctions
      .listExecutions(listExecParams)
      .promise();

    return executionList.executions[0].executionArn;
  }
}
